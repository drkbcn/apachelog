/**
 * Apache Log Viewer
 * 
 * This script enables loading, processing and analyzing Apache log files
 * with features like filtering, sorting, and data analysis.
 */

function apacheLogViewer() {
    return {
        // Data state
        logs: [],               // All processed logs
        filteredLogs: [],       // Logs filtered by current criteria
        paginatedLogs: [],      // Logs for the current page
        selectedLog: null,      // Log selected for detail view
        
        // File state
        fileName: '',           // Name of loaded file
        fileSize: '',           // File size in readable format
        isProcessing: false,    // Indicates if a file is being processed
        processProgress: 0,     // Processing progress (0-100)
        
        // Filter state
        searchQuery: '',        // Global search query
        activeFilters: [],      // Currently applied filters
        uniqueStatusCodes: [],  // Available status codes in the loaded logs
        uniqueMethods: [],      // Available HTTP methods in the loaded logs
        
        // Sort state
        sortField: 'datetime',  // Field by which logs are sorted
        sortAsc: false,         // Sort direction (asc/desc)
        
        // Pagination state
        currentPage: 1,         // Current page
        perPage: 500,           // Items per page (default: 500)
        totalPages: 1,          // Total pages
        availablePageSizes: pageSizeOptions, // From translations.js
        
        // IP info cache
        ipInfoCache: {},        // Cache for IP information (reverse lookup, geo, abuse)
        
        // Language settings
        language: 'en',         // Default language
        t: {},                  // Translations object
        
        // Initialization
        init() {
            // Set up translations
            this.detectLanguage();
            this.loadTranslations();
            
            // Configure drag and drop area
            const dropZone = document.querySelector('label[for="file-upload"]');
            
            // Prevent browser from opening the file
            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                dropZone.addEventListener(eventName, preventDefaults, false);
                document.body.addEventListener(eventName, preventDefaults, false);
            });
            
            // Highlight drop zone when dragging
            ['dragenter', 'dragover'].forEach(eventName => {
                dropZone.addEventListener(eventName, highlight, false);
            });
            
            ['dragleave', 'drop'].forEach(eventName => {
                dropZone.addEventListener(eventName, unhighlight, false);
            });
            
            // Handle dropped files
            dropZone.addEventListener('drop', handleDrop, false);
            
            function preventDefaults(e) {
                e.preventDefault();
                e.stopPropagation();
            }
            
            function highlight() {
                dropZone.classList.add('drag-over');
            }
            
            function unhighlight() {
                dropZone.classList.remove('drag-over');
            }
            
            const self = this;
            function handleDrop(e) {
                const dt = e.dataTransfer;
                const files = dt.files;
                if (files.length) {
                    const fileInput = document.getElementById('file-upload');
                    fileInput.files = files;
                    const event = new Event('change', { bubbles: true });
                    fileInput.dispatchEvent(event);
                }
            }
        },
        
        // Detect user's language preference
        detectLanguage() {
            // Get browser language
            const browserLang = navigator.language || navigator.userLanguage;
            const lang = browserLang.split('-')[0]; // Get primary language code
            
            // Check if we support this language
            if (translations[lang]) {
                this.language = lang;
            } else {
                this.language = 'en'; // Default to English if not supported
            }
            
            // Allow overriding via URL parameter or localStorage
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.has('lang') && translations[urlParams.get('lang')]) {
                this.language = urlParams.get('lang');
            } else if (localStorage.getItem('preferred-language') && 
                       translations[localStorage.getItem('preferred-language')]) {
                this.language = localStorage.getItem('preferred-language');
            }
            
            // Save preference
            localStorage.setItem('preferred-language', this.language);
        },
        
        // Load translations for current language
        loadTranslations() {
            this.t = translations[this.language];
        },
        
        // Change the current language
        changeLanguage(lang) {
            if (translations[lang]) {
                this.language = lang;
                localStorage.setItem('preferred-language', lang);
                this.loadTranslations();
            }
        },
        
        // Translate a key
        translate(key) {
            return this.t[key] || key;
        },
        
        // Handle file upload
        handleFileUpload(event) {
            const file = event.target.files[0];
            if (!file) return;
            
            // Check if file seems to be an Apache log
            if (!file.name.endsWith('.log') && !file.name.endsWith('.txt')) {
                alert('Please select a valid log file (.log or .txt)');
                return;
            }
            
            this.fileName = file.name;
            this.fileSize = this.formatFileSize(file.size);
            this.isProcessing = true;
            this.processProgress = 0;
            this.logs = [];
            this.filteredLogs = [];
            this.uniqueStatusCodes = [];
            this.uniqueMethods = [];
            this.currentPage = 1;
            
            // Read the file
            const reader = new FileReader();
            const self = this;
            
            reader.onload = function(e) {
                const content = e.target.result;
                self.processLogFile(content);
            };
            
            reader.onprogress = function(e) {
                if (e.lengthComputable) {
                    self.processProgress = Math.round((e.loaded / e.total) * 50); // 50% for loading
                }
            };
            
            reader.readAsText(file);
        },
        
        // Process the log file content
        processLogFile(content) {
            const lines = content.split(/\r?\n/);
            const totalLines = lines.length;
            const parsed = [];
            
            // Regular expressions for Apache log formats
            const commonLogRegex = /^(\S+) (\S+) (\S+) \[([^\]]+)\] "([^"]*)" (\d+) (\d+|-)( "([^"]*)" "([^"]*)")?/;
            const combinedLogRegex = /^(\S+) (\S+) (\S+) \[([^\]]+)\] "([^"]*)" (\d+) (\d+|-)( "([^"]*)" "([^"]*)")?/;
            
            const uniqueStatuses = new Set();
            const uniqueMethods = new Set();
            
            let startTime = Date.now();
            
            for (let i = 0; i < totalLines; i++) {
                const line = lines[i].trim();
                if (!line) continue;
                
                try {
                    let logEntry = this.parseLogLine(line, commonLogRegex, combinedLogRegex);
                    if (logEntry) {
                        logEntry.raw = line; // Store the original line
                        
                        // Track unique values for filters
                        if (logEntry.status) uniqueStatuses.add(logEntry.status);
                        if (logEntry.method) uniqueMethods.add(logEntry.method);
                        
                        parsed.push(logEntry);
                    }
                } catch (error) {
                    console.error("Error processing line:", error, line);
                }
                
                // Update progress every 100 lines or on the last line
                if (i % 100 === 0 || i === totalLines - 1) {
                    this.processProgress = 50 + Math.round((i / totalLines) * 50); // 50%-100% for processing
                    
                    // Allow UI to update by letting the browser breathe
                    if (i % 1000 === 0 && i > 0) {
                        const self = this;
                        setTimeout(() => {
                            self.continueProcessing(lines, i + 1, parsed, totalLines, startTime, uniqueStatuses, uniqueMethods);
                        }, 0);
                        return; // Exit the function, will continue in setTimeout
                    }
                }
            }
            
            this.finishProcessing(parsed, uniqueStatuses, uniqueMethods);
        },
        
        // Continue processing from a specific line (to avoid blocking UI)
        continueProcessing(lines, startIndex, parsed, totalLines, startTime, uniqueStatuses, uniqueMethods) {
            const commonLogRegex = /^(\S+) (\S+) (\S+) \[([^\]]+)\] "([^"]*)" (\d+) (\d+|-)( "([^"]*)" "([^"]*)")?/;
            const combinedLogRegex = /^(\S+) (\S+) (\S+) \[([^\]]+)\] "([^"]*)" (\d+) (\d+|-)( "([^"]*)" "([^"]*)")?/;
            
            const batchSize = 1000; // Process in batches
            const endIndex = Math.min(startIndex + batchSize, totalLines);
            
            for (let i = startIndex; i < endIndex; i++) {
                const line = lines[i].trim();
                if (!line) continue;
                
                try {
                    let logEntry = this.parseLogLine(line, commonLogRegex, combinedLogRegex);
                    if (logEntry) {
                        logEntry.raw = line; // Store the original line
                        
                        // Track unique values for filters
                        if (logEntry.status) uniqueStatuses.add(logEntry.status);
                        if (logEntry.method) uniqueMethods.add(logEntry.method);
                        
                        parsed.push(logEntry);
                    }
                } catch (error) {
                    console.error("Error processing line:", error, line);
                }
                
                // Update progress
                if (i % 100 === 0 || i === totalLines - 1) {
                    this.processProgress = 50 + Math.round((i / totalLines) * 50);
                }
            }
            
            if (endIndex < totalLines) {
                // More lines to process
                const self = this;
                setTimeout(() => {
                    self.continueProcessing(lines, endIndex, parsed, totalLines, startTime, uniqueStatuses, uniqueMethods);
                }, 0);
            } else {
                // Finished processing all lines
                this.finishProcessing(parsed, uniqueStatuses, uniqueMethods);
            }
        },
        
        // Finalize processing and update UI
        finishProcessing(parsed, uniqueStatuses, uniqueMethods) {
            this.logs = parsed;
            
            // Sort and store unique values for filter dropdowns
            this.uniqueStatusCodes = Array.from(uniqueStatuses).sort((a, b) => a - b);
            this.uniqueMethods = Array.from(uniqueMethods).sort();
            
            this.sortBy(this.sortField); // Sort using current field
            this.applyFilters(); // Apply any active filters
            
            this.isProcessing = false;
            this.processProgress = 100;
            
            console.log(`Processed ${parsed.length} log lines.`);
        },
        
        // Parse a log line according to different common formats
        parseLogLine(line, commonLogRegex, combinedLogRegex) {
            // Try with Combined Log Format (most common)
            let match = combinedLogRegex.exec(line);
            
            if (!match) {
                // Try with Common Log Format
                match = commonLogRegex.exec(line);
            }
            
            if (!match) {
                // Try a more flexible approach for logs that don't match exactly
                return this.parseLogLineFlexible(line);
            }
            
            const [
                , ip, identd, userId, dateTimeStr, request, status, bytes, 
                , referer = '-', userAgent = '-'
            ] = match;
            
            // Parse date and time
            const datetime = this.parseDateTime(dateTimeStr);
            
            // Parse request (method, URL, HTTP version)
            const [method, url, httpVersion] = this.parseRequest(request);
            
            return {
                ip,
                identd,
                userId,
                datetime,
                method,
                url,
                httpVersion,
                status: parseInt(status, 10),
                bytes: bytes === '-' ? 0 : parseInt(bytes, 10),
                referer: referer === '-' ? '' : referer,
                userAgent: userAgent === '-' ? '' : userAgent
            };
        },
        
        // Alternative method to parse logs with slightly different format
        parseLogLineFlexible(line) {
            // Try to extract main parts with a more flexible approach
            
            // Try to extract IP (at the beginning of the line)
            const ipMatch = /^(\d+\.\d+\.\d+\.\d+|[0-9a-fA-F:]+)/.exec(line);
            if (!ipMatch) return null;
            
            const ip = ipMatch[1];
            let remainingLine = line.slice(ipMatch[0].length).trim();
            
            // Try to extract date between brackets
            const dateMatch = /\[([^\]]+)\]/.exec(remainingLine);
            if (!dateMatch) return null;
            
            const dateTimeStr = dateMatch[1];
            const datetime = this.parseDateTime(dateTimeStr);
            
            // Extract request between quotes
            const requestMatch = /"([^"]*)"/.exec(remainingLine);
            let method = '-', url = '-', httpVersion = '-';
            
            if (requestMatch) {
                const request = requestMatch[1];
                [method, url, httpVersion] = this.parseRequest(request);
            }
            
            // Try to extract status code (3 digit number)
            const statusMatch = / (\d{3}) /.exec(remainingLine);
            const status = statusMatch ? parseInt(statusMatch[1], 10) : 0;
            
            // Try to extract user agent (usually the last part in quotes)
            const userAgentMatch = /"([^"]+)"$/.exec(line);
            const userAgent = userAgentMatch ? userAgentMatch[1] : '';
            
            return {
                ip,
                datetime,
                method,
                url, 
                status,
                userAgent,
                bytes: 0,
                referer: '',
                identd: '-',
                userId: '-',
                httpVersion
            };
        },
        
        // Parse date and time from log
        parseDateTime(dateTimeStr) {
            return dateTimeStr;
            // Typical format: 10/Oct/2023:13:55:36 -0700
            try {
                const [datePart, timePart] = dateTimeStr.split(':');
                const [day, month, year] = datePart.split('/');
                
                // Convert text month to number
                const months = {
                    'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
                    'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
                };
                
                const monthNum = months[month];
                
                // Extract hours, minutes, seconds, and timezone
                const timeMatch = new RegExp(`${timePart.split(' ')[0]}:(\d+):(\d+) (.+)`).exec(dateTimeStr);
                
                if (!timeMatch) {
                    return new Date(); // Fallback to current date
                }
                
                const [, minutes, seconds, timezone] = timeMatch;
                const hours = timePart.split(':')[0];
                
                // Create Date object (note: months in JS are 0-11)
                const date = new Date(Date.UTC(
                    parseInt(year),
                    monthNum,
                    parseInt(day),
                    parseInt(hours),
                    parseInt(minutes),
                    parseInt(seconds)
                ));
                
                // Adjust for timezone (if needed)
                // This is a simplified approach, timezone precision 
                // could be improved with a library like moment.js
                
                return date;
                
            } catch (error) {
                console.error("Error parsing date:", error, dateTimeStr);
                return dateTimeStr; // Return original string if parsing fails
            }
        },
        
        // Parse HTTP request
        parseRequest(request) {
            if (!request || request === '-') {
                return ['-', '-', '-'];
            }
            
            const parts = request.split(' ');
            
            if (parts.length >= 3) {
                return [parts[0], parts[1], parts[2]];
            } else if (parts.length === 2) {
                return [parts[0], parts[1], '-'];
            } else if (parts.length === 1) {
                return ['-', parts[0], '-'];
            } else {
                return ['-', '-', '-'];
            }
        },
        
        // Sort logs by a specific field
        sortBy(field) {
            if (this.sortField === field) {
                // If we were already sorting by this field, reverse the order
                this.sortAsc = !this.sortAsc;
            } else {
                this.sortField = field;
                
                // By default, sort dates descending (most recent first)
                // and text ascending (A-Z)
                this.sortAsc = field !== 'datetime';
            }
            
            const direction = this.sortAsc ? 1 : -1;
            
            this.filteredLogs.sort((a, b) => {
                let valA = a[field];
                let valB = b[field];
                
                if (typeof valA === 'string') {
                    return direction * valA.localeCompare(valB);
                } else if (valA instanceof Date) {
                    return direction * (valA.getTime() - valB.getTime());
                } else {
                    // Numeric or other type
                    return direction * (valA - valB);
                }
            });
            
            this.updatePagination();
        },
        
        // Apply filters to logs
        applyFilters() {
            let result = [...this.logs]; // Copy all logs
            
            // Apply active filters
            if (this.activeFilters.length > 0) {
                this.activeFilters.forEach(filter => {
                    result = result.filter(log => {
                        // Convert to string for comparison
                        const logValue = String(log[filter.column]).toLowerCase();
                        const filterValue = String(filter.value).toLowerCase();
                        
                        return logValue.includes(filterValue);
                    });
                });
            }
            
            // Apply global search
            if (this.searchQuery.trim() !== '') {
                const searchTerms = this.searchQuery.toLowerCase().split(' ');
                
                result = result.filter(log => {
                    // Search in multiple key fields
                    const searchableText = [
                        log.ip,
                        log.method,
                        log.url,
                        log.status.toString(),
                        log.userAgent,
                        log.referer
                    ].join(' ').toLowerCase();
                    
                    // Must contain all search terms
                    return searchTerms.every(term => searchableText.includes(term));
                });
            }
            
            this.filteredLogs = result;
            this.currentPage = 1; // Return to first page after filtering
            this.updatePagination();
        },
        
        // Update paginated logs based on current page
        updatePagination() {
            this.totalPages = Math.max(1, Math.ceil(this.filteredLogs.length / this.perPage));
            
            // Ensure current page is within valid range
            if (this.currentPage < 1) this.currentPage = 1;
            if (this.currentPage > this.totalPages) this.currentPage = this.totalPages;
            
            // Calculate indices for current page
            const startIndex = (this.currentPage - 1) * this.perPage;
            const endIndex = Math.min(startIndex + this.perPage, this.filteredLogs.length);
            
            // Extract logs for current page
            this.paginatedLogs = this.filteredLogs.slice(startIndex, endIndex);
        },
        
        // Change page size
        changePageSize(size) {
            this.perPage = size;
            this.currentPage = 1; // Reset to first page
            this.updatePagination();
        },
        
        // Navigate to next page
        nextPage() {
            if (this.currentPage < this.totalPages) {
                this.currentPage++;
                this.updatePagination();
            }
        },
        
        // Navigate to previous page
        prevPage() {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.updatePagination();
            }
        },
        
        // Add an active filter
        addFilter(column, value) {
            // Avoid duplicates
            const exists = this.activeFilters.some(filter => 
                filter.column === column && filter.value === value);
                
            if (!exists) {
                this.activeFilters.push({ column, value });
                this.applyFilters();
                this.selectedLog = null; // Close details modal
            }
        },
        
        // Remove a filter by index
        removeFilter(index) {
            this.activeFilters.splice(index, 1);
            this.applyFilters();
        },
        
        // Clear all active filters
        clearAllFilters() {
            this.activeFilters = [];
            this.searchQuery = '';
            this.applyFilters();
        },
        
        // Show log details
        showLogDetails(log) {
            this.selectedLog = log;
            // Pre-fetch IP info for the detail view
            this.getIpInfo(log.ip);
        },
        
        // Get IP information (reverse lookup, geo, abuse)
        getIpInfo(ip) {
            // Check cache first
            if (this.ipInfoCache[ip]) {
                // If information is already being fetched, do nothing
                if (this.ipInfoCache[ip].loading) return;
                
                // If information exists and is not older than 24 hours, use cached version
                const cachedInfo = this.ipInfoCache[ip];
                const cacheTime = cachedInfo.timestamp || 0;
                const cacheAge = Date.now() - cacheTime;
                
                if (cacheAge < 24 * 60 * 60 * 1000 && !cachedInfo.loading) {
                    return this.ipInfoCache[ip];
                }
            }
            
            // Initialize cache entry if not exists
            if (!this.ipInfoCache[ip]) {
                this.ipInfoCache[ip] = {
                    loading: true,
                    hostname: null,
                    geo: null,
                    timestamp: Date.now()
                };
            } else {
                this.ipInfoCache[ip].loading = true;
            }
            
            // Perform reverse lookup
            this.performReverseLookup(ip);
            
            // Fetch geolocation data
            this.fetchGeoIP(ip);
            
            return this.ipInfoCache[ip];
        },
        
        // Perform reverse DNS lookup
        performReverseLookup(ip) {
            // We'll use a public DNS over HTTPS API for this demo
            // In a production environment, you might want to use your own server endpoint
            fetch(`https://dns.google/resolve?name=${ip.split('.').reverse().join('.')}.in-addr.arpa&type=PTR`)
                .then(response => response.json())
                .then(data => {
                    if (data.Answer && data.Answer.length > 0) {
                        const hostname = data.Answer[0].data;
                        this.ipInfoCache[ip].hostname = hostname.endsWith('.') ? 
                            hostname.slice(0, -1) : hostname;
                    } else {
                        this.ipInfoCache[ip].hostname = null;
                    }
                })
                .catch(error => {
                    console.error("Error performing reverse lookup:", error);
                    this.ipInfoCache[ip].hostname = null;
                })
                .finally(() => {
                    if (!this.ipInfoCache[ip].geo) {
                        this.ipInfoCache[ip].loading = false;
                    }
                });
        },
        
        // Fetch geolocation data for an IP
        fetchGeoIP(ip) {
            // Using ipinfo.io for demo purposes
            // In production, consider using a paid service or self-hosted solution
            fetch(`https://ipinfo.io/${ip}/json`)
                .then(response => response.json())
                .then(data => {
                    if (data.error) {
                        throw new Error(data.error.message);
                    }
                    
                    this.ipInfoCache[ip].geo = {
                        country: data.country || 'ZZ',
                        countryName: data.country || 'Unknown',
                        region: data.region || '-',
                        city: data.city || '-',
                        org: data.org || '-',
                        loc: data.loc || '-'
                    };
                })
                .catch(error => {
                    console.error("Error fetching GeoIP data:", error);
                    this.ipInfoCache[ip].geo = {
                        country: 'ZZ',
                        countryName: 'Unknown',
                        region: '-',
                        city: '-',
                        org: '-',
                        loc: '-'
                    };
                })
                .finally(() => {
                    if (this.ipInfoCache[ip].hostname !== undefined) {
                        this.ipInfoCache[ip].loading = false;
                    }
                });
        },
        
        // Get flag emoji for country code
        getCountryFlag(countryCode) {
            return countryFlags[countryCode] || '🏴‍☠️';
        },
        
        // Get AbuseIPDB URL for an IP
        getAbuseIPDBUrl(ip) {
            return `https://www.abuseipdb.com/check/${ip}`;
        },
        
        // Get description for HTTP status code
        getStatusCodeDescription(code) {
            return httpStatusCodes[code] || 'Unknown Status';
        },
        
        // Get status code category
        getStatusCodeCategory(code) {
            if (code >= 100 && code < 200) return this.t.statusInfo;
            if (code >= 200 && code < 300) return this.t.statusSuccess;
            if (code >= 300 && code < 400) return this.t.statusRedirect;
            if (code >= 400 && code < 500) return this.t.statusClientError;
            if (code >= 500) return this.t.statusServerError;
            return '';
        },
        
        // Format date and time for display
        formatDateTime(date) {
            if (!date) return '';
            
            try {
                const options = { 
                    year: 'numeric',
                    month: '2-digit', 
                    day: '2-digit',
                    hour: '2-digit', 
                    minute: '2-digit', 
                    second: '2-digit' 
                };
                return date.toLocaleString(this.language, options);
            } catch (error) {
                console.error("Error formatting date:", error, date);
                return String(date);
            }
        },
        
        // Format file size for display
        formatFileSize(bytes) {
            if (bytes === 0) return '0 Bytes';
            
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        },
        
        // Generate an array of page numbers for pagination display
        get paginationPages() {
            const maxPages = 5; // Max number of pages to show
            let pages = [];
            
            if (this.totalPages <= maxPages) {
                // Show all pages if there are few
                for (let i = 1; i <= this.totalPages; i++) {
                    pages.push(i);
                }
            } else {
                // Show a subset with current page centered when possible
                let startPage = Math.max(1, this.currentPage - Math.floor(maxPages / 2));
                const endPage = Math.min(startPage + maxPages - 1, this.totalPages);
                
                // Adjust if we're near the end
                if (endPage - startPage + 1 < maxPages) {
                    startPage = Math.max(1, endPage - maxPages + 1);
                }
                
                for (let i = startPage; i <= endPage; i++) {
                    pages.push(i);
                }
            }
            
            return pages;
        }
    };
}