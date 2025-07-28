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
        
        // Date range filter
        dateFrom: '',           // Start date for filtering (YYYY-MM-DD format)
        dateTo: '',             // End date for filtering (YYYY-MM-DD format)
        timeFrom: '',           // Start time for filtering (HH:MM format)
        timeTo: '',             // End time for filtering (HH:MM format)
        dateFilterExpanded: false, // Whether the date filter panel is expanded
        logDateRange: {         // Available date range in the loaded logs
            min: null,
            max: null,
            minStr: '',
            maxStr: ''
        },
        
        // Sort state
        sortField: 'datetime',  // Field by which logs are sorted
        sortAsc: false,         // Sort direction (asc/desc)
        
        // Pagination state
        currentPage: 1,         // Current page
        perPage: 100,           // Items per page (default: 100 for better performance)
        totalPages: 1,          // Total pages
        availablePageSizes: pageSizeOptions, // From translations.js
        
        // IP info cache
        ipInfoCache: {},        // Cache for IP information (reverse lookup, geo, abuse)
        
        // Language settings
        language: 'en',         // Default language
        t: {},                  // Translations object
        
        // Statistics
        statistics: {
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
        },
        statisticsVisible: false, // Whether statistics panel is expanded
        calculatingStatistics: false, // Whether statistics are being calculated
        
        // Initialization
        init() {
            console.log('Initializing Apache Log Viewer...');
            console.log('Available translations:', typeof translations !== 'undefined' ? Object.keys(translations) : 'translations not loaded');
            
            // Set up translations
            this.detectLanguage();
            this.loadTranslations();
            
            console.log('Current language:', this.language);
            console.log('Loaded translations keys:', this.t ? Object.keys(this.t) : 'No translations loaded');
            
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
            
            // Watch for currentPage changes to auto-update pagination
            this.$watch('currentPage', () => {
                this.updatePagination();
            });
            
            // Watch for perPage changes to auto-update pagination
            this.$watch('perPage', () => {
                this.updatePagination();
            });
        },
        
        // Detect user's language preference
        detectLanguage() {
            // Default to English
            this.language = 'en';
            
            // Get browser language
            const browserLang = navigator.language || navigator.userLanguage;
            const lang = browserLang.split('-')[0]; // Get primary language code
            
            // Check if we support this language
            if (translations[lang]) {
                this.language = lang;
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
            // Ensure translations object exists
            if (typeof translations === 'undefined') {
                console.error('Translations object not found. Check if translations.js is loaded.');
                this.t = {};
                return;
            }
            
            // Try to load the current language, fallback to English, then empty object
            this.t = translations[this.language] || translations['en'] || {};
            
            if (Object.keys(this.t).length === 0) {
                console.warn(`No translations found for language: ${this.language}`);
            }
        },
        
        // Change the current language
        changeLanguage(lang) {
            if (translations[lang]) {
                this.language = lang;
                localStorage.setItem('preferred-language', lang);
                this.loadTranslations();
            }
        },
        
        // Translate a key with fallback
        translate(key, fallback = null) {
            // Ensure translations are available
            if (!this.t || typeof this.t !== 'object') {
                console.warn('Translations not loaded, attempting to reload...');
                this.loadTranslations();
                
                // If still not available, use fallback or key
                if (!this.t || typeof this.t !== 'object') {
                    return fallback || key;
                }
            }
            
            // Get translation with dot notation support
            const keys = key.split('.');
            let result = this.t;
            
            for (const k of keys) {
                if (result && typeof result === 'object' && k in result) {
                    result = result[k];
                } else {
                    // Translation not found, return fallback or key
                    return fallback || key;
                }
            }
            
            return result || fallback || key;
        },
        
        // Handle file upload
        handleFileUpload(event) {
            const file = event.target.files[0];
            if (!file) {
                // Reset input value to allow selecting the same file again
                event.target.value = '';
                return;
            }
            
            // Check file size (warn for files larger than 50MB)
            if (file.size > 50 * 1024 * 1024) {
                if (!confirm(this.translate('largeSizeWarning') || 'This file is quite large and may take time to process. Continue?')) {
                    // Reset input value to allow selecting the same file again
                    event.target.value = '';
                    return;
                }
            }
            
            // Check if file seems to be a log file
            const validExtensions = ['.log', '.txt', '.access', '.error'];
            const hasValidExtension = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
            
            if (!hasValidExtension) {
                alert(this.translate('invalidFileType') || 'Please select a valid log file (.log, .txt, .access, .error)');
                // Reset input value to allow selecting the same file again
                event.target.value = '';
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
            
            // Clear cache
            this.ipInfoCache = {};
            
            // Read the file
            const reader = new FileReader();
            const self = this;
            
            reader.onload = function(e) {
                const content = e.target.result;
                self.processLogFile(content);
            };
            
            reader.onprogress = function(e) {
                if (e.lengthComputable) {
                    self.processProgress = Math.round((e.loaded / e.total) * 30); // 30% for loading
                }
            };
            
            reader.onerror = function() {
                self.isProcessing = false;
                // Reset input value to allow selecting the same file again
                const fileInput = document.getElementById('file-upload');
                if (fileInput) fileInput.value = '';
                alert(self.translate('fileReadError') || 'Error reading file');
            };
            
            reader.readAsText(file);
        },
        
        // Process the log file content
        processLogFile(content) {
            const lines = content.split(/\r?\n/);
            const totalLines = lines.length;
            const parsed = [];
            
            // More comprehensive Apache log format patterns
            const patterns = [
                // Combined Log Format
                /^(\S+) (\S+) (\S+) \[([^\]]+)\] "([^"]*)" (\d+) (\d+|-)(?: "([^"]*)" "([^"]*)")?/,
                // Common Log Format
                /^(\S+) (\S+) (\S+) \[([^\]]+)\] "([^"]*)" (\d+) (\d+|-)/,
                // Extended Log Format with additional fields
                /^(\S+) (\S+) (\S+) \[([^\]]+)\] "([^"]*)" (\d+) (\d+|-) "([^"]*)" "([^"]*)" "([^"]*)"/,
                // NCSA format variation
                /^(\S+) - (\S+) \[([^\]]+)\] "([^"]*)" (\d+) (\d+|-)/
            ];
            
            const uniqueStatuses = new Set();
            const uniqueMethods = new Set();
            let successfulParses = 0;
            let failedParses = 0;
            
            const startTime = Date.now();
            
            // Process in smaller batches for better performance
            this.processBatch(lines, 0, patterns, parsed, uniqueStatuses, uniqueMethods, totalLines, startTime);
        },
        
        // Process lines in batches to avoid blocking the UI
        processBatch(lines, startIndex, patterns, parsed, uniqueStatuses, uniqueMethods, totalLines, startTime) {
            const batchSize = 500; // Smaller batch size for more responsive UI
            const endIndex = Math.min(startIndex + batchSize, totalLines);
            
            for (let i = startIndex; i < endIndex; i++) {
                const line = lines[i].trim();
                if (!line || line.startsWith('#')) continue; // Skip empty lines and comments
                
                try {
                    let logEntry = this.parseLogLine(line, patterns);
                    if (logEntry) {
                        logEntry.raw = line;
                        logEntry.lineNumber = i + 1;
                        
                        // Track unique values for filters
                        if (logEntry.status) uniqueStatuses.add(logEntry.status);
                        if (logEntry.method) uniqueMethods.add(logEntry.method);
                        
                        parsed.push(logEntry);
                    }
                } catch (error) {
                    console.warn(`Error processing line ${i + 1}:`, error.message);
                }
                
                // Update progress
                if (i % 100 === 0 || i === endIndex - 1) {
                    this.processProgress = 30 + Math.round((i / totalLines) * 70); // 30%-100% for processing
                }
            }
            
            if (endIndex < totalLines) {
                // More lines to process - continue asynchronously
                setTimeout(() => {
                    this.processBatch(lines, endIndex, patterns, parsed, uniqueStatuses, uniqueMethods, totalLines, startTime);
                }, 10); // Small delay to keep UI responsive
            } else {
                // Finished processing all lines
                this.finishProcessing(parsed, uniqueStatuses, uniqueMethods, startTime);
            }
        },
        
        // Finalize processing and update UI
        finishProcessing(parsed, uniqueStatuses, uniqueMethods, startTime) {
            const processingTime = Date.now() - startTime;
            
            this.logs = parsed;
            
            // Sort and store unique values for filter dropdowns
            this.uniqueStatusCodes = Array.from(uniqueStatuses).sort((a, b) => a - b);
            this.uniqueMethods = Array.from(uniqueMethods).sort();
            
            // Calculate date range for the loaded logs
            this.calculateLogDateRange();
            
            // Don't calculate statistics automatically - they will be calculated on-demand
            // when the user opens the statistics panel
            
            this.sortBy(this.sortField); // Sort using current field
            this.applyFilters(); // Apply any active filters
            
            this.isProcessing = false;
            this.processProgress = 100;
            
            console.log(`Processed ${parsed.length} log entries in ${processingTime}ms`);
            
            // Show processing summary
            if (parsed.length === 0) {
                // Reset input value to allow selecting the same file again
                const fileInput = document.getElementById('file-upload');
                if (fileInput) fileInput.value = '';
                alert(this.translate('noValidLogs') || 'No valid log entries found. Please check the log format.');
                return;
            }
        },
        
        // Parse a log line according to different common formats
        parseLogLine(line, patterns) {
            // Try each pattern until one matches
            for (const pattern of patterns) {
                const match = pattern.exec(line);
                if (match) {
                    return this.extractLogData(match, line);
                }
            }
            
            // If no pattern matches, try flexible parsing
            return this.parseLogLineFlexible(line);
        },
        
        // Extract log data from regex match
        extractLogData(match, originalLine) {
            const [
                , ip, identd, userId, dateTimeStr, request, status, bytes, 
                referer = '-', userAgent = '-', ...extraFields
            ] = match;
            
            // Parse date and time
            const datetime = this.parseDateTime(dateTimeStr);
            
            // Parse request (method, URL, HTTP version)
            const [method, url, httpVersion] = this.parseRequest(request);
            
            return {
                ip: ip || '-',
                identd: identd || '-',
                userId: userId || '-',
                datetime,
                method: method || '-',
                url: url || '-',
                httpVersion: httpVersion || '-',
                status: parseInt(status, 10) || 0,
                bytes: bytes === '-' ? 0 : parseInt(bytes, 10) || 0,
                referer: referer === '-' ? '' : (referer || ''),
                userAgent: userAgent === '-' ? '' : (userAgent || ''),
                raw: originalLine
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
            if (!dateTimeStr) return new Date();
            
            try {
                // Apache log format: 10/Oct/2023:13:55:36 +0000
                const apacheMatch = /^(\d{1,2})\/(\w{3})\/(\d{4}):(\d{2}):(\d{2}):(\d{2})\s*([\+\-]\d{4})/.exec(dateTimeStr);
                
                if (apacheMatch) {
                    const [, day, monthStr, year, hour, minute, second, timezone] = apacheMatch;
                    
                    // Convert month name to number
                    const months = {
                        'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
                        'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
                    };
                    
                    const monthNum = months[monthStr];
                    if (monthNum === undefined) {
                        throw new Error(`Invalid month: ${monthStr}`);
                    }
                    
                    // Create date in UTC
                    const date = new Date(Date.UTC(
                        parseInt(year),
                        monthNum,
                        parseInt(day),
                        parseInt(hour),
                        parseInt(minute),
                        parseInt(second)
                    ));
                    
                    // Adjust for timezone if provided
                    if (timezone) {
                        const sign = timezone[0] === '+' ? 1 : -1;
                        const tzHours = parseInt(timezone.slice(1, 3));
                        const tzMinutes = parseInt(timezone.slice(3, 5));
                        const offsetMs = sign * (tzHours * 60 + tzMinutes) * 60 * 1000;
                        date.setTime(date.getTime() - offsetMs);
                    }
                    
                    return date;
                }
                
                // Try parsing as ISO string or other common formats
                const isoDate = new Date(dateTimeStr);
                if (!isNaN(isoDate.getTime())) {
                    return isoDate;
                }
                
                // Fallback: return current date
                console.warn('Could not parse date:', dateTimeStr);
                return new Date();
                
            } catch (error) {
                console.warn("Error parsing date:", error.message, dateTimeStr);
                return new Date(); // Fallback to current date
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
        
        // Apply filters to logs (optimized for performance)
        applyFilters() {
            let result = [...this.logs]; // Copy all logs
            
            // Apply active filters
            if (this.activeFilters.length > 0) {
                // Separate include and exclude filters
                const includeFilters = this.activeFilters.filter(filter => filter.type === 'include' || !filter.type);
                const excludeFilters = this.activeFilters.filter(filter => filter.type === 'exclude');
                
                // Apply include filters (AND logic between different columns, OR logic within same column)
                if (includeFilters.length > 0) {
                    // Group by column
                    const includeFiltersByColumn = {};
                    includeFilters.forEach(filter => {
                        if (!includeFiltersByColumn[filter.column]) {
                            includeFiltersByColumn[filter.column] = [];
                        }
                        includeFiltersByColumn[filter.column].push(filter);
                    });
                    
                    // Apply filters by column (AND between columns, OR within column)
                    Object.entries(includeFiltersByColumn).forEach(([column, filters]) => {
                        result = result.filter(log => {
                            const logValue = String(log[column] || '').toLowerCase();
                            // At least one filter in this column must match (OR logic)
                            return filters.some(filter => {
                                const filterValue = String(filter.value).toLowerCase();
                                return logValue.includes(filterValue);
                            });
                        });
                    });
                }
                
                // Apply exclude filters (exclude if ANY match)
                if (excludeFilters.length > 0) {
                    excludeFilters.forEach(filter => {
                        const filterValue = String(filter.value).toLowerCase();
                        result = result.filter(log => {
                            const logValue = String(log[filter.column] || '').toLowerCase();
                            return !logValue.includes(filterValue);
                        });
                    });
                }
            }
            
            // Apply date range filter
            if (this.hasActiveDateFilter()) {
                result = result.filter(log => this.isLogWithinDateRange(log));
            }
            
            // Apply global search (optimized)
            if (this.searchQuery.trim() !== '') {
                const searchTerms = this.searchQuery.toLowerCase().split(' ').filter(term => term.length > 0);
                
                if (searchTerms.length > 0) {
                    result = result.filter(log => {
                        // Create searchable text once per log
                        const searchableText = [
                            log.ip || '',
                            log.method || '',
                            log.url || '',
                            String(log.status || ''),
                            log.userAgent || '',
                            log.referer || ''
                        ].join(' ').toLowerCase();
                        
                        // All search terms must be present
                        return searchTerms.every(term => searchableText.includes(term));
                    });
                }
            }
            
            this.filteredLogs = result;
            this.currentPage = 1; // Return to first page after filtering
            this.updatePagination();
            
            // Only update statistics if panel is visible and user manually triggered it
            // Statistics will be calculated on-demand when the panel is opened
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
            this.perPage = parseInt(size);
            this.currentPage = 1; // Reset to first page
            this.updatePagination();
            
            // Save preference to localStorage
            localStorage.setItem('perPage', this.perPage);
            
            console.debug('Page size changed to:', this.perPage);
        },
        
        // Navigate to next page
        nextPage() {
            if (this.currentPage < this.totalPages) {
                this.currentPage++;
                this.updatePagination();
                
                // Force Alpine.js to update
                this.$nextTick(() => {
                    console.debug('Moved to next page:', this.currentPage);
                });
            }
        },
        
        // Navigate to previous page
        prevPage() {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.updatePagination();
                
                // Force Alpine.js to update
                this.$nextTick(() => {
                    console.debug('Moved to previous page:', this.currentPage);
                });
            }
        },
        
        // Go to specific page
        goToPage(pageNumber) {
            if (pageNumber >= 1 && pageNumber <= this.totalPages && pageNumber !== this.currentPage) {
                this.currentPage = pageNumber;
                this.updatePagination();
                
                // Force Alpine.js to update
                this.$nextTick(() => {
                    console.debug('Went to page:', this.currentPage);
                });
            }
        },
        
        // Add an active filter
        addFilter(column, value) {
            // Avoid duplicates
            const exists = this.activeFilters.some(filter => 
                filter.column === column && filter.value === value && filter.type === 'include');
                
            if (!exists) {
                this.activeFilters.push({ column, value, type: 'include' });
                this.applyFilters();
                this.selectedLog = null; // Close details modal
            }
        },
        
        // Add an exclude filter
        addExcludeFilter(column, value) {
            // Avoid duplicates
            const exists = this.activeFilters.some(filter => 
                filter.column === column && filter.value === value && filter.type === 'exclude');
                
            if (!exists) {
                this.activeFilters.push({ column, value, type: 'exclude' });
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
            this.clearDateFilter();
            this.applyFilters();
        },
        
        // Date filter methods
        hasActiveDateFilter() {
            const hasFilter = this.dateFrom || this.dateTo || this.timeFrom || this.timeTo;
            // Auto-expand panel if there's an active filter
            if (hasFilter && !this.dateFilterExpanded) {
                this.dateFilterExpanded = true;
            }
            return hasFilter;
        },
        
        toggleDateFilter() {
            this.dateFilterExpanded = !this.dateFilterExpanded;
        },
        
        clearDateFilter() {
            this.dateFrom = '';
            this.dateTo = '';
            this.timeFrom = '';
            this.timeTo = '';
        },
        
        isLogWithinDateRange(log) {
            if (!log.datetime) return true;
            
            const logDate = new Date(log.datetime);
            
            // Create date range boundaries
            let startDate = null;
            let endDate = null;
            
            // Parse start date/time
            if (this.dateFrom) {
                startDate = new Date(this.dateFrom);
                if (this.timeFrom) {
                    const [hours, minutes] = this.timeFrom.split(':');
                    startDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                } else {
                    startDate.setHours(0, 0, 0, 0);
                }
            }
            
            // Parse end date/time  
            if (this.dateTo) {
                endDate = new Date(this.dateTo);
                if (this.timeTo) {
                    const [hours, minutes] = this.timeTo.split(':');
                    endDate.setHours(parseInt(hours), parseInt(minutes), 59, 999);
                } else {
                    endDate.setHours(23, 59, 59, 999);
                }
            }
            
            // Check if log is within range
            if (startDate && logDate < startDate) return false;
            if (endDate && logDate > endDate) return false;
            
            return true;
        },
        
        // Quick date range presets
        setDateRangeToday() {
            const today = new Date();
            const todayStr = today.toISOString().split('T')[0];
            this.dateFrom = todayStr;
            this.dateTo = todayStr;
            this.timeFrom = '';
            this.timeTo = '';
            this.applyFilters();
        },
        
        setDateRangeYesterday() {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];
            this.dateFrom = yesterdayStr;
            this.dateTo = yesterdayStr;
            this.timeFrom = '';
            this.timeTo = '';
            this.applyFilters();
        },
        
        setDateRangeLast7Days() {
            const today = new Date();
            const weekAgo = new Date();
            weekAgo.setDate(today.getDate() - 7);
            
            this.dateFrom = weekAgo.toISOString().split('T')[0];
            this.dateTo = today.toISOString().split('T')[0];
            this.timeFrom = '';
            this.timeTo = '';
            this.applyFilters();
        },
        
        setDateRangeLast30Days() {
            const today = new Date();
            const monthAgo = new Date();
            monthAgo.setDate(today.getDate() - 30);
            
            this.dateFrom = monthAgo.toISOString().split('T')[0];
            this.dateTo = today.toISOString().split('T')[0];
            this.timeFrom = '';
            this.timeTo = '';
            this.applyFilters();
        },
        
        // Calculate the date range of the loaded logs
        calculateLogDateRange() {
            if (!this.logs || this.logs.length === 0) {
                this.logDateRange = { min: null, max: null, minStr: '', maxStr: '' };
                return;
            }
            
            let minTimestamp = Infinity;
            let maxTimestamp = -Infinity;
            let validDatesFound = false;
            
            // Find min and max timestamps efficiently
            for (const log of this.logs) {
                if (log.datetime) {
                    const timestamp = new Date(log.datetime).getTime();
                    if (!isNaN(timestamp)) {
                        validDatesFound = true;
                        if (timestamp < minTimestamp) minTimestamp = timestamp;
                        if (timestamp > maxTimestamp) maxTimestamp = timestamp;
                    }
                }
            }
            
            if (!validDatesFound) {
                this.logDateRange = { min: null, max: null, minStr: '', maxStr: '' };
                return;
            }
            
            const minDate = new Date(minTimestamp);
            const maxDate = new Date(maxTimestamp);
            
            this.logDateRange = {
                min: minDate,
                max: maxDate,
                minStr: minDate.toISOString().split('T')[0],
                maxStr: maxDate.toISOString().split('T')[0]
            };
            
            console.debug('Log date range:', this.logDateRange.minStr, 'to', this.logDateRange.maxStr);
        },
        
        // Set date filter to cover all logs
        setDateRangeToAll() {
            if (this.logDateRange.min && this.logDateRange.max) {
                this.dateFrom = this.logDateRange.minStr;
                this.dateTo = this.logDateRange.maxStr;
                this.timeFrom = '';
                this.timeTo = '';
                this.applyFilters();
            }
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
        formatDateTime(datetime) {
            if (!datetime) return '';
            
            try {
                // If it's a string (fallback from old parsing), return as-is
                if (typeof datetime === 'string') {
                    return datetime;
                }
                
                // If it's a Date object, format it
                if (datetime instanceof Date && !isNaN(datetime.getTime())) {
                    const options = { 
                        year: 'numeric',
                        month: '2-digit', 
                        day: '2-digit',
                        hour: '2-digit', 
                        minute: '2-digit', 
                        second: '2-digit',
                        hour12: false
                    };
                    
                    // Use user's preferred language for formatting
                    const locale = this.language === 'es' ? 'es-ES' : 'en-US';
                    return datetime.toLocaleString(locale, options);
                }
                
                return String(datetime);
            } catch (error) {
                console.warn("Error formatting date:", error, datetime);
                return String(datetime);
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
        
        // Alias for formatFileSize (used in templates)
        formatBytes(bytes) {
            return this.formatFileSize(bytes);
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
        },
        
        // Statistics functions
        calculateStatistics() {
            if (!this.logs || this.logs.length === 0) {
                this.resetStatistics();
                return;
            }

            const stats = {
                totalRequests: this.logs.length,
                uniqueIPs: new Set(),
                requestMethods: {},
                httpStatuses: {},
                ipCounts: {},
                urlCounts: {},
                browserFamilies: {},
                operatingSystems: {},
                totalBytes: 0,
                errorCount: 0
            };

            // Process each log entry
            this.logs.forEach(log => {
                // Unique IPs
                stats.uniqueIPs.add(log.ip);
                
                // IP frequency
                stats.ipCounts[log.ip] = (stats.ipCounts[log.ip] || 0) + 1;
                
                // Request methods
                stats.requestMethods[log.method] = (stats.requestMethods[log.method] || 0) + 1;
                
                // HTTP status codes
                stats.httpStatuses[log.status] = (stats.httpStatuses[log.status] || 0) + 1;
                
                // URL frequency
                stats.urlCounts[log.url] = (stats.urlCounts[log.url] || 0) + 1;
                
                // Response size
                if (log.bytes && log.bytes !== '-') {
                    stats.totalBytes += parseInt(log.bytes) || 0;
                }
                
                // Error counting (4xx and 5xx)
                if (log.status >= 400) {
                    stats.errorCount++;
                }
                
                // Browser family detection
                const browserFamily = this.detectBrowserFamily(log.userAgent);
                stats.browserFamilies[browserFamily] = (stats.browserFamilies[browserFamily] || 0) + 1;
                
                // Operating system detection
                const os = this.detectOperatingSystem(log.userAgent);
                stats.operatingSystems[os] = (stats.operatingSystems[os] || 0) + 1;
            });

            // Create top lists
            const topIPs = Object.entries(stats.ipCounts)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 10)
                .map(([ip, count]) => ({ ip, count }));
                
            const topURLs = Object.entries(stats.urlCounts)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 10)
                .map(([url, count]) => ({ url, count }));

            // Update statistics
            this.statistics = {
                totalRequests: stats.totalRequests,
                uniqueIPs: stats.uniqueIPs.size,
                requestMethods: stats.requestMethods,
                httpStatuses: stats.httpStatuses,
                topIPs: topIPs,
                topURLs: topURLs,
                browserFamilies: stats.browserFamilies,
                operatingSystems: stats.operatingSystems,
                errorRate: ((stats.errorCount / stats.totalRequests) * 100).toFixed(2),
                averageResponseSize: stats.totalBytes > 0 ? (stats.totalBytes / stats.totalRequests) : 0,
                totalBytes: stats.totalBytes
            };
        },

        // Calculate statistics based on filtered logs
        calculateFilteredStatistics() {
            const logsToAnalyze = this.filteredLogs.length > 0 ? this.filteredLogs : this.logs;
            
            if (!logsToAnalyze || logsToAnalyze.length === 0) {
                this.resetStatistics();
                return;
            }

            const stats = {
                totalRequests: logsToAnalyze.length,
                uniqueIPs: new Set(),
                requestMethods: {},
                httpStatuses: {},
                ipCounts: {},
                urlCounts: {},
                browserFamilies: {},
                operatingSystems: {},
                totalBytes: 0,
                errorCount: 0
            };

            // Process each log entry
            logsToAnalyze.forEach(log => {
                // Unique IPs
                stats.uniqueIPs.add(log.ip);
                
                // IP frequency
                stats.ipCounts[log.ip] = (stats.ipCounts[log.ip] || 0) + 1;
                
                // Request methods
                stats.requestMethods[log.method] = (stats.requestMethods[log.method] || 0) + 1;
                
                // HTTP status codes
                stats.httpStatuses[log.status] = (stats.httpStatuses[log.status] || 0) + 1;
                
                // URL frequency
                stats.urlCounts[log.url] = (stats.urlCounts[log.url] || 0) + 1;
                
                // Response size
                if (log.bytes && log.bytes !== '-') {
                    stats.totalBytes += parseInt(log.bytes) || 0;
                }
                
                // Error counting (4xx and 5xx)
                if (log.status >= 400) {
                    stats.errorCount++;
                }
                
                // Browser family detection
                const browserFamily = this.detectBrowserFamily(log.userAgent);
                stats.browserFamilies[browserFamily] = (stats.browserFamilies[browserFamily] || 0) + 1;
                
                // Operating system detection
                const os = this.detectOperatingSystem(log.userAgent);
                stats.operatingSystems[os] = (stats.operatingSystems[os] || 0) + 1;
            });

            // Create top lists
            const topIPs = Object.entries(stats.ipCounts)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 10)
                .map(([ip, count]) => ({ ip, count }));
                
            const topURLs = Object.entries(stats.urlCounts)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 10)
                .map(([url, count]) => ({ url, count }));

            // Update statistics
            this.statistics = {
                totalRequests: stats.totalRequests,
                uniqueIPs: stats.uniqueIPs.size,
                requestMethods: stats.requestMethods,
                httpStatuses: stats.httpStatuses,
                topIPs: topIPs,
                topURLs: topURLs,
                browserFamilies: stats.browserFamilies,
                operatingSystems: stats.operatingSystems,
                errorRate: ((stats.errorCount / stats.totalRequests) * 100).toFixed(2),
                averageResponseSize: stats.totalBytes > 0 ? (stats.totalBytes / stats.totalRequests) : 0,
                totalBytes: stats.totalBytes
            };
        },

        // Calculate statistics asynchronously with progress indication
        async calculateFilteredStatisticsAsync() {
            this.calculatingStatistics = true;
            
            // Add a small delay to allow the UI to update
            await new Promise(resolve => setTimeout(resolve, 50));
            
            try {
                const logsToAnalyze = this.filteredLogs.length > 0 ? this.filteredLogs : this.logs;
                
                if (!logsToAnalyze || logsToAnalyze.length === 0) {
                    this.resetStatistics();
                    return;
                }

                const stats = {
                    totalRequests: logsToAnalyze.length,
                    uniqueIPs: new Set(),
                    requestMethods: {},
                    httpStatuses: {},
                    ipCounts: {},
                    urlCounts: {},
                    browserFamilies: {},
                    operatingSystems: {},
                    totalBytes: 0,
                    errorCount: 0
                };

                // Process logs in chunks to avoid blocking the UI
                const chunkSize = 1000;
                const chunks = Math.ceil(logsToAnalyze.length / chunkSize);
                
                for (let i = 0; i < chunks; i++) {
                    const start = i * chunkSize;
                    const end = Math.min(start + chunkSize, logsToAnalyze.length);
                    const chunk = logsToAnalyze.slice(start, end);
                    
                    // Process this chunk
                    chunk.forEach(log => {
                        // Unique IPs
                        stats.uniqueIPs.add(log.ip);
                        
                        // IP frequency
                        stats.ipCounts[log.ip] = (stats.ipCounts[log.ip] || 0) + 1;
                        
                        // Request methods
                        stats.requestMethods[log.method] = (stats.requestMethods[log.method] || 0) + 1;
                        
                        // HTTP status codes
                        stats.httpStatuses[log.status] = (stats.httpStatuses[log.status] || 0) + 1;
                        
                        // URL frequency
                        stats.urlCounts[log.url] = (stats.urlCounts[log.url] || 0) + 1;
                        
                        // Response size
                        if (log.bytes && log.bytes !== '-') {
                            stats.totalBytes += parseInt(log.bytes) || 0;
                        }
                        
                        // Error counting (4xx and 5xx)
                        if (log.status >= 400) {
                            stats.errorCount++;
                        }
                        
                        // Browser family detection
                        const browserFamily = this.detectBrowserFamily(log.userAgent);
                        stats.browserFamilies[browserFamily] = (stats.browserFamilies[browserFamily] || 0) + 1;
                        
                        // Operating system detection
                        const os = this.detectOperatingSystem(log.userAgent);
                        stats.operatingSystems[os] = (stats.operatingSystems[os] || 0) + 1;
                    });
                    
                    // Allow UI to update every few chunks
                    if (i % 5 === 0) {
                        await new Promise(resolve => setTimeout(resolve, 1));
                    }
                }

                // Create top lists
                const topIPs = Object.entries(stats.ipCounts)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 10)
                    .map(([ip, count]) => ({ ip, count }));
                    
                const topURLs = Object.entries(stats.urlCounts)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 10)
                    .map(([url, count]) => ({ url, count }));

                // Update statistics
                this.statistics = {
                    totalRequests: stats.totalRequests,
                    uniqueIPs: stats.uniqueIPs.size,
                    requestMethods: stats.requestMethods,
                    httpStatuses: stats.httpStatuses,
                    topIPs: topIPs,
                    topURLs: topURLs,
                    browserFamilies: stats.browserFamilies,
                    operatingSystems: stats.operatingSystems,
                    errorRate: ((stats.errorCount / stats.totalRequests) * 100).toFixed(2),
                    averageResponseSize: stats.totalBytes > 0 ? (stats.totalBytes / stats.totalRequests) : 0,
                    totalBytes: stats.totalBytes
                };
            } catch (error) {
                console.error('Error calculating statistics:', error);
                this.resetStatistics();
            } finally {
                this.calculatingStatistics = false;
            }
        },

        resetStatistics() {
            this.statistics = {
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
            };
        },

        detectBrowserFamily(userAgent) {
            if (!userAgent) return this.translate('unknown');
            
            const ua = userAgent.toLowerCase();
            
            // Bot detection first
            if (ua.includes('bot') || ua.includes('crawler') || ua.includes('spider') || 
                ua.includes('scraper') || ua.includes('wget') || ua.includes('curl')) {
                return this.translate('bot');
            }
            
            // Browser detection
            if (ua.includes('edg/') || ua.includes('edge')) {
                return this.translate('edge');
            } else if (ua.includes('chrome') && !ua.includes('edg')) {
                return this.translate('chrome');
            } else if (ua.includes('firefox')) {
                return this.translate('firefox');
            } else if (ua.includes('safari') && !ua.includes('chrome')) {
                return this.translate('safari');
            } else if (ua.includes('opera') || ua.includes('opr/')) {
                return this.translate('opera');
            }
            
            return this.translate('other');
        },

        detectOperatingSystem(userAgent) {
            if (!userAgent) return this.translate('unknown');
            
            const ua = userAgent.toLowerCase();
            
            if (ua.includes('windows nt')) {
                return this.translate('windows');
            } else if (ua.includes('mac os x') || ua.includes('macos')) {
                return this.translate('macos');
            } else if (ua.includes('linux') && !ua.includes('android')) {
                return this.translate('linux');
            } else if (ua.includes('android')) {
                return this.translate('android');
            } else if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ios')) {
                return this.translate('ios');
            }
            
            return this.translate('unknown');
        },

        async toggleStatistics() {
            this.statisticsVisible = !this.statisticsVisible;
            if (this.statisticsVisible) {
                // Calculate statistics based on current view (filtered or all) asynchronously
                await this.calculateFilteredStatisticsAsync();
            }
        },

        formatPercentage(value, total) {
            if (total === 0) return '0%';
            return ((value / total) * 100).toFixed(1) + '%';
        }
    };
}
