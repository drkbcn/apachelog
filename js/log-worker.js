/**
 * Web Worker for processing large log files
 * This prevents UI blocking during heavy parsing operations
 */

// Process log file in chunks
self.onmessage = function(e) {
    const { content, chunkSize = 10000, workerIndex = 0, totalWorkers = 1 } = e.data;
    
    try {
        const lines = content.split(/\r?\n/);
        const totalLines = lines.length;
        
        // Calculate worker's chunk
        const linesPerWorker = Math.ceil(totalLines / totalWorkers);
        const startIndex = workerIndex * linesPerWorker;
        const endIndex = Math.min(startIndex + linesPerWorker, totalLines);
        
        // Apache log format patterns (optimized order)
        const patterns = [
            // Most common: Combined Log Format
            /^(\S+) (\S+) (\S+) \[([^\]]+)\] "([^"]*)" (\d+) (\d+|-)(?: "([^"]*)" "([^"]*)")?/,
            // Common Log Format
            /^(\S+) (\S+) (\S+) \[([^\]]+)\] "([^"]*)" (\d+) (\d+|-)/,
            // Extended format
            /^(\S+) (\S+) (\S+) \[([^\]]+)\] "([^"]*)" (\d+) (\d+|-) "([^"]*)" "([^"]*)" "([^"]*)"/,
            // NCSA format
            /^(\S+) - (\S+) \[([^\]]+)\] "([^"]*)" (\d+) (\d+|-)/
        ];
        
        const parsed = [];
        const uniqueStatuses = new Set();
        const uniqueMethods = new Set();
        let processedLines = 0;
        
        // Process in small chunks to send progress updates
        for (let i = startIndex; i < endIndex; i += chunkSize) {
            const chunkEnd = Math.min(i + chunkSize, endIndex);
            
            for (let j = i; j < chunkEnd; j++) {
                const line = lines[j].trim();
                if (!line || line.startsWith('#')) continue;
                
                try {
                    const logEntry = parseLogLine(line, patterns);
                    if (logEntry) {
                        logEntry.raw = line;
                        logEntry.lineNumber = j + 1;
                        logEntry.workerIndex = workerIndex;
                        
                        if (logEntry.status) uniqueStatuses.add(logEntry.status);
                        if (logEntry.method) uniqueMethods.add(logEntry.method);
                        
                        parsed.push(logEntry);
                    }
                } catch (error) {
                    // Silently skip problematic lines
                }
                
                processedLines++;
            }
            
            // Send progress update
            self.postMessage({
                type: 'progress',
                workerIndex: workerIndex,
                processed: processedLines,
                total: endIndex - startIndex,
                progress: Math.round((processedLines / (endIndex - startIndex)) * 100)
            });
        }
        
        // Send final results
        self.postMessage({
            type: 'complete',
            workerIndex: workerIndex,
            parsed: parsed,
            uniqueStatuses: Array.from(uniqueStatuses),
            uniqueMethods: Array.from(uniqueMethods),
            processedLines: processedLines
        });
        
    } catch (error) {
        self.postMessage({
            type: 'error',
            workerIndex: workerIndex,
            error: error.message
        });
    }
};

// Optimized log parsing function
function parseLogLine(line, patterns) {
    for (const pattern of patterns) {
        const match = line.match(pattern);
        if (match) {
            return createLogEntry(match);
        }
    }
    
    // Fallback to flexible parsing
    return parseLogLineFlexible(line);
}

function createLogEntry(match) {
    const logEntry = {
        ip: match[1] || '',
        identd: match[2] || '-',
        userid: match[3] || '-',
        datetime: match[4] || '',
        request: match[5] || '',
        status: parseInt(match[6]) || 0,
        size: match[7] === '-' ? 0 : parseInt(match[7]) || 0,
        referrer: match[8] || '',
        userAgent: match[9] || ''
    };
    
    // Parse request details
    if (logEntry.request) {
        const requestParts = logEntry.request.split(' ');
        logEntry.method = requestParts[0] || '';
        logEntry.url = requestParts[1] || '';
        logEntry.protocol = requestParts[2] || '';
    }
    
    // Parse datetime
    if (logEntry.datetime) {
        try {
            // Convert Apache date format to ISO format
            const cleanDateTime = logEntry.datetime.replace(/(\d{2})\/(\w{3})\/(\d{4}):(\d{2}:\d{2}:\d{2})/, '$3-$2-$1T$4');
            const months = {'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06',
                           'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'};
            
            let isoDateTime = cleanDateTime;
            for (const [month, num] of Object.entries(months)) {
                isoDateTime = isoDateTime.replace(month, num);
            }
            
            logEntry.timestamp = new Date(isoDateTime);
            logEntry.dateStr = logEntry.timestamp.toLocaleDateString();
            logEntry.timeStr = logEntry.timestamp.toLocaleTimeString();
        } catch (e) {
            logEntry.timestamp = new Date();
        }
    }
    
    return logEntry;
}

function parseLogLineFlexible(line) {
    const parts = line.split(' ');
    if (parts.length < 4) return null;
    
    const logEntry = {
        ip: parts[0] || '',
        identd: parts[1] || '-',
        userid: parts[2] || '-',
        datetime: '',
        request: '',
        status: 0,
        size: 0,
        referrer: '',
        userAgent: ''
    };
    
    // Find datetime in brackets
    const dateMatch = line.match(/\[([^\]]+)\]/);
    if (dateMatch) {
        logEntry.datetime = dateMatch[1];
    }
    
    // Find request in quotes
    const requestMatch = line.match(/"([^"]*)"/);
    if (requestMatch) {
        logEntry.request = requestMatch[1];
        const requestParts = logEntry.request.split(' ');
        logEntry.method = requestParts[0] || '';
        logEntry.url = requestParts[1] || '';
        logEntry.protocol = requestParts[2] || '';
    }
    
    // Find status and size after request
    const afterRequest = line.split('"')[2];
    if (afterRequest) {
        const statusMatch = afterRequest.match(/\s+(\d+)\s+(\d+|-)/);
        if (statusMatch) {
            logEntry.status = parseInt(statusMatch[1]) || 0;
            logEntry.size = statusMatch[2] === '-' ? 0 : parseInt(statusMatch[2]) || 0;
        }
    }
    
    return logEntry;
}
