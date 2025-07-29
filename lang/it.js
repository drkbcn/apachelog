/**
 * Apache Log Viewer - Italian Translations
 */

const langIt = {
    // General UI
    "appTitle": "Visualizzatore Log Apache",
    "loading": "Elaborazione file...",
    "noResults": "Nessun risultato trovato con i filtri applicati",
    "uploadPrompt": "Carica un file di log per iniziare",
    "clickToUpload": "Clicca per caricare",
    "dragAndDrop": "o trascina e rilascia",
    "apacheLogFiles": "File di log Apache",
    "processing": "Elaborazione",
    
    // File handling
    "largeSizeWarning": "Questo file è piuttosto grande e potrebbe richiedere tempo per essere elaborato. Continuare?",
    "invalidFileType": "Seleziona un file di log valido (.log, .txt, .access, .error)",
    "fileReadError": "Errore nella lettura del file. Riprova.",
    "noValidLogs": "Nessuna voce di log valida trovata. Controlla il formato del log.",
    
    // Search and filters
    "search": "Cerca nei log",
    "dateTime": "Data e Ora",
    "ip": "IP",
    "status": "Stato",
    "method": "Metodo",
    "url": "URL",
    "userAgent": "User Agent",
    
    // Filters
    "activeFilters": "Filtri Attivi",
    "clearFilters": "Cancella Tutto",
    "dateRange": "Intervallo Date",
    "dateFrom": "Data Da",
    "dateTo": "Data A",
    "timeFrom": "Ora Da",
    "timeTo": "Ora A",
    "applyDateFilter": "Applica Filtro Data",
    "clearDateFilter": "Cancella Filtro Data",
    "today": "Oggi",
    "yesterday": "Ieri",
    "last7Days": "Ultimi 7 giorni",
    "last30Days": "Ultimi 30 giorni",
    "dateFilterActive": "Filtro data attivo",
    "filterBy": "Filtra per",
    "excludeFilter": "Escludi",
    "includeFilter": "Includi",
    
    // Pagination
    "showing": "Mostrando",
    "to": "a",
    "of": "di",
    "results": "risultati",
    "first": "Prima",
    "previous": "Precedente",
    "next": "Successiva",
    "last": "Ultima",
    "itemsPerPage": "Elementi per pagina",
    
    // Log details
    "logDetails": "Dettagli Log",
    "requestDetails": "Dettagli Richiesta",
    "ipDetails": "Dettagli IP",
    "securityAnalysis": "Analisi Sicurezza",
    "bytes": "Byte",
    "referer": "Referrer",
    "response": "Risposta",
    "size": "Dimensione",
    "organization": "Organizzazione",
    "location": "Posizione",
    "reverseHostname": "Hostname Inverso",
    "abuseConfidence": "Confidenza Abuso",
    "usageType": "Tipo di Utilizzo",
    "threatLevel": "Livello Minaccia",
    "clean": "Pulito",
    "suspicious": "Sospetto",
    "malicious": "Malevolo",
    
    // Status categories
    "statusSuccess": "Successo",
    "statusRedirection": "Reindirizzamento",
    "statusClientError": "Errore Client",
    "statusServerError": "Errore Server",
    
    // Statistics
    "statistics": "Statistiche",
    "totalRequests": "Richieste Totali",
    "uniqueIPs": "IP Uniche",
    "requestMethods": "Metodi di Richiesta",
    "httpStatuses": "Codici di Stato HTTP",
    "topIPs": "Top IP",
    "topURLs": "URL Più Visitate",
    "browserFamilies": "Famiglie di Browser",
    "operatingSystems": "Sistemi Operativi",
    "errorRate": "Tasso di Errore",
    "averageResponseSize": "Dimensione Media Risposta",
    "requests": "richieste",
    "chrome": "Chrome",
    "firefox": "Firefox",
    "safari": "Safari",
    "edge": "Edge",
    "opera": "Opera",
    "bot": "Bot/Crawler",
    "other": "Altri",
    "windows": "Windows",
    "macos": "macOS",
    "linux": "Linux",
    "android": "Android",
    "ios": "iOS",
    "unknown": "Sconosciuto",
    "showAll": "Mostra Tutti",
    "hideDetails": "Nascondi Dettagli",
    "noDataAvailable": "Nessun dato disponibile",
    "refreshStats": "Aggiorna Statistiche",
    "calculating": "Calcolo in corso...",
    
    // Operation states
    "filtering": "Filtraggio",
    "sorting": "Ordinamento",
    "paginating": "Cambio pagina",
    "updating": "Aggiornamento",
    
    // PWA and Updates
    "updateAvailable": "Nuova versione disponibile",
    "updateNow": "Aggiorna ora",
    "appUpdated": "App aggiornata"
};

// Register this language with the translation system
registerTranslations('it', langIt);
