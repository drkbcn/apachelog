// Version configuration
const APP_VERSION = '2.4.1';
const APP_BUILD = '20250729001';
const APP_NAME = 'Apache Log Viewer';

// Version utilities
const VersionManager = {
    current: APP_VERSION,
    build: APP_BUILD,
    name: APP_NAME,
    
    // Get current version info
    getVersionInfo() {
        return {
            version: this.current,
            build: this.build,
            name: this.name,
            fullVersion: `${this.current}.${this.build}`
        };
    },
    
    // Generate cache name for service worker
    getCacheName() {
        return `apache-log-viewer-v${this.current}`;
    },
    
    // Generate cache version
    getCacheVersion() {
        return `v${this.current}`;
    },
    
    // Check if a new version is available (for future use)
    async checkForUpdates() {
        try {
            // This would typically check against a server endpoint
            // For now, we'll check against the service worker cache
            if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                // Trigger update check in service worker
                navigator.serviceWorker.controller.postMessage({
                    type: 'CHECK_FOR_UPDATE'
                });
            }
        } catch (error) {
            console.error('Error checking for updates:', error);
        }
    },
    
    // Display version info
    displayVersion() {
        const versionInfo = this.getVersionInfo();
        console.log(`${versionInfo.name} v${versionInfo.version} (Build ${versionInfo.build})`);
        return versionInfo;
    }
};

// Make version available globally
window.VersionManager = VersionManager;
window.APP_VERSION = APP_VERSION;
