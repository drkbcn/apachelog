/**
 * Apache Log Viewer - Portuguese Translations
 */

const langPt = {
    // General UI
    "appTitle": "Visualizador de Logs Apache",
    "loading": "Processando arquivo...",
    "noResults": "Nenhum resultado encontrado com os filtros aplicados",
    "uploadPrompt": "Carregue um arquivo de log para começar",
    "clickToUpload": "Clique para carregar",
    "dragAndDrop": "ou arraste e solte",
    "apacheLogFiles": "Arquivos de log Apache",
    "processing": "Processamento",
    
    // File handling
    "largeSizeWarning": "Este arquivo é bastante grande e pode demorar para processar. Continuar?",
    "invalidFileType": "Selecione um arquivo de log válido (.log, .txt, .access, .error)",
    "fileReadError": "Erro ao ler o arquivo. Tente novamente.",
    "noValidLogs": "Nenhuma entrada de log válida encontrada. Verifique o formato do log.",
    
    // Search and filters
    "search": "Pesquisar nos logs",
    "dateTime": "Data e Hora",
    "ip": "IP",
    "status": "Status",
    "method": "Método",
    "url": "URL",
    "userAgent": "User Agent",
    
    // Filters
    "activeFilters": "Filtros Ativos",
    "clearFilters": "Limpar Todos",
    "dateRange": "Intervalo de Datas",
    "dateFrom": "Data de Início",
    "dateTo": "Data Final",
    "timeFrom": "Hora de Início",
    "timeTo": "Hora Final",
    "applyDateFilter": "Aplicar Filtro de Data",
    "clearDateFilter": "Limpar Filtro de Data",
    "today": "Hoje",
    "yesterday": "Ontem",
    "last7Days": "Últimos 7 dias",
    "last30Days": "Últimos 30 dias",
    "dateFilterActive": "Filtro de data ativo",
    "filterBy": "Filtrar por",
    "excludeFilter": "Excluir",
    "includeFilter": "Incluir",
    
    // Pagination
    "showing": "Mostrando",
    "to": "a",
    "of": "de",
    "results": "resultados",
    "first": "Primeira",
    "previous": "Anterior",
    "next": "Próxima",
    "last": "Última",
    "itemsPerPage": "Itens por página",
    
    // Log details
    "logDetails": "Detalhes do Log",
    "requestDetails": "Detalhes da Requisição",
    "ipDetails": "Detalhes do IP",
    "securityAnalysis": "Análise de Segurança",
    "bytes": "Bytes",
    "referer": "Referrer",
    "response": "Resposta",
    "size": "Tamanho",
    "organization": "Organização",
    "location": "Localização",
    "reverseHostname": "Hostname Reverso",
    "abuseConfidence": "Confiança de Abuso",
    "usageType": "Tipo de Uso",
    "threatLevel": "Nível de Ameaça",
    "clean": "Limpo",
    "suspicious": "Suspeito",
    "malicious": "Malicioso",
    
    // Status categories
    "statusSuccess": "Sucesso",
    "statusRedirection": "Redirecionamento",
    "statusClientError": "Erro do Cliente",
    "statusServerError": "Erro do Servidor",
    
    // Statistics
    "statistics": "Estatísticas",
    "totalRequests": "Total de Solicitações",
    "uniqueIPs": "IPs Únicos",
    "requestMethods": "Métodos de Solicitação",
    "httpStatuses": "Códigos de Status HTTP",
    "topIPs": "Top IPs",
    "topURLs": "URLs Mais Visitadas",
    "browserFamilies": "Famílias de Navegadores",
    "operatingSystems": "Sistemas Operacionais",
    "errorRate": "Taxa de Erro",
    "averageResponseSize": "Tamanho Médio da Resposta",
    "requests": "solicitações",
    "chrome": "Chrome",
    "firefox": "Firefox",
    "safari": "Safari",
    "edge": "Edge",
    "opera": "Opera",
    "bot": "Bot/Crawler",
    "other": "Outros",
    "windows": "Windows",
    "macos": "macOS",
    "linux": "Linux",
    "android": "Android",
    "ios": "iOS",
    "unknown": "Desconhecido",
    "showAll": "Mostrar Todos",
    "hideDetails": "Ocultar Detalhes",
    "noDataAvailable": "Nenhum dado disponível",
    "refreshStats": "Atualizar Estatísticas",
    "calculating": "Calculando...",
    
    // Operation states
    "filtering": "Filtrando",
    "sorting": "Ordenando",
    "paginating": "Mudando página",
    "updating": "Atualizando",
    
    // PWA and Updates
    "updateAvailable": "Nova versão disponível",
    "updateNow": "Atualizar agora",
    "appUpdated": "App atualizado"
};

// Register this language with the translation system
registerTranslations('pt', langPt);
