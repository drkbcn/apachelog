/**
 * Apache Log Viewer - Internationalization (i18n) Manager
 * 
 * This file loads the individual language files and provides the translations
 * to the application.
 */

// This will be populated by each language file
const translations = {};

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

// Function to register translations from language files
function registerTranslations(langCode, langData) {
    translations[langCode] = langData;
}