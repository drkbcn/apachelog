/**
 * Apache Log Viewer - French Translations
 */

const langFr = {
    // General UI
    "appTitle": "Visualiseur de Logs Apache",
    "loading": "Traitement du fichier...",
    "noResults": "Aucun résultat trouvé avec les filtres appliqués",
    "uploadPrompt": "Téléchargez un fichier de log pour commencer",
    "clickToUpload": "Cliquer pour télécharger",
    "dragAndDrop": "ou glisser-déposer",
    "apacheLogFiles": "Fichiers de logs Apache",
    "processing": "Traitement",
    
    // File handling
    "largeSizeWarning": "Ce fichier est assez volumineux et peut prendre du temps à traiter. Continuer ?",
    "invalidFileType": "Veuillez sélectionner un fichier de log valide (.log, .txt, .access, .error)",
    "fileReadError": "Erreur lors de la lecture du fichier. Veuillez réessayer.",
    "noValidLogs": "Aucune entrée de log valide trouvée. Veuillez vérifier le format du log.",
    
    // Search and filters
    "search": "Rechercher dans les logs",
    "dateTime": "Date et Heure",
    "ip": "IP",
    "status": "Statut",
    "method": "Méthode",
    "url": "URL",
    "userAgent": "User Agent",
    
    // Filters
    "activeFilters": "Filtres Actifs",
    "clearFilters": "Effacer Tout",
    "dateRange": "Plage de Dates",
    "dateFrom": "Date de Début",
    "dateTo": "Date de Fin",
    "timeFrom": "Heure de Début",
    "timeTo": "Heure de Fin",
    "applyDateFilter": "Appliquer le Filtre de Date",
    "clearDateFilter": "Effacer le Filtre de Date",
    "today": "Aujourd'hui",
    "yesterday": "Hier",
    "last7Days": "7 derniers jours",
    "last30Days": "30 derniers jours",
    "dateFilterActive": "Filtre de date actif",
    "filterBy": "Filtrer par",
    "excludeFilter": "Exclure",
    "includeFilter": "Inclure",
    
    // Pagination
    "showing": "Affichage",
    "to": "à",
    "of": "sur",
    "results": "résultats",
    "first": "Premier",
    "previous": "Précédent",
    "next": "Suivant",
    "last": "Dernier",
    "itemsPerPage": "Éléments par page",
    
    // Log details
    "logDetails": "Détails du Log",
    "requestDetails": "Détails de la Requête",
    "ipDetails": "Détails de l'IP",
    "securityAnalysis": "Analyse de Sécurité",
    "bytes": "Octets",
    "referer": "Référent",
    "response": "Réponse",
    "size": "Taille",
    "organization": "Organisation",
    "location": "Localisation",
    "reverseHostname": "Nom d'hôte inversé",
    "abuseConfidence": "Confiance d'abus",
    "usageType": "Type d'utilisation",
    "threatLevel": "Niveau de menace",
    "clean": "Propre",
    "suspicious": "Suspect",
    "malicious": "Malveillant",
    
    // Status categories
    "statusSuccess": "Succès",
    "statusRedirection": "Redirection",
    "statusClientError": "Erreur Client",
    "statusServerError": "Erreur Serveur",
    
    // Statistics
    "statistics": "Statistiques",
    "totalRequests": "Total des Requêtes",
    "uniqueIPs": "IPs Uniques",
    "requestMethods": "Méthodes de Requête",
    "httpStatuses": "Codes de Statut HTTP",
    "topIPs": "Top IPs",
    "topURLs": "URLs les Plus Visitées",
    "browserFamilies": "Familles de Navigateurs",
    "operatingSystems": "Systèmes d'Exploitation",
    "errorRate": "Taux d'Erreur",
    "averageResponseSize": "Taille Moyenne de Réponse",
    "requests": "requêtes",
    "chrome": "Chrome",
    "firefox": "Firefox",
    "safari": "Safari",
    "edge": "Edge",
    "opera": "Opera",
    "bot": "Bot/Crawler",
    "other": "Autres",
    "windows": "Windows",
    "macos": "macOS",
    "linux": "Linux",
    "android": "Android",
    "ios": "iOS",
    "unknown": "Inconnu",
    "showAll": "Tout Afficher",
    "hideDetails": "Masquer les Détails",
    "noDataAvailable": "Aucune donnée disponible",
    "refreshStats": "Actualiser les Statistiques",
    "calculating": "Calcul en cours..."
};

// Register this language with the translation system
registerTranslations('fr', langFr);
