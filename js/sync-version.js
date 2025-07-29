#!/usr/bin/env node
/**
 * Version sync script
 * Updates version numbers across all files from a single source
 */

const fs = require('fs');
const path = require('path');

// Read version from config
const configPath = path.join(__dirname, 'config.js');
let APP_CONFIG;

try {
    // Read the config file and extract version
    const configContent = fs.readFileSync(configPath, 'utf8');
    const versionMatch = configContent.match(/VERSION:\s*['"]([^'"]+)['"]/);
    const buildMatch = configContent.match(/BUILD:\s*['"]([^'"]+)['"]/);
    
    if (!versionMatch) {
        console.error('Could not find VERSION in config.js');
        process.exit(1);
    }
    
    APP_CONFIG = {
        VERSION: versionMatch[1],
        BUILD: buildMatch ? buildMatch[1] : new Date().toISOString().slice(0, 10).replace(/-/g, '') + '001'
    };
    
    console.log(`Syncing version ${APP_CONFIG.VERSION} (build ${APP_CONFIG.BUILD})`);
    
} catch (error) {
    console.error('Error reading config:', error.message);
    process.exit(1);
}

// Files to update
const filesToUpdate = [
    {
        file: 'js/version.js',
        updates: [
            { pattern: /const APP_VERSION = '[^']+';/, replacement: `const APP_VERSION = '${APP_CONFIG.VERSION}';` },
            { pattern: /const APP_BUILD = '[^']+';/, replacement: `const APP_BUILD = '${APP_CONFIG.BUILD}';` }
        ]
    },
    {
        file: 'sw.js',
        updates: [
            { pattern: /const APP_VERSION = '[^']+';/, replacement: `const APP_VERSION = '${APP_CONFIG.VERSION}';` }
        ]
    },
    {
        file: 'manifest.json',
        updates: [
            { pattern: /"version":\s*"[^"]+"/, replacement: `"version": "${APP_CONFIG.VERSION}"` }
        ]
    }
];

// Update files
filesToUpdate.forEach(({ file, updates }) => {
    const filePath = path.join(__dirname, '..', file);
    
    if (!fs.existsSync(filePath)) {
        console.warn(`File not found: ${file}`);
        return;
    }
    
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        
        updates.forEach(({ pattern, replacement }) => {
            if (pattern.test(content)) {
                content = content.replace(pattern, replacement);
                modified = true;
            }
        });
        
        if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✓ Updated ${file}`);
        } else {
            console.log(`- No changes needed in ${file}`);
        }
        
    } catch (error) {
        console.error(`Error updating ${file}:`, error.message);
    }
});

console.log('\nVersion sync completed!');
console.log(`Current version: ${APP_CONFIG.VERSION}`);
console.log(`Build: ${APP_CONFIG.BUILD}`);
