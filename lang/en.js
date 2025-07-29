/**
 * Apache Log Viewer - English Translations
 */

const langEn = {
    // General UI
    "appTitle": "Apache Log Viewer",
    "loading": "Processing file...",
    "noResults": "No results found with the applied filters",
    "uploadPrompt": "Upload a log file to get started",
    "clickToUpload": "Click to upload",
    "dragAndDrop": "or drag and drop",
    "apacheLogFiles": "Apache log files",
    "processing": "Processing",
    
    // File handling
    "largeSizeWarning": "This file is quite large and may take time to process. Continue?",
    "largeFileWarning": "This file is very large. Optimized multi-threaded processing will be used for better performance.",
    "invalidFileType": "Please select a valid log file (.log, .txt, .access, .error)",
    "fileReadError": "Error reading file. Please try again.",
    "processingError": "Error processing file. Please check the file format.",
    "noValidLogs": "No valid log entries found. Please check the log format.",
    "optimizedProcessing": "Using optimized processing for large files...",
    "calculating": "Calculating statistics...",
    "filtering": "Filtering logs...",
    "sorting": "Sorting logs...",
    "updating": "Updating results...",
    "processing": "Processing...",
    
    // Filters
    "search": "Search...",
    "activeFilters": "Active Filters",
    "clearFilters": "Clear filters",
    
    // Table headers
    "dateTime": "Date & Time",
    "ip": "IP",
    "status": "Status",
    "method": "Method",
    "url": "URL",
    "userAgent": "User Agent",
    "country": "Country",
    
    // Filters
    "activeFilters": "Active Filters",
    "clearFilters": "Clear All",
    "dateRange": "Date Range",
    "dateFrom": "From Date",
    "dateTo": "To Date",
    "timeFrom": "From Time",
    "timeTo": "To Time",
    "applyDateFilter": "Apply Date Filter",
    "clearDateFilter": "Clear Date Filter",
    "today": "Today",
    "yesterday": "Yesterday",
    "last7Days": "Last 7 days",
    "last30Days": "Last 30 days",
    "dateFilterActive": "Date filter active",
    "filterBy": "Filter by",
    "excludeFilter": "Exclude",
    "includeFilter": "Include",
    
    // Pagination
    "showing": "Showing",
    "to": "to",
    "of": "of",
    "results": "results",
    "first": "First",
    "previous": "Previous",
    "next": "Next",
    "last": "Last",
    "itemsPerPage": "Items per page",
    
    // Log details
    "logDetails": "Log Details",
    "requestDetails": "Request Details",
    "ipDetails": "IP Details",
    "rawLog": "Original Log Line",
    "close": "Close",
    "referer": "Referer",
    "bytes": "Bytes",
    "hostname": "Hostname",
    "lookup": "Lookup",
    "viewInAbuseIPDB": "Check in AbuseIPDB",
    
    // IP actions
    "reverseLookup": "Reverse Lookup",
    "geoIP": "GeoIP Lookup",
    "lookingUp": "Looking up...",
    "noInfoAvailable": "No information available",
    "organization": "Organization",
    "isp": "ISP",
    "location": "Location",
    "ipInformation": "IP Information",
    "queryingInfo": "Querying information...",
    
    // Status codes
    "statusInfo": "Informational",
    "statusSuccess": "Success",
    "statusRedirect": "Redirect",
    "statusClientError": "Client Error",
    "statusServerError": "Server Error",
    
    // Statistics
    "statistics": "Statistics",
    "totalRequests": "Total Requests",
    "uniqueIPs": "Unique IPs",
    "requestMethods": "Request Methods",
    "httpStatuses": "HTTP Status Codes",
    "topIPs": "Top IPs",
    "topURLs": "Top URLs",
    "browserFamilies": "Browser Families",
    "operatingSystems": "Operating Systems",
    "errorRate": "Error Rate",
    "averageResponseSize": "Avg. Response Size",
    "requests": "requests",
    "chrome": "Chrome",
    "firefox": "Firefox",
    "safari": "Safari",
    "edge": "Edge",
    "opera": "Opera",
    "bot": "Bot/Crawler",
    "other": "Other",
    "windows": "Windows",
    "macos": "macOS",
    "linux": "Linux",
    "android": "Android",
    "ios": "iOS",
    "unknown": "Unknown",
    "showAll": "Show All",
    "hideDetails": "Hide Details",
    "noDataAvailable": "No data available",
    "refreshStats": "Refresh Statistics",
    "calculating": "Calculating...",
    
    // Operation states
    "filtering": "Filtering",
    "sorting": "Sorting",
    "paginating": "Changing page",
    "updating": "Updating"
};

// Register this language with the translation system
registerTranslations('en', langEn);