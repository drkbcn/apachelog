/**
 * Apache Log Viewer - Traducciones al Español
 */

const langEs = {
    // General UI
    "appTitle": "Visor de Logs Apache",
    "loading": "Procesando archivo...",
    "noResults": "No se encontraron resultados con los filtros aplicados",
    "uploadPrompt": "Cargue un archivo de log para comenzar",
    "clickToUpload": "Haga clic para cargar",
    "dragAndDrop": "o arrastre y suelte",
    "apacheLogFiles": "Archivos de log de Apache",
    "processing": "Procesando",
    
    // File handling
    "largeSizeWarning": "Este archivo es bastante grande y puede tardar en procesarse. ¿Continuar?",
    "largeFileWarning": "Este archivo es muy grande. Se utilizará procesamiento optimizado con múltiples hilos para mejorar el rendimiento.",
    "invalidFileType": "Por favor seleccione un archivo de log válido (.log, .txt, .access, .error)",
    "fileReadError": "Error al leer el archivo. Por favor, inténtelo de nuevo.",
    "processingError": "Error al procesar el archivo. Por favor, verifique el formato.",
    "noValidLogs": "No se encontraron entradas de log válidas. Por favor, verifique el formato del log.",
    "optimizedProcessing": "Usando procesamiento optimizado para archivos grandes...",
    "calculating": "Calculando estadísticas...",
    "filtering": "Filtrando registros...",
    "sorting": "Ordenando registros...",
    "updating": "Actualizando resultados...",
    "processing": "Procesando...",
    
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
    
    // Filters
    "activeFilters": "Filtros Activos",
    "clearFilters": "Limpiar Todo",
    "dateRange": "Rango de Fechas",
    "dateFrom": "Fecha Desde",
    "dateTo": "Fecha Hasta",
    "timeFrom": "Hora Desde",
    "timeTo": "Hora Hasta",
    "applyDateFilter": "Aplicar Filtro de Fecha",
    "clearDateFilter": "Limpiar Filtro de Fecha",
    "today": "Hoy",
    "yesterday": "Ayer",
    "last7Days": "Últimos 7 días",
    "last30Days": "Últimos 30 días",
    "dateFilterActive": "Filtro de fecha activo",
    "filterBy": "Filtrar por",
    "excludeFilter": "Excluir",
    "includeFilter": "Incluir",
    
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
    "viewInAbuseIPDB": "Verificar en AbuseIPDB",
    
    // IP actions
    "reverseLookup": "Búsqueda Inversa",
    "geoIP": "Información Geográfica",
    "lookingUp": "Consultando...",
    "noInfoAvailable": "No hay información disponible",
    "organization": "Organización",
    "isp": "ISP",
    "location": "Ubicación",
    "ipInformation": "Información de IP",
    "queryingInfo": "Consultando información...",
    
    // Status codes
    "statusInfo": "Informativo",
    "statusSuccess": "Éxito",
    "statusRedirect": "Redirección",
    "statusClientError": "Error de Cliente",
    "statusServerError": "Error de Servidor",
    
    // Statistics
    "statistics": "Estadísticas",
    "totalRequests": "Total de Peticiones",
    "uniqueIPs": "IPs Únicas",
    "requestMethods": "Métodos de Petición",
    "httpStatuses": "Códigos de Estado HTTP",
    "topIPs": "IPs más Frecuentes",
    "topURLs": "URLs más Visitadas",
    "browserFamilies": "Familias de Navegadores",
    "operatingSystems": "Sistemas Operativos",
    "errorRate": "Tasa de Errores",
    "averageResponseSize": "Tamaño Promedio de Respuesta",
    "requests": "peticiones",
    "chrome": "Chrome",
    "firefox": "Firefox",
    "safari": "Safari",
    "edge": "Edge",
    "opera": "Opera",
    "bot": "Bot/Crawler",
    "other": "Otros",
    "windows": "Windows",
    "macos": "macOS",
    "linux": "Linux",
    "android": "Android",
    "ios": "iOS",
    "unknown": "Desconocido",
    "showAll": "Mostrar Todos",
    "hideDetails": "Ocultar Detalles",
    "noDataAvailable": "No hay datos disponibles",
    "refreshStats": "Actualizar Estadísticas",
    "calculating": "Calculando...",
    
    // Operation states
    "filtering": "Filtrando",
    "sorting": "Ordenando",
    "paginating": "Cambiando página",
    "updating": "Actualizando"
};

// Register this language with the translation system
registerTranslations('es', langEs);