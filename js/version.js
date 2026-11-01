// Version configuration
const APP_VERSION = '2.5.0';
const APP_BUILD = '20251101001';
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
    
    // Display version info
    displayVersion() {
        const versionInfo = this.getVersionInfo();
        console.log(`${versionInfo.name} v${versionInfo.version} (Build ${versionInfo.build})`);
        return versionInfo;
    }
};

// Make version available globally
self.VersionManager = VersionManager;
self.APP_VERSION = APP_VERSION;
