/**
 * Shared configuration for Apache Log Viewer
 * This file can be imported by both the main app and service worker
 */

// Version configuration - Update only here for new versions
export const APP_CONFIG = {
    VERSION: '2.4.2',
    BUILD: '20250729001',
    NAME: 'Apache Log Viewer',
    CACHE_PREFIX: 'apache-log-viewer-v'
};

// For environments that don't support ES modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = APP_CONFIG;
}

// For service workers and other contexts
if (typeof self !== 'undefined') {
    self.APP_CONFIG = APP_CONFIG;
}
