/**
 * Apache Log Viewer - Internationalization (i18n)
 * 
 * This file contains translations for all text in the application.
 * Currently supported languages: English (default), Spanish
 */

const translations = {
    // English (default language)
    "en": {
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
    },
    
    // Spanish
    "es": {
        // General UI
        "appTitle": "Visor de Logs Apache",
        "loading": "Procesando archivo...",
        "noResults": "No se encontraron resultados con los filtros aplicados",
        "uploadPrompt": "Cargue un archivo de log para comenzar",
        "clickToUpload": "Haga clic para cargar",
        "dragAndDrop": "o arrastre y suelte",
        "apacheLogFiles": "Archivos de log de Apache",
        "processing": "Procesando",
        
        // Filters
        "search": "Buscar...",
        "activeFilters": "Filtros activos",
        "clearFilters": "Limpiar filtros",
        
        // Table headers
        "dateTime": "Fecha y Hora",
        "ip": "IP",
        "status": "Código",
        "method": "Método",
        "url": "URL",
        "userAgent": "User Agent",
        "country": "País",
        
        // Pagination
        "showing": "Mostrando",
        "to": "a",
        "of": "de",
        "results": "resultados",
        "first": "Primera",
        "previous": "Anterior",
        "next": "Siguiente",
        "last": "Última",
        "itemsPerPage": "Elementos por página",
        
        // Log details
        "logDetails": "Detalles del Log",
        "requestDetails": "Detalles de la Solicitud",
        "ipDetails": "Detalles de IP",
        "rawLog": "Línea original",
        "close": "Cerrar",
        "referer": "Referer",
        "bytes": "Bytes",
        "hostname": "Hostname",
        "lookup": "Consultar",
        "viewInAbuseIPDB": "Ver en AbuseIPDB",
        
        // IP actions
        "reverseLookup": "Búsqueda Inversa",
        "geoIP": "Información Geográfica",
        "lookingUp": "Consultando...",
        "noInfoAvailable": "No hay información disponible",
        "organization": "Organización",
        "isp": "ISP",
        "location": "Ubicación",
        
        // Status codes
        "statusInfo": "Informativo",
        "statusSuccess": "Éxito",
        "statusRedirect": "Redirección",
        "statusClientError": "Error de Cliente",
        "statusServerError": "Error de Servidor"
    }
};

// HTTP status code descriptions
const httpStatusCodes = {
    // Informational 1xx
    100: "Continue",
    101: "Switching Protocols",
    102: "Processing",
    103: "Early Hints",
    
    // Successful 2xx
    200: "OK",
    201: "Created",
    202: "Accepted",
    203: "Non-Authoritative Information",
    204: "No Content",
    205: "Reset Content",
    206: "Partial Content",
    207: "Multi-Status",
    208: "Already Reported",
    226: "IM Used",
    
    // Redirection 3xx
    300: "Multiple Choices",
    301: "Moved Permanently",
    302: "Found",
    303: "See Other",
    304: "Not Modified",
    305: "Use Proxy",
    306: "Switch Proxy",
    307: "Temporary Redirect",
    308: "Permanent Redirect",
    
    // Client Errors 4xx
    400: "Bad Request",
    401: "Unauthorized",
    402: "Payment Required",
    403: "Forbidden",
    404: "Not Found",
    405: "Method Not Allowed",
    406: "Not Acceptable",
    407: "Proxy Authentication Required",
    408: "Request Timeout",
    409: "Conflict",
    410: "Gone",
    411: "Length Required",
    412: "Precondition Failed",
    413: "Payload Too Large",
    414: "URI Too Long",
    415: "Unsupported Media Type",
    416: "Range Not Satisfiable",
    417: "Expectation Failed",
    418: "I'm a teapot",
    421: "Misdirected Request",
    422: "Unprocessable Entity",
    423: "Locked",
    424: "Failed Dependency",
    425: "Too Early",
    426: "Upgrade Required",
    428: "Precondition Required",
    429: "Too Many Requests",
    431: "Request Header Fields Too Large",
    451: "Unavailable For Legal Reasons",
    
    // Server Errors 5xx
    500: "Internal Server Error",
    501: "Not Implemented",
    502: "Bad Gateway",
    503: "Service Unavailable",
    504: "Gateway Timeout",
    505: "HTTP Version Not Supported",
    506: "Variant Also Negotiates",
    507: "Insufficient Storage",
    508: "Loop Detected",
    510: "Not Extended",
    511: "Network Authentication Required"
};

// HTTP Methods
const httpMethods = [
    "GET", "POST", "PUT", "DELETE", "HEAD", 
    "OPTIONS", "PATCH", "CONNECT", "TRACE"
];

// Country codes for flags (ISO 3166-1 alpha-2)
const countryFlags = {
    // This is a sample, in production this would contain all country codes
    "US": "🇺🇸", "GB": "🇬🇧", "CA": "🇨🇦", "AU": "🇦🇺", "DE": "🇩🇪",
    "FR": "🇫🇷", "JP": "🇯🇵", "CN": "🇨🇳", "BR": "🇧🇷", "RU": "🇷🇺",
    "IN": "🇮🇳", "IT": "🇮🇹", "ES": "🇪🇸", "MX": "🇲🇽", "KR": "🇰🇷",
    "NL": "🇳🇱", "CH": "🇨🇭", "SE": "🇸🇪", "NO": "🇳🇴", "DK": "🇩🇰",
    "FI": "🇫🇮", "PL": "🇵🇱", "BE": "🇧🇪", "AT": "🇦🇹", "NZ": "🇳🇿",
    "ZA": "🇿🇦", "AR": "🇦🇷", "CL": "🇨🇱", "CO": "🇨🇴", "PE": "🇵🇪",
    "VE": "🇻🇪", "MY": "🇲🇾", "SG": "🇸🇬", "ID": "🇮🇩", "TH": "🇹🇭",
    "PH": "🇵🇭", "VN": "🇻🇳", "UA": "🇺🇦", "TR": "🇹🇷", "SA": "🇸🇦",
    "AE": "🇦🇪", "IL": "🇮🇱", "EG": "🇪🇬", "ZZ": "🏴‍☠️" // Unknown/Local
};

// Page size options
const pageSizeOptions = [
    100, 250, 500, 1000, 2500, 5000
];