/**
 * Apache Log Viewer
 *
 * Loads, filters, sorts and analyzes Apache log files.
 * Parsing lives in parser.js (shared with log-worker.js).
 *
 * Perf note: big arrays (logs, filteredLogs) are Object.freeze()d before being
 * stored in the component, so Alpine does not wrap each of their entries in a Proxy.
 */

const emptyStatistics = () => ({
    totalRequests: 0,
    uniqueIPs: 0,
    requestMethods: {},
    httpStatuses: {},
    topIPs: [],
    topURLs: [],
    browserFamilies: {},
    operatingSystems: {},
    errorRate: 0,
    averageResponseSize: 0,
    totalBytes: 0
});

// Date as YYYY-MM-DD in the user's local time zone (what <input type="date"> uses)
const localDate = (d) => new Date(d).toLocaleDateString('sv-SE');

// "HH:MM" -> minutes since midnight, or null
const toMinutes = (hhmm) => {
    if (!hhmm) return null;
    const [h, m] = hhmm.split(':').map(Number);
    return h * 60 + m;
};

const yieldToBrowser = () => new Promise(resolve => setTimeout(resolve));

function apacheLogViewer() {
    return {
        // Data state
        logs: [],               // All processed logs
        filteredLogs: [],       // Logs matching the current filters, already sorted
        paginatedLogs: [],      // Logs for the current page
        selectedLog: null,      // Log selected for detail view

        // File state
        fileName: '',
        fileSize: '',
        isProcessing: false,
        processProgress: 0,     // 0-100

        // Filter state
        searchQuery: '',
        activeFilters: [],      // [{ column, value, type: 'include' | 'exclude' }]
        uniqueStatusCodes: [],
        uniqueMethods: [],

        // Date range filter
        dateFrom: '',           // YYYY-MM-DD
        dateTo: '',
        timeFrom: '',           // HH:MM
        timeTo: '',
        dateFilterExpanded: false,
        logDateRange: { min: null, max: null, minStr: '', maxStr: '' },

        // Sort state
        sortField: 'datetime',
        sortAsc: false,

        // Pagination state
        currentPage: 1,
        perPage: 100,
        totalPages: 1,
        availablePageSizes: pageSizeOptions, // From translations.js

        // IP info cache (reverse lookup + geo)
        ipInfoCache: {},

        // Loading states for UI feedback
        isFiltering: false,
        isSorting: false,
        isPaginating: false,    // kept for the template; page changes are instant now
        currentOperation: '',

        // Language settings
        language: 'en',
        t: {},

        // Statistics
        statistics: emptyStatistics(),
        statisticsVisible: false,
        calculatingStatistics: false,

        // PWA (the service worker itself is registered in index.html)
        appVersion: '',
        updateAvailable: false,

        init() {
            this.detectLanguage();
            this.loadTranslations();

            // Drag and drop: forward the dropped file to the file input
            const dropZone = document.querySelector('label[for="file-upload"]');
            const stop = (e) => { e.preventDefault(); e.stopPropagation(); };
            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(name => {
                dropZone.addEventListener(name, stop);
                document.body.addEventListener(name, stop);
            });
            ['dragenter', 'dragover'].forEach(name => dropZone.addEventListener(name, () => dropZone.classList.add('drag-over')));
            ['dragleave', 'drop'].forEach(name => dropZone.addEventListener(name, () => dropZone.classList.remove('drag-over')));
            dropZone.addEventListener('drop', (e) => {
                if (!e.dataTransfer.files.length) return;
                const fileInput = document.getElementById('file-upload');
                fileInput.files = e.dataTransfer.files;
                fileInput.dispatchEvent(new Event('change', { bubbles: true }));
            });

            this.$watch('currentPage', () => this.updatePagination());
            this.$watch('perPage', () => this.updatePagination());
        },

        // ---------------------------------------------------------------- i18n

        detectLanguage() {
            const urlLang = new URLSearchParams(window.location.search).get('lang');
            const saved = localStorage.getItem('preferred-language');
            const browser = (navigator.language || '').split('-')[0];
            this.language = [urlLang, saved, browser].find(l => l && translations[l]) || 'en';
            localStorage.setItem('preferred-language', this.language);
        },

        loadTranslations() {
            this.t = translations[this.language] || translations.en || {};
        },

        changeLanguage(lang) {
            if (translations[lang]) {
                this.language = lang;
                localStorage.setItem('preferred-language', lang);
                this.loadTranslations();
            }
        },

        // Translate a key (dot notation supported); returns fallback or the key when missing
        translate(key, fallback = null) {
            let result = this.t;
            for (const k of key.split('.')) {
                if (result && typeof result === 'object' && k in result) result = result[k];
                else return fallback || key;
            }
            return result || fallback || key;
        },

        // ---------------------------------------------------------- file loading

        handleFileUpload(event) {
            const input = event.target;
            const file = input.files[0];
            if (!file) {
                input.value = '';
                return;
            }

            if (file.size > 50 * 1024 * 1024) {
                const message = `${this.formatFileSize(file.size)}\n${this.translate('largeSizeWarning')}`;
                if (!confirm(message)) {
                    input.value = '';
                    return;
                }
            }

            this.fileName = file.name;
            this.fileSize = this.formatFileSize(file.size);
            this.isProcessing = true;
            this.processProgress = 0;
            this.logs = [];
            this.filteredLogs = [];
            this.paginatedLogs = [];
            this.selectedLog = null;
            this.uniqueStatusCodes = [];
            this.uniqueMethods = [];
            this.statistics = emptyStatistics();
            this.currentPage = 1;
            this.ipInfoCache = {};
            this.adjustPageSizeForFileSize(file.size / (1024 * 1024));

            this.loadFile(file)
                .catch((error) => {
                    console.error('Error loading file:', error);
                    this.isProcessing = false;
                    alert(this.translate('fileReadError'));
                })
                .finally(() => { input.value = ''; }); // allows selecting the same file again
        },

        adjustPageSizeForFileSize(sizeMB) {
            this.perPage = sizeMB > 100 ? 50 : sizeMB > 50 ? 100 : sizeMB > 10 ? 250 : 500;
        },

        async loadFile(file) {
            const logs = [];
            try {
                await this.parseInWorker(file, logs);
            } catch (error) {
                // e.g. page opened from file:// where workers are blocked
                console.warn('Worker parsing failed, parsing on the main thread:', error);
                logs.length = 0;
                await this.parseOnMainThread(file, logs);
            }
            this.finishLoad(logs);
        },

        parseInWorker(file, logs) {
            return new Promise((resolve, reject) => {
                const worker = new Worker('js/log-worker.js');
                worker.onmessage = ({ data }) => {
                    if (data.error || data.done) {
                        worker.terminate();
                        data.error ? reject(new Error(data.error)) : resolve();
                        return;
                    }
                    for (const entry of data.logs) logs.push(entry);
                    this.processProgress = data.progress;
                };
                worker.onerror = (error) => {
                    worker.terminate();
                    reject(error);
                };
                worker.postMessage(file);
            });
        },

        async parseOnMainThread(file, logs) {
            const lines = (await file.text()).split(/\r?\n/);
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                if (line && line[0] !== '#') {
                    const entry = ApacheParser.parseLine(line, i + 1);
                    if (entry) logs.push(entry);
                }
                if (i % 20000 === 0) {
                    this.processProgress = Math.round((i / lines.length) * 100);
                    await yieldToBrowser();
                }
            }
        },

        finishLoad(logs) {
            const statuses = new Set();
            const methods = new Set();
            for (const log of logs) {
                if (log.status) statuses.add(log.status);
                if (log.method !== '-') methods.add(log.method);
            }
            this.logs = Object.freeze(logs);
            this.uniqueStatusCodes = [...statuses].sort((a, b) => a - b);
            this.uniqueMethods = [...methods].sort();
            this.calculateLogDateRange();

            this.isProcessing = false;
            this.processProgress = 100;
            this.applyFilters();

            if (logs.length === 0) alert(this.translate('noValidLogs'));
        },

        // --------------------------------------------------- filter / sort / page

        // Filter -> sort -> paginate. Debounced so rapid changes run once.
        applyFilters() {
            this.isFiltering = true;
            this.currentOperation = this.translate('filtering');
            if (this.hasActiveDateFilter()) this.dateFilterExpanded = true;

            clearTimeout(this._filterTimer);
            this._filterTimer = setTimeout(() => { // lets the spinner paint first
                try {
                    const matches = this.buildFilter();
                    const result = matches ? this.logs.filter(matches) : this.logs.slice();
                    this.filteredLogs = Object.freeze(this.sortLogs(result));
                    this.currentPage = 1;
                    this.updatePagination();
                    if (this.statisticsVisible) this.calculateFilteredStatisticsAsync();
                } finally {
                    this.isFiltering = false;
                    this.currentOperation = '';
                }
            }, 50);
        },

        // Compiles search, column filters and date range into one predicate (null = no filtering)
        buildFilter() {
            const include = {};   // column -> [lowercase values]; OR within a column, AND across columns
            const exclude = [];   // [column, lowercase value]
            for (const f of this.activeFilters) {
                const value = String(f.value).toLowerCase();
                if (f.type === 'exclude') exclude.push([f.column, value]);
                else (include[f.column] ||= []).push(value);
            }
            const includeEntries = Object.entries(include);
            const terms = this.searchQuery.toLowerCase().split(/\s+/).filter(Boolean);

            // With a date, the time of day is part of the bound; with only a time, it is a daily window
            const from = this.dateFrom ? new Date(`${this.dateFrom}T${this.timeFrom || '00:00'}:00`).getTime() : null;
            const to = this.dateTo ? new Date(`${this.dateTo}T${this.timeTo || '23:59'}:59.999`).getTime() : null;
            const dayFrom = this.dateFrom ? null : toMinutes(this.timeFrom);
            const dayTo = this.dateTo ? null : toMinutes(this.timeTo);

            if (!includeEntries.length && !exclude.length && !terms.length &&
                from === null && to === null && dayFrom === null && dayTo === null) {
                return null;
            }

            const text = (log, column) => String(log[column] ?? '').toLowerCase();
            return (log) => {
                for (const [column, values] of includeEntries) {
                    const v = text(log, column);
                    if (!values.some(x => v.includes(x))) return false;
                }
                for (const [column, value] of exclude) {
                    if (text(log, column).includes(value)) return false;
                }
                if (terms.length) {
                    const haystack = `${log.ip} ${log.method} ${log.url} ${log.status} ${log.userAgent} ${log.referer}`.toLowerCase();
                    if (!terms.every(t => haystack.includes(t))) return false;
                }
                if (from !== null && log.datetime < from) return false;
                if (to !== null && log.datetime > to) return false;
                if (dayFrom !== null || dayTo !== null) {
                    const d = new Date(log.datetime);
                    const minutes = d.getHours() * 60 + d.getMinutes();
                    if (dayFrom !== null && minutes < dayFrom) return false;
                    if (dayTo !== null && minutes > dayTo) return false;
                }
                return true;
            };
        },

        // Sorts the array in place by the current sort field/direction
        sortLogs(array) {
            const field = this.sortField;
            const dir = this.sortAsc ? 1 : -1;
            return array.sort((a, b) => (a[field] < b[field] ? -dir : a[field] > b[field] ? dir : 0));
        },

        // Header click: sort by field, toggling direction when it is already the sort field
        sortBy(field) {
            if (this.sortField === field) {
                this.sortAsc = !this.sortAsc;
            } else {
                this.sortField = field;
                this.sortAsc = field !== 'datetime'; // newest first for dates, A-Z for the rest
            }
            this.isSorting = true;
            this.currentOperation = this.translate('sorting');
            setTimeout(() => { // lets the spinner paint first
                try {
                    this.filteredLogs = Object.freeze(this.sortLogs(this.filteredLogs.slice()));
                    this.updatePagination();
                } finally {
                    this.isSorting = false;
                    this.currentOperation = '';
                }
            }, 50);
        },

        updatePagination() {
            const perPage = Number(this.perPage);
            this.totalPages = Math.max(1, Math.ceil(this.filteredLogs.length / perPage));
            this.currentPage = Math.min(Math.max(1, this.currentPage), this.totalPages);
            const start = (this.currentPage - 1) * perPage;
            this.paginatedLogs = this.filteredLogs.slice(start, start + perPage);
        },

        changePageSize(size) {
            this.perPage = parseInt(size, 10);
            this.currentPage = 1;
            this.updatePagination();
        },

        // currentPage is watched in init(), so setting it re-paginates
        goToPage(page) {
            if (page >= 1 && page <= this.totalPages) this.currentPage = page;
        },
        nextPage() { this.goToPage(this.currentPage + 1); },
        prevPage() { this.goToPage(this.currentPage - 1); },

        addFilter(column, value, type = 'include') {
            const stringValue = String(value);
            const exists = this.activeFilters.some(f => f.column === column && f.value === stringValue && f.type === type);
            if (!exists) {
                this.activeFilters.push({ column, value: stringValue, type });
                this.applyFilters();
                this.selectedLog = null; // Close details modal
            }
        },

        addExcludeFilter(column, value) {
            this.addFilter(column, value, 'exclude');
        },

        removeFilter(index) {
            this.activeFilters.splice(index, 1);
            this.applyFilters();
        },

        clearAllFilters() {
            this.activeFilters = [];
            this.searchQuery = '';
            this.clearDateFilter();
        },

        // ------------------------------------------------------------ date filter

        hasActiveDateFilter() {
            return !!(this.dateFrom || this.dateTo || this.timeFrom || this.timeTo);
        },

        toggleDateFilter() {
            this.dateFilterExpanded = !this.dateFilterExpanded;
        },

        clearDateFilter() {
            this.dateFrom = this.dateTo = this.timeFrom = this.timeTo = '';
            this.applyFilters();
        },

        // Whole days, relative to today: [fromDaysAgo, toDaysAgo]
        setDateRange(fromDaysAgo, toDaysAgo) {
            const day = (n) => {
                const d = new Date();
                d.setDate(d.getDate() - n);
                return localDate(d);
            };
            this.dateFrom = day(fromDaysAgo);
            this.dateTo = day(toDaysAgo);
            this.timeFrom = this.timeTo = '';
            this.applyFilters();
        },
        setDateRangeToday() { this.setDateRange(0, 0); },
        setDateRangeYesterday() { this.setDateRange(1, 1); },
        setDateRangeLast7Days() { this.setDateRange(7, 0); },
        setDateRangeLast30Days() { this.setDateRange(30, 0); },

        setDateRangeToAll() {
            if (this.logDateRange.min) {
                this.dateFrom = this.logDateRange.minStr;
                this.dateTo = this.logDateRange.maxStr;
                this.timeFrom = this.timeTo = '';
                this.applyFilters();
            }
        },

        calculateLogDateRange() {
            let min = Infinity;
            let max = -Infinity;
            for (const log of this.logs) {
                if (!log.datetime) continue; // 0 = unparseable date
                if (log.datetime < min) min = log.datetime;
                if (log.datetime > max) max = log.datetime;
            }
            this.logDateRange = min === Infinity
                ? { min: null, max: null, minStr: '', maxStr: '' }
                : { min: new Date(min), max: new Date(max), minStr: localDate(min), maxStr: localDate(max) };
        },

        // ---------------------------------------------------------------- details

        showLogDetails(log) {
            this.selectedLog = log;
            this.getIpInfo(log.ip, 'high');
        },

        // Returns cached info for an IP, queueing a lookup if needed
        getIpInfo(ip, priority = 'low') {
            const cached = this.ipInfoCache[ip];
            if (cached && (cached.loading || Date.now() - cached.timestamp < 24 * 60 * 60 * 1000)) {
                return cached;
            }
            this.ipInfoCache[ip] = { loading: false, hostname: null, geo: null, timestamp: Date.now() };
            this.queueIPInfoRequest(ip, priority);
            return this.ipInfoCache[ip];
        },

        // Lookups run in small batches with a pause between them to avoid rate limiting
        queueIPInfoRequest(ip, priority) {
            this.ipInfoQueue ||= { high: [], low: [], processing: false, batchSize: 5, delay: 1000 };
            const queue = this.ipInfoQueue[priority] || this.ipInfoQueue.low;
            if (!queue.includes(ip)) queue.push(ip);
            if (!this.ipInfoQueue.processing) this.processIPInfoQueue();
        },

        async processIPInfoQueue() {
            const q = this.ipInfoQueue;
            q.processing = true;
            try {
                while (q.high.length || q.low.length) {
                    const batch = q.high.splice(0, q.batchSize);
                    batch.push(...q.low.splice(0, q.batchSize - batch.length));
                    await Promise.allSettled(batch.map(ip => this.fetchSingleIPInfo(ip)));
                    if (q.high.length || q.low.length) await new Promise(r => setTimeout(r, q.delay));
                }
            } finally {
                q.processing = false;
            }
        },

        async fetchSingleIPInfo(ip) {
            const info = this.ipInfoCache[ip];
            if (!info) return;
            info.loading = true;
            try {
                await Promise.allSettled([this.fetchGeoIP(ip), this.fetchHostname(ip)]);
                info.timestamp = Date.now();
            } finally {
                info.loading = false;
            }
        },

        async fetchGeoIP(ip) {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 5000);
            try {
                const response = await fetch(`https://ipapi.co/${encodeURIComponent(ip)}/json/`, { signal: controller.signal });
                const data = response.ok ? await response.json() : null;
                if (data && !data.error) {
                    this.ipInfoCache[ip].geo = {
                        country: data.country_code || '',
                        countryName: data.country_name || 'Unknown',
                        region: data.region || '-',
                        city: data.city || '-',
                        org: data.org || '-'
                    };
                }
            } catch (error) {
                if (error.name !== 'AbortError') console.warn(`Geo lookup failed for ${ip}:`, error.message);
            } finally {
                clearTimeout(timeout);
            }
        },

        // shortcut: reverse DNS only for IPv4, add ip6.arpa nibbles if IPv6 hostnames matter
        async fetchHostname(ip) {
            if (!/^\d+\.\d+\.\d+\.\d+$/.test(ip)) return;
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 3000);
            try {
                const name = `${ip.split('.').reverse().join('.')}.in-addr.arpa`;
                const response = await fetch(`https://dns.google/resolve?name=${name}&type=PTR`, { signal: controller.signal });
                const data = response.ok ? await response.json() : null;
                if (data?.Answer?.length) this.ipInfoCache[ip].hostname = data.Answer[0].data.replace(/\.$/, '');
            } catch (error) {
                if (error.name !== 'AbortError') console.warn(`Reverse lookup failed for ${ip}:`, error.message);
            } finally {
                clearTimeout(timeout);
            }
        },

        getCountryFlag(countryCode) {
            return countryFlags[countryCode] || '🏴‍☠️';
        },

        getAbuseIPDBUrl(ip) {
            return `https://www.abuseipdb.com/check/${encodeURIComponent(ip)}`;
        },

        getStatusCodeDescription(code) {
            return httpStatusCodes[code] || 'Unknown Status';
        },

        getStatusCodeCategory(code) {
            if (code >= 100 && code < 200) return this.t.statusInfo;
            if (code >= 200 && code < 300) return this.t.statusSuccess;
            if (code >= 300 && code < 400) return this.t.statusRedirect;
            if (code >= 400 && code < 500) return this.t.statusClientError;
            if (code >= 500) return this.t.statusServerError;
            return '';
        },

        // ------------------------------------------------------------- formatting

        // datetime is epoch ms; 0 means unknown
        formatDateTime(datetime) {
            if (!datetime) return '';
            return new Date(datetime).toLocaleString(this.language, {
                year: 'numeric', month: '2-digit', day: '2-digit',
                hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
            });
        },

        formatFileSize(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        },

        // Alias used in templates
        formatBytes(bytes) {
            return this.formatFileSize(bytes);
        },

        formatPercentage(value, total) {
            if (total === 0) return '0%';
            return ((value / total) * 100).toFixed(1) + '%';
        },

        // Up to 5 page numbers around the current page
        get paginationPages() {
            const size = Math.min(5, this.totalPages);
            const start = Math.max(1, Math.min(this.currentPage - 2, this.totalPages - size + 1));
            return Array.from({ length: size }, (_, i) => start + i);
        },

        // ------------------------------------------------------------- statistics

        // Statistics of what is currently shown (all logs when no filter is active)
        async calculateFilteredStatisticsAsync() {
            const run = this._statsRun = (this._statsRun || 0) + 1; // only the latest run may publish
            this.calculatingStatistics = true;
            await yieldToBrowser(); // let the spinner paint

            try {
                const logs = this.filteredLogs;
                if (logs.length === 0) {
                    this.statistics = emptyStatistics();
                    return;
                }

                const ips = {}, urls = {}, methods = {}, statuses = {}, browsers = {}, systems = {};
                const agents = new Map(); // user agent -> [browser, os]; there are few distinct ones
                const count = (map, key) => { map[key] = (map[key] || 0) + 1; };
                let totalBytes = 0;
                let errors = 0;

                for (let i = 0; i < logs.length; i++) {
                    const log = logs[i];
                    count(ips, log.ip);
                    count(urls, log.url);
                    count(methods, log.method);
                    count(statuses, log.status);
                    totalBytes += log.bytes;
                    if (log.status >= 400) errors++;

                    let agent = agents.get(log.userAgent);
                    if (!agent) {
                        agent = [this.detectBrowserFamily(log.userAgent), this.detectOperatingSystem(log.userAgent)];
                        agents.set(log.userAgent, agent);
                    }
                    count(browsers, agent[0]);
                    count(systems, agent[1]);

                    if (i % 50000 === 49999) await yieldToBrowser();
                }
                if (run !== this._statsRun) return;

                const top = (counts, key) => Object.entries(counts)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 10)
                    .map(([k, count]) => ({ [key]: k, count }));

                this.statistics = {
                    totalRequests: logs.length,
                    uniqueIPs: Object.keys(ips).length,
                    requestMethods: methods,
                    httpStatuses: statuses,
                    topIPs: top(ips, 'ip'),
                    topURLs: top(urls, 'url'),
                    browserFamilies: browsers,
                    operatingSystems: systems,
                    errorRate: ((errors / logs.length) * 100).toFixed(2),
                    averageResponseSize: totalBytes / logs.length,
                    totalBytes
                };
            } catch (error) {
                console.error('Error calculating statistics:', error);
                this.statistics = emptyStatistics();
            } finally {
                if (run === this._statsRun) this.calculatingStatistics = false;
            }
        },

        detectBrowserFamily(userAgent) {
            if (!userAgent) return this.translate('unknown');
            const ua = userAgent.toLowerCase();

            if (/bot|crawler|spider|scraper|wget|curl/.test(ua)) return this.translate('bot');
            if (ua.includes('edg/') || ua.includes('edge')) return this.translate('edge');
            if (ua.includes('opera') || ua.includes('opr/')) return this.translate('opera'); // before chrome: Opera UAs contain "Chrome"
            if (ua.includes('chrome')) return this.translate('chrome');
            if (ua.includes('firefox')) return this.translate('firefox');
            if (ua.includes('safari')) return this.translate('safari');
            return this.translate('other');
        },

        detectOperatingSystem(userAgent) {
            if (!userAgent) return this.translate('unknown');
            const ua = userAgent.toLowerCase();

            if (ua.includes('windows nt')) return this.translate('windows');
            if (ua.includes('iphone') || ua.includes('ipad')) return this.translate('ios'); // before mac: iOS UAs contain "like Mac OS X"
            if (ua.includes('mac os x') || ua.includes('macos')) return this.translate('macos');
            if (ua.includes('android')) return this.translate('android'); // before linux: Android UAs contain "Linux"
            if (ua.includes('linux')) return this.translate('linux');
            return this.translate('unknown');
        },

        async toggleStatistics() {
            this.statisticsVisible = !this.statisticsVisible;
            if (this.statisticsVisible) await this.calculateFilteredStatisticsAsync();
        },

        // Reload so the new service worker's files are used (called from the update button)
        updateApp() {
            window.location.reload();
        }
    };
}
