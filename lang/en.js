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
    "viewInAbuseIPDB": "View in AbuseIPDB",
    
    // IP actions
    "reverseLookup": "Reverse Lookup",
    "geoIP": "GeoIP Lookup",
    "lookingUp": "Looking up...",
    "noInfoAvailable": "No information available",
    "organization": "Organization",
    "isp": "ISP",
    "location": "Location",
    
    // Status codes
    "statusInfo": "Informational",
    "statusSuccess": "Success",
    "statusRedirect": "Redirect",
    "statusClientError": "Client Error",
    "statusServerError": "Server Error"
};

// Register this language with the translation system
registerTranslations('en', langEn);