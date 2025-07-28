/**
 * Apache Log Viewer - German Translations
 */

const langDe = {
    // General UI
    "appTitle": "Apache Log Viewer",
    "loading": "Datei wird verarbeitet...",
    "noResults": "Keine Ergebnisse mit den angewandten Filtern gefunden",
    "uploadPrompt": "Laden Sie eine Log-Datei hoch, um zu beginnen",
    "clickToUpload": "Klicken zum Hochladen",
    "dragAndDrop": "oder per Drag & Drop",
    "apacheLogFiles": "Apache Log-Dateien",
    "processing": "Verarbeitung",
    
    // File handling
    "largeSizeWarning": "Diese Datei ist ziemlich groß und könnte Zeit zum Verarbeiten benötigen. Fortfahren?",
    "invalidFileType": "Bitte wählen Sie eine gültige Log-Datei (.log, .txt, .access, .error)",
    "fileReadError": "Fehler beim Lesen der Datei. Bitte versuchen Sie es erneut.",
    "noValidLogs": "Keine gültigen Log-Einträge gefunden. Bitte überprüfen Sie das Log-Format.",
    
    // Search and filters
    "search": "In Logs suchen",
    "dateTime": "Datum & Zeit",
    "ip": "IP",
    "status": "Status",
    "method": "Methode",
    "url": "URL",
    "userAgent": "User Agent",
    
    // Filters
    "activeFilters": "Aktive Filter",
    "clearFilters": "Alle löschen",
    "dateRange": "Datumsbereich",
    "dateFrom": "Von Datum",
    "dateTo": "Bis Datum",
    "timeFrom": "Von Zeit",
    "timeTo": "Bis Zeit",
    "applyDateFilter": "Datumsfilter anwenden",
    "clearDateFilter": "Datumsfilter löschen",
    "today": "Heute",
    "yesterday": "Gestern",
    "last7Days": "Letzte 7 Tage",
    "last30Days": "Letzte 30 Tage",
    "dateFilterActive": "Datumsfilter aktiv",
    "filterBy": "Filtern nach",
    "excludeFilter": "Ausschließen",
    "includeFilter": "Einschließen",
    
    // Pagination
    "showing": "Zeige",
    "to": "bis",
    "of": "von",
    "results": "Ergebnissen",
    "first": "Erste",
    "previous": "Vorherige",
    "next": "Nächste",
    "last": "Letzte",
    "itemsPerPage": "Elemente pro Seite",
    
    // Log details
    "logDetails": "Log-Details",
    "requestDetails": "Anfrage-Details",
    "ipDetails": "IP-Details",
    "securityAnalysis": "Sicherheitsanalyse",
    "bytes": "Bytes",
    "referer": "Referrer",
    "response": "Antwort",
    "size": "Größe",
    "organization": "Organisation",
    "location": "Standort",
    "reverseHostname": "Reverse Hostname",
    "abuseConfidence": "Missbrauchsvertrauen",
    "usageType": "Nutzungstyp",
    "threatLevel": "Bedrohungslevel",
    "clean": "Sauber",
    "suspicious": "Verdächtig",
    "malicious": "Bösartig",
    
    // Status categories
    "statusSuccess": "Erfolg",
    "statusRedirection": "Umleitung",
    "statusClientError": "Client-Fehler",
    "statusServerError": "Server-Fehler",
    
    // Statistics
    "statistics": "Statistiken",
    "totalRequests": "Gesamte Anfragen",
    "uniqueIPs": "Einzigartige IPs",
    "requestMethods": "Anfrage-Methoden",
    "httpStatuses": "HTTP-Status-Codes",
    "topIPs": "Top IPs",
    "topURLs": "Top URLs",
    "browserFamilies": "Browser-Familien",
    "operatingSystems": "Betriebssysteme",
    "errorRate": "Fehlerrate",
    "averageResponseSize": "Durchschnittliche Antwortgröße",
    "requests": "anfragen",
    "chrome": "Chrome",
    "firefox": "Firefox",
    "safari": "Safari",
    "edge": "Edge",
    "opera": "Opera",
    "bot": "Bot/Crawler",
    "other": "Andere",
    "windows": "Windows",
    "macos": "macOS",
    "linux": "Linux",
    "android": "Android",
    "ios": "iOS",
    "unknown": "Unbekannt",
    "showAll": "Alle Anzeigen",
    "hideDetails": "Details Verstecken",
    "noDataAvailable": "Keine Daten verfügbar",
    "refreshStats": "Statistiken Aktualisieren",
    "calculating": "Berechnung läuft..."
};

// Register this language with the translation system
registerTranslations('de', langDe);
