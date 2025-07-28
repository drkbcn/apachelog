/**
 * Apache Log Viewer - Catalan Translations
 */

const langCa = {
    // General UI
    "appTitle": "Visualitzador de Logs Apache",
    "loading": "Processant fitxer...",
    "noResults": "No s'han trobat resultats amb els filtres aplicats",
    "uploadPrompt": "Carregueu un fitxer de log per començar",
    "clickToUpload": "Feu clic per carregar",
    "dragAndDrop": "o arrossegueu i deixeu anar",
    "apacheLogFiles": "Fitxers de log Apache",
    "processing": "Processament",
    
    // File handling
    "largeSizeWarning": "Aquest fitxer és força gran i pot trigar a processar-se. Continuar?",
    "invalidFileType": "Seleccioneu un fitxer de log vàlid (.log, .txt, .access, .error)",
    "fileReadError": "Error en llegir el fitxer. Torneu-ho a provar.",
    "noValidLogs": "No s'han trobat entrades de log vàlides. Comproveu el format del log.",
    
    // Search and filters
    "search": "Cercar als logs",
    "dateTime": "Data i Hora",
    "ip": "IP",
    "status": "Estat",
    "method": "Mètode",
    "url": "URL",
    "userAgent": "User Agent",
    
    // Filters
    "activeFilters": "Filtres Actius",
    "clearFilters": "Esborrar Tot",
    "dateRange": "Interval de Dates",
    "dateFrom": "Data d'Inici",
    "dateTo": "Data Final",
    "timeFrom": "Hora d'Inici",
    "timeTo": "Hora Final",
    "applyDateFilter": "Aplicar Filtre de Data",
    "clearDateFilter": "Esborrar Filtre de Data",
    "today": "Avui",
    "yesterday": "Ahir",
    "last7Days": "Últims 7 dies",
    "last30Days": "Últims 30 dies",
    "dateFilterActive": "Filtre de data actiu",
    "filterBy": "Filtrar per",
    "excludeFilter": "Excloure",
    "includeFilter": "Incloure",
    
    // Pagination
    "showing": "Mostrant",
    "to": "a",
    "of": "de",
    "results": "resultats",
    "first": "Primera",
    "previous": "Anterior",
    "next": "Següent",
    "last": "Última",
    "itemsPerPage": "Elements per pàgina",
    
    // Log details
    "logDetails": "Detalls del Log",
    "requestDetails": "Detalls de la Sol·licitud",
    "ipDetails": "Detalls de l'IP",
    "securityAnalysis": "Anàlisi de Seguretat",
    "bytes": "Bytes",
    "referer": "Referrer",
    "response": "Resposta",
    "size": "Mida",
    "organization": "Organització",
    "location": "Ubicació",
    "reverseHostname": "Nom d'amfitrió invers",
    "abuseConfidence": "Confiança d'abús",
    "usageType": "Tipus d'ús",
    "threatLevel": "Nivell d'amenaça",
    "clean": "Net",
    "suspicious": "Sospitós",
    "malicious": "Maliciós",
    
    // Status categories
    "statusSuccess": "Èxit",
    "statusRedirection": "Redirecció",
    "statusClientError": "Error del Client",
    "statusServerError": "Error del Servidor",
    
    // Statistics
    "statistics": "Estadístiques",
    "totalRequests": "Total de Peticions",
    "uniqueIPs": "IPs Úniques",
    "requestMethods": "Mètodes de Petició",
    "httpStatuses": "Codis d'Estat HTTP",
    "topIPs": "Top IPs",
    "topURLs": "URLs Més Visitades",
    "browserFamilies": "Famílies de Navegadors",
    "operatingSystems": "Sistemes Operatius",
    "errorRate": "Taxa d'Error",
    "averageResponseSize": "Mida Mitjana de Resposta",
    "requests": "peticions",
    "chrome": "Chrome",
    "firefox": "Firefox",
    "safari": "Safari",
    "edge": "Edge",
    "opera": "Opera",
    "bot": "Bot/Crawler",
    "other": "Altres",
    "windows": "Windows",
    "macos": "macOS",
    "linux": "Linux",
    "android": "Android",
    "ios": "iOS",
    "unknown": "Desconegut",
    "showAll": "Mostrar Tots",
    "hideDetails": "Amagar Detalls",
    "noDataAvailable": "No hi ha dades disponibles",
    "refreshStats": "Actualitzar Estadístiques",
    "calculating": "Calculant..."
};

// Register this language with the translation system
registerTranslations('ca', langCa);
