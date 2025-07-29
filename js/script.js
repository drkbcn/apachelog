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
        
        // Loading states for UI feedback
        isFiltering: false,     // Whether filtering is in progress
        isSorting: false,       // Whether sorting is in progress
        isPaginating: false,    // Whether pagination is being updated
        currentOperation: '',   // Description of current operation
        
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
        
        // PWA and Version Management
        appVersion: '',             // Current app version (will be set from VersionManager)
        updateAvailable: false,     // Whether an update is available
        swRegistration: null,       // Service Worker registration
        
        // Initialization
        init() {
            console.log('Initializing Apache Log Viewer...');
            console.log('Available translations:', typeof translations !== 'undefined' ? Object.keys(translations) : 'translations not loaded');
            
            // Initialize version
            this.initVersionManager();
            
            // Register Service Worker
            this.registerServiceWorker();
            
            // Ensure all arrays are properly initialized
            this.logs = this.logs || [];
            this.filteredLogs = this.filteredLogs || [];
            this.paginatedLogs = this.paginatedLogs || [];
            this.activeFilters = this.activeFilters || [];
            this.uniqueStatusCodes = this.uniqueStatusCodes || [];
            this.uniqueMethods = this.uniqueMethods || [];
            
            // Ensure statistics object is properly initialized
            this.statistics = this.statistics || {
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
            
            // Check file size and optimize processing strategy
            const fileSize = file.size;
            const fileSizeMB = fileSize / (1024 * 1024);
            
            if (fileSize > 50 * 1024 * 1024) {
                const message = this.translate('largeSizeWarning') || 
                    `This file is ${this.formatFileSize(fileSize)} (${fileSizeMB.toFixed(1)}MB). Large files will use optimized processing but may take time. Continue?`;
                if (!confirm(message)) {
                    event.target.value = '';
                    return;
                }
            }
            
            // Check if file seems to be a log file
            const validExtensions = ['.log', '.txt', '.access', '.error'];
            const hasValidExtension = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
            
            if (!hasValidExtension) {
                alert(this.translate('invalidFileType') || 'Please select a valid log file (.log, .txt, .access, .error)');
                event.target.value = '';
                return;
            }
            
            this.fileName = file.name;
            this.fileSize = this.formatFileSize(fileSize);
            this.isProcessing = true;
            this.processProgress = 0;
            this.logs = [];
            this.filteredLogs = [];
            this.uniqueStatusCodes = [];
            this.uniqueMethods = [];
            this.currentPage = 1;
            
            // Clear cache and reset pagination
            this.ipInfoCache = {};
            this.adjustPageSizeForFileSize(fileSizeMB);
            
            // Use optimized processing for large files
            if (fileSize > 10 * 1024 * 1024) { // 10MB threshold
                this.processLargeFile(file);
            } else {
                this.processSmallFile(file);
            }
        },
        
        // Adjust page size based on file size for better performance
        adjustPageSizeForFileSize(fileSizeMB) {
            if (fileSizeMB > 100) {
                this.perPage = 50;   // Very large files: 50 entries per page
            } else if (fileSizeMB > 50) {
                this.perPage = 100;  // Large files: 100 entries per page
            } else if (fileSizeMB > 10) {
                this.perPage = 250;  // Medium files: 250 entries per page
            } else {
                this.perPage = 500;  // Small files: 500 entries per page
            }
        },
        
        // Process small files traditionally
        processSmallFile(file) {
            const reader = new FileReader();
            const self = this;
            
            reader.onload = function(e) {
                const content = e.target.result;
                self.processLogFile(content);
            };
            
            reader.onprogress = function(e) {
                if (e.lengthComputable) {
                    self.processProgress = Math.round((e.loaded / e.total) * 30);
                }
            };
            
            reader.onerror = function() {
                self.isProcessing = false;
                const fileInput = document.getElementById('file-upload');
                if (fileInput) fileInput.value = '';
                alert(self.translate('fileReadError') || 'Error reading file');
            };
            
            reader.readAsText(file);
        },
        
        // Process large files using Web Workers for better performance
        processLargeFile(file) {
            const self = this;
            const maxWorkers = Math.min(navigator.hardwareConcurrency || 4, 6);
            
            this.processProgress = 10;
            
            const reader = new FileReader();
            reader.onload = function(e) {
                const content = e.target.result;
                self.processProgress = 20;
                
                // Check if Web Workers are available
                if (typeof Worker === 'undefined') {
                    console.warn('Web Workers not available, falling back to single-threaded processing');
                    self.processLogFile(content);
                    return;
                }
                
                // Use Web Workers for parallel processing
                const workers = [];
                const results = [];
                let completedWorkers = 0;
                
                for (let i = 0; i < maxWorkers; i++) {
                    try {
                        const worker = new Worker('js/log-worker.js');
                        workers.push(worker);
                        
                        worker.onmessage = function(e) {
                            const { type, workerIndex, parsed, uniqueStatuses, uniqueMethods, progress, error } = e.data;
                            
                            if (type === 'progress') {
                                const baseProgress = 20 + (workerIndex / maxWorkers) * 60;
                                const workerProgress = (progress / 100) * (60 / maxWorkers);
                                self.processProgress = Math.round(baseProgress + workerProgress);
                            } else if (type === 'complete') {
                                results[workerIndex] = { parsed, uniqueStatuses, uniqueMethods };
                                completedWorkers++;
                                
                                if (completedWorkers === maxWorkers) {
                                    self.combineWorkerResults(results);
                                    workers.forEach(w => w.terminate());
                                }
                            } else if (type === 'error') {
                                console.error(`Worker ${workerIndex} error:`, error);
                                completedWorkers++;
                                results[workerIndex] = { parsed: [], uniqueStatuses: [], uniqueMethods: [] };
                                
                                if (completedWorkers === maxWorkers) {
                                    self.combineWorkerResults(results);
                                    workers.forEach(w => w.terminate());
                                }
                            }
                        };
                        
                        worker.onerror = function(error) {
                            console.error(`Worker ${i} error:`, error);
                            completedWorkers++;
                            results[i] = { parsed: [], uniqueStatuses: [], uniqueMethods: [] };
                            
                            if (completedWorkers === maxWorkers) {
                                self.combineWorkerResults(results);
                                workers.forEach(w => w.terminate());
                            }
                        };
                        
                        worker.postMessage({
                            content: content,
                            chunkSize: 1000,
                            workerIndex: i,
                            totalWorkers: maxWorkers
                        });
                        
                    } catch (error) {
                        console.error('Failed to create worker:', error);
                        // Fallback to single-threaded processing
                        self.processLogFile(content);
                        return;
                    }
                }
            };
            
            reader.onprogress = function(e) {
                if (e.lengthComputable) {
                    self.processProgress = Math.round((e.loaded / e.total) * 10);
                }
            };
            
            reader.onerror = function() {
                self.isProcessing = false;
                const fileInput = document.getElementById('file-upload');
                if (fileInput) fileInput.value = '';
                alert(self.translate('fileReadError') || 'Error reading file');
            };
            
            reader.readAsText(file);
        },
        
        // Combine results from multiple workers
        combineWorkerResults(results) {
            this.processProgress = 85;
            
            const allLogs = [];
            const allStatuses = new Set();
            const allMethods = new Set();
            
            // Combine all results with safety checks
            for (const result of results) {
                if (result && result.parsed && Array.isArray(result.parsed)) {
                    allLogs.push(...result.parsed);
                }
                if (result && result.uniqueStatuses && Array.isArray(result.uniqueStatuses)) {
                    result.uniqueStatuses.forEach(status => allStatuses.add(status));
                }
                if (result && result.uniqueMethods && Array.isArray(result.uniqueMethods)) {
                    result.uniqueMethods.forEach(method => allMethods.add(method));
                }
            }
            
            // Sort by line number to maintain order
            allLogs.sort((a, b) => (a.lineNumber || 0) - (b.lineNumber || 0));
            
            this.logs = allLogs;
            this.uniqueStatusCodes = Array.from(allStatuses).sort((a, b) => a - b);
            this.uniqueMethods = Array.from(allMethods).sort();
            
            this.processProgress = 95;
            this.finishProcessingFinal();
        },
        
        // Finish processing and update UI (for worker results)
        finishProcessingFinal() {
            // Calculate date range for filters
            this.calculateLogDateRange();
            
            // Apply initial filters and pagination
            this.applyFilters();
            
            this.processProgress = 100;
            this.isProcessing = false;
            
            console.log(`Processed ${this.logs.length} log entries with optimized performance`);
            
            // Reset file input
            const fileInput = document.getElementById('file-upload');
            if (fileInput) fileInput.value = '';
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
            
            this.logs = parsed || [];
            
            // Sort and store unique values for filter dropdowns with safety checks
            this.uniqueStatusCodes = uniqueStatuses ? Array.from(uniqueStatuses).sort((a, b) => a - b) : [];
            this.uniqueMethods = uniqueMethods ? Array.from(uniqueMethods).sort() : [];
            
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
            this.isSorting = true;
            this.currentOperation = this.translate('sorting') || 'Sorting logs...';
            
            setTimeout(() => {
                try {
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
                } finally {
                    this.isSorting = false;
                    this.currentOperation = '';
                }
            }, 50);
        },
        
        // Apply filters to logs (optimized for performance)
        applyFilters() {
            this.isFiltering = true;
            this.currentOperation = this.translate('filtering') || 'Filtering logs...';
            
            const startTime = performance.now();
            
            // Use setTimeout to allow UI to update before heavy operation
            setTimeout(() => {
                try {
                    // Use efficient filtering for large datasets
                    if (this.logs.length > 50000) {
                        this.applyFiltersOptimized();
                    } else {
                        this.applyFiltersStandard();
                    }
                    
                    const endTime = performance.now();
                    console.log(`Filtering completed in ${(endTime - startTime).toFixed(2)}ms for ${this.filteredLogs.length} results`);
                } finally {
                    this.isFiltering = false;
                    this.currentOperation = '';
                }
            }, 50); // Small delay to allow UI update
        },
        
        // Standard filtering for smaller datasets
        applyFiltersStandard() {
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
            
            // Apply search query
            if (this.searchQuery.trim()) {
                const searchTerm = this.searchQuery.toLowerCase().trim();
                result = result.filter(log => {
                    return log.ip.toLowerCase().includes(searchTerm) ||
                           log.url.toLowerCase().includes(searchTerm) ||
                           log.method.toLowerCase().includes(searchTerm) ||
                           String(log.status).includes(searchTerm) ||
                           log.userAgent.toLowerCase().includes(searchTerm) ||
                           log.referrer.toLowerCase().includes(searchTerm);
                });
            }
            
            // Apply date range filter
            result = this.applyDateRangeFilter(result);
            
            this.filteredLogs = result;
            this.updatePaginationWithLoading();
        },
        
        // Optimized filtering for large datasets
        applyFiltersOptimized() {
            const chunkSize = 10000;
            const totalChunks = Math.ceil(this.logs.length / chunkSize);
            let result = [];
            
            // Process in chunks to avoid blocking UI
            const processChunk = (chunkIndex) => {
                const startIdx = chunkIndex * chunkSize;
                const endIdx = Math.min(startIdx + chunkSize, this.logs.length);
                const chunk = this.logs.slice(startIdx, endIdx);
                
                let filteredChunk = chunk;
                
                // Pre-compile search terms for better performance
                const searchTerm = this.searchQuery.toLowerCase().trim();
                const includeFilters = this.activeFilters.filter(filter => filter.type === 'include' || !filter.type);
                const excludeFilters = this.activeFilters.filter(filter => filter.type === 'exclude');
                
                // Group include filters by column for efficiency
                const includeFiltersByColumn = {};
                includeFilters.forEach(filter => {
                    if (!includeFiltersByColumn[filter.column]) {
                        includeFiltersByColumn[filter.column] = [];
                    }
                    includeFiltersByColumn[filter.column].push(String(filter.value).toLowerCase());
                });
                
                // Apply all filters in one pass
                filteredChunk = chunk.filter(log => {
                    // Check include filters first (most restrictive)
                    if (includeFilters.length > 0) {
                        for (const [column, filterValues] of Object.entries(includeFiltersByColumn)) {
                            const logValue = String(log[column] || '').toLowerCase();
                            const hasMatch = filterValues.some(filterValue => logValue.includes(filterValue));
                            if (!hasMatch) return false;
                        }
                    }
                    
                    // Check exclude filters
                    if (excludeFilters.length > 0) {
                        for (const filter of excludeFilters) {
                            const logValue = String(log[filter.column] || '').toLowerCase();
                            const filterValue = String(filter.value).toLowerCase();
                            if (logValue.includes(filterValue)) return false;
                        }
                    }
                    
                    // Check search query
                    if (searchTerm) {
                        const searchableText = `${log.ip} ${log.url} ${log.method} ${log.status} ${log.userAgent} ${log.referrer}`.toLowerCase();
                        if (!searchableText.includes(searchTerm)) return false;
                    }
                    
                    // Check date range
                    if (!this.isInDateRange(log)) return false;
                    
                    return true;
                });
                
                result.push(...filteredChunk);
                
                // Continue with next chunk or finish
                if (chunkIndex < totalChunks - 1) {
                    // Use setTimeout to yield control back to browser
                    setTimeout(() => processChunk(chunkIndex + 1), 1);
                } else {
                    // Finished processing all chunks
                    this.filteredLogs = result;
                    this.updatePaginationWithLoading();
                }
            };
            
            // Start processing
            processChunk(0);
        },
        
        // Optimized date range checking
        isInDateRange(log) {
            if (!this.dateFrom && !this.dateTo && !this.timeFrom && !this.timeTo) {
                return true;
            }
            
            if (!log.timestamp) return true;
            
            const logDate = log.timestamp;
            
            // Date range check
            if (this.dateFrom) {
                const fromDate = new Date(this.dateFrom);
                if (logDate < fromDate) return false;
            }
            
            if (this.dateTo) {
                const toDate = new Date(this.dateTo);
                toDate.setHours(23, 59, 59, 999); // End of day
                if (logDate > toDate) return false;
            }
            
            // Time range check (if no date filter, apply to all days)
            if (this.timeFrom || this.timeTo) {
                const logTime = logDate.getHours() * 60 + logDate.getMinutes();
                
                if (this.timeFrom) {
                    const [fromHour, fromMin] = this.timeFrom.split(':').map(Number);
                    const fromTime = fromHour * 60 + fromMin;
                    if (logTime < fromTime) return false;
                }
                
                if (this.timeTo) {
                    const [toHour, toMin] = this.timeTo.split(':').map(Number);
                    const toTime = toHour * 60 + toMin;
                    if (logTime > toTime) return false;
                }
            }
            
            return true;
        },
        
        // Apply date range filter (optimized version)
        applyDateRangeFilter(logs) {
            if (!this.dateFrom && !this.dateTo && !this.timeFrom && !this.timeTo) {
                return logs;
            }
            
            return logs.filter(log => this.isInDateRange(log));
            
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
        
        // Update pagination with loading state
        updatePaginationWithLoading() {
            this.isPaginating = true;
            this.currentOperation = this.translate('updating') || 'Updating results...';
            
            setTimeout(() => {
                try {
                    this.updatePagination();
                } finally {
                    this.isPaginating = false;
                    this.currentOperation = '';
                }
            }, 10);
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
                this.isPaginating = true;
                this.currentOperation = 'paginating';
                
                setTimeout(() => {
                    this.currentPage++;
                    this.updatePagination();
                    
                    // Force Alpine.js to update
                    this.$nextTick(() => {
                        console.debug('Moved to next page:', this.currentPage);
                        this.isPaginating = false;
                        this.currentOperation = '';
                    });
                }, 10);
            }
        },
        
        // Navigate to previous page
        prevPage() {
            if (this.currentPage > 1) {
                this.isPaginating = true;
                this.currentOperation = 'paginating';
                
                setTimeout(() => {
                    this.currentPage--;
                    this.updatePagination();
                    
                    // Force Alpine.js to update
                    this.$nextTick(() => {
                        console.debug('Moved to previous page:', this.currentPage);
                        this.isPaginating = false;
                        this.currentOperation = '';
                    });
                }, 10);
            }
        },
        
        // Go to specific page
        goToPage(pageNumber) {
            if (pageNumber >= 1 && pageNumber <= this.totalPages && pageNumber !== this.currentPage) {
                this.isPaginating = true;
                this.currentOperation = 'paginating';
                
                setTimeout(() => {
                    this.currentPage = pageNumber;
                    this.updatePagination();
                    
                    // Force Alpine.js to update
                    this.$nextTick(() => {
                        console.debug('Went to page:', this.currentPage);
                        this.isPaginating = false;
                        this.currentOperation = '';
                    });
                }, 10);
            }
        },
        
        // Add an active filter
        addFilter(column, value) {
            // Convert value to string to ensure consistency
            const stringValue = String(value);
            
            // Avoid duplicates
            const exists = this.activeFilters.some(filter => 
                filter.column === column && String(filter.value) === stringValue && filter.type === 'include');
                
            if (!exists) {
                this.activeFilters.push({ column, value: stringValue, type: 'include' });
                this.applyFilters();
                this.selectedLog = null; // Close details modal
            }
        },
        
        // Add an exclude filter
        addExcludeFilter(column, value) {
            // Convert value to string to ensure consistency
            const stringValue = String(value);
            
            // Avoid duplicates
            const exists = this.activeFilters.some(filter => 
                filter.column === column && String(filter.value) === stringValue && filter.type === 'exclude');
                
            if (!exists) {
                this.activeFilters.push({ column, value: stringValue, type: 'exclude' });
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
        
        // Get IP information with lazy loading and batching
        getIpInfo(ip, priority = 'low') {
            // Check cache first
            if (this.ipInfoCache[ip]) {
                const cachedInfo = this.ipInfoCache[ip];
                
                // If information is already being fetched, do nothing
                if (cachedInfo.loading) return cachedInfo;
                
                // If information exists and is not older than 24 hours, use cached version
                const cacheAge = Date.now() - (cachedInfo.timestamp || 0);
                if (cacheAge < 24 * 60 * 60 * 1000) {
                    return cachedInfo;
                }
            }
            
            // Initialize cache entry
            if (!this.ipInfoCache[ip]) {
                this.ipInfoCache[ip] = {
                    loading: false,
                    hostname: null,
                    geo: null,
                    timestamp: Date.now(),
                    priority: priority
                };
            }
            
            // Add to batch processing queue
            this.queueIPInfoRequest(ip, priority);
            
            return this.ipInfoCache[ip];
        },
        
        // Queue system for batching IP info requests
        queueIPInfoRequest(ip, priority) {
            if (!this.ipInfoQueue) {
                this.ipInfoQueue = {
                    high: [],
                    low: [],
                    processing: false,
                    batchSize: 5,
                    processingDelay: 1000 // 1 second between batches
                };
            }
            
            // Don't queue if already in cache or being processed
            if (this.ipInfoCache[ip] && this.ipInfoCache[ip].loading) return;
            
            // Add to appropriate priority queue
            const queue = this.ipInfoQueue[priority] || this.ipInfoQueue.low;
            if (!queue.includes(ip)) {
                queue.push(ip);
            }
            
            // Start processing if not already running
            if (!this.ipInfoQueue.processing) {
                this.processIPInfoQueue();
            }
        },
        
        // Process IP info requests in batches
        async processIPInfoQueue() {
            if (this.ipInfoQueue.processing) return;
            
            this.ipInfoQueue.processing = true;
            
            while (this.ipInfoQueue.high.length > 0 || this.ipInfoQueue.low.length > 0) {
                // Process high priority first
                const batch = [];
                
                // Get high priority IPs first
                while (batch.length < this.ipInfoQueue.batchSize && this.ipInfoQueue.high.length > 0) {
                    batch.push(this.ipInfoQueue.high.shift());
                }
                
                // Fill remaining slots with low priority
                while (batch.length < this.ipInfoQueue.batchSize && this.ipInfoQueue.low.length > 0) {
                    batch.push(this.ipInfoQueue.low.shift());
                }
                
                // Process batch
                if (batch.length > 0) {
                    await this.processBatchIPInfo(batch);
                    
                    // Wait between batches to avoid rate limiting
                    if (this.ipInfoQueue.high.length > 0 || this.ipInfoQueue.low.length > 0) {
                        await new Promise(resolve => setTimeout(resolve, this.ipInfoQueue.processingDelay));
                    }
                }
            }
            
            this.ipInfoQueue.processing = false;
        },
        
        // Process a batch of IP info requests
        async processBatchIPInfo(ipBatch) {
            const promises = ipBatch.map(ip => this.fetchSingleIPInfo(ip));
            
            try {
                await Promise.allSettled(promises);
            } catch (error) {
                console.error('Error processing IP info batch:', error);
            }
        },
        
        // Fetch information for a single IP
        async fetchSingleIPInfo(ip) {
            if (!this.ipInfoCache[ip]) return;
            
            this.ipInfoCache[ip].loading = true;
            
            try {
                // Fetch geolocation data with timeout
                const geoPromise = this.fetchGeoIPOptimized(ip);
                const hostnamePromise = this.performReverseLookupOptimized(ip);
                
                // Wait for both with timeout
                const results = await Promise.allSettled([
                    geoPromise,
                    hostnamePromise
                ]);
                
                // Update cache with results
                this.ipInfoCache[ip].timestamp = Date.now();
                
            } catch (error) {
                console.error(`Error fetching IP info for ${ip}:`, error);
            } finally {
                this.ipInfoCache[ip].loading = false;
            }
        },
        
        // Optimized geolocation fetch with timeout
        async fetchGeoIPOptimized(ip) {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
            
            try {
                const response = await fetch(`https://ipapi.co/${ip}/json/`, {
                    signal: controller.signal,
                    headers: {
                        'User-Agent': 'Apache Log Viewer'
                    }
                });
                
                clearTimeout(timeoutId);
                
                if (response.ok) {
                    const data = await response.json();
                    
                    if (data && !data.error) {
                        this.ipInfoCache[ip].geo = {
                            country: data.country_name || 'Unknown',
                            countryCode: data.country_code || '',
                            city: data.city || 'Unknown',
                            org: data.org || 'Unknown'
                        };
                    }
                }
            } catch (error) {
                if (error.name !== 'AbortError') {
                    console.warn(`Geo lookup failed for ${ip}:`, error.message);
                }
                this.ipInfoCache[ip].geo = null;
            } finally {
                clearTimeout(timeoutId);
            }
        },
        
        // Optimized reverse lookup with timeout
        async performReverseLookupOptimized(ip) {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
            
            try {
                const reversedIP = ip.split('.').reverse().join('.');
                const response = await fetch(`https://dns.google/resolve?name=${reversedIP}.in-addr.arpa&type=PTR`, {
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.Answer && data.Answer.length > 0) {
                        const hostname = data.Answer[0].data;
                        this.ipInfoCache[ip].hostname = hostname.endsWith('.') ? 
                            hostname.slice(0, -1) : hostname;
                    }
                }
            } catch (error) {
                if (error.name !== 'AbortError') {
                    console.warn(`Reverse lookup failed for ${ip}:`, error.message);
                }
                this.ipInfoCache[ip].hostname = null;
            } finally {
                clearTimeout(timeoutId);
            }
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
        },

        // PWA and Version Management Functions

        // Initialize version manager
        initVersionManager() {
            if (typeof VersionManager !== 'undefined') {
                const versionInfo = VersionManager.getVersionInfo();
                this.appVersion = `v${versionInfo.version}`;
                console.log('App version initialized:', this.appVersion);
            } else {
                console.warn('VersionManager not available, using fallback version');
                this.appVersion = 'v2.4.1'; // Fallback
            }
        },

        // Register Service Worker for PWA functionality
        async registerServiceWorker() {
            if ('serviceWorker' in navigator) {
                try {
                    const registration = await navigator.serviceWorker.register('./sw.js');
                    this.swRegistration = registration;
                    
                    console.log('[PWA] Service Worker registered successfully');
                    
                    // Listen for updates
                    registration.addEventListener('updatefound', () => {
                        console.log('[PWA] New Service Worker version found');
                        this.handleServiceWorkerUpdate(registration);
                    });
                    
                    // Listen for messages from Service Worker
                    navigator.serviceWorker.addEventListener('message', (event) => {
                        this.handleServiceWorkerMessage(event);
                    });
                    
                    // Check for updates periodically (every 30 minutes)
                    setInterval(() => {
                        this.checkForUpdates();
                    }, 30 * 60 * 1000);
                    
                } catch (error) {
                    console.error('[PWA] Service Worker registration failed:', error);
                    // Continue without PWA features
                }
            } else {
                console.log('[PWA] Service Worker not supported');
            }
        },

        // Handle Service Worker update
        handleServiceWorkerUpdate(registration) {
            const newWorker = registration.installing;
            
            newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // New content is available
                    this.updateAvailable = true;
                    this.showUpdateNotification();
                }
            });
        },

        // Handle messages from Service Worker
        handleServiceWorkerMessage(event) {
            const { data } = event;
            
            switch (data.type) {
                case 'SW_UPDATED':
                    console.log('[PWA] Service Worker updated to version:', data.version);
                    break;
                    
                case 'UPDATE_AVAILABLE':
                    console.log('[PWA] Update available:', data.version);
                    this.updateAvailable = true;
                    this.showUpdateNotification();
                    break;
                    
                case 'VERSION_INFO':
                    console.log('[PWA] Version info received:', data);
                    break;
                    
                default:
                    console.log('[PWA] Unknown message from SW:', data);
            }
        },

        // Check for updates manually
        async checkForUpdates() {
            if (this.swRegistration) {
                try {
                    await this.swRegistration.update();
                    console.log('[PWA] Manual update check completed');
                } catch (error) {
                    console.error('[PWA] Manual update check failed:', error);
                }
            }
            
            // Also check using VersionManager
            if (typeof VersionManager !== 'undefined') {
                await VersionManager.checkForUpdates();
            }
        },

        // Show update notification
        showUpdateNotification() {
            // Create a temporary notification
            const notification = document.createElement('div');
            notification.className = 'fixed top-4 right-4 bg-blue-500 text-white px-4 py-3 rounded-lg shadow-lg z-50 max-w-sm';
            notification.innerHTML = `
                <div class="flex items-center justify-between">
                    <div class="flex items-center">
                        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                        </svg>
                        <span>Nueva versión disponible</span>
                    </div>
                    <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-blue-200 hover:text-white">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
                <div class="mt-2">
                    <button onclick="window.location.reload()" class="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm">
                        Actualizar ahora
                    </button>
                </div>
            `;
            
            document.body.appendChild(notification);
            
            // Auto-remove after 10 seconds
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 10000);
        },

        // Update the app (reload)
        updateApp() {
            if (this.swRegistration && this.swRegistration.waiting) {
                // Tell the waiting service worker to skip waiting
                this.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
                
                // Listen for controlling service worker change
                navigator.serviceWorker.addEventListener('controllerchange', () => {
                    window.location.reload();
                });
            } else {
                // Fallback: just reload the page
                window.location.reload();
            }
        }
    };
}
