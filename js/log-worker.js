/**
 * Parses a log File off the main thread and posts the entries back in batches.
 * In:  a File. Out: { logs, progress } batches, then { done: true } (or { error }).
 */
importScripts('parser.js');

const BATCH = 50000;

self.onmessage = async ({ data: file }) => {
    try {
        const lines = (await file.text()).split(/\r?\n/);
        for (let i = 0; i < lines.length; i += BATCH) {
            const end = Math.min(i + BATCH, lines.length);
            const logs = [];
            for (let j = i; j < end; j++) {
                const line = lines[j].trim();
                if (!line || line[0] === '#') continue;
                const entry = ApacheParser.parseLine(line, j + 1);
                if (entry) logs.push(entry);
            }
            self.postMessage({ logs, progress: Math.round((end / lines.length) * 100) });
        }
        self.postMessage({ done: true });
    } catch (error) {
        self.postMessage({ error: error.message });
    }
};
