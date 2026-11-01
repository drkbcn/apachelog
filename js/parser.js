/**
 * Apache log line parser. Single source of truth for the log schema:
 * used by the page (script.js) and by the Web Worker (log-worker.js).
 *
 * Entry: { ip, identd, userId, datetime (epoch ms, 0 if unknown), method, url,
 *          httpVersion, status, bytes, referer, userAgent, raw, lineNumber }
 */
(function (root) {
    const QUOTED = '"((?:[^"\\\\]|\\\\.)*)"'; // allows \" inside quotes
    // Combined Log Format; referer + user agent are optional so Common Log Format matches too
    const LINE = new RegExp(`^(\\S+) (\\S+) (\\S+) \\[([^\\]]+)\\] ${QUOTED} (\\d{3}) (\\d+|-)(?: ${QUOTED} ${QUOTED})?`);
    const DATE = /^(\d{1,2})\/(\w{3})\/(\d{4}):(\d{2}):(\d{2}):(\d{2})(?: ([+-])(\d{2})(\d{2}))?/;
    const MONTHS = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };

    // "10/Oct/2023:13:55:36 -0700" -> epoch ms (0 when it cannot be parsed)
    function parseDate(str) {
        const m = DATE.exec(str);
        if (!m) {
            const t = Date.parse(str);
            return isNaN(t) ? 0 : t;
        }
        const month = MONTHS[m[2]];
        if (month === undefined) return 0;
        let t = Date.UTC(+m[3], month, +m[1], +m[4], +m[5], +m[6]);
        if (m[7]) t -= (m[7] === '-' ? -1 : 1) * (+m[8] * 60 + +m[9]) * 60000;
        return t;
    }

    // "GET /a b HTTP/1.1" -> [method, url, version]
    function parseRequest(request) {
        if (!request || request === '-') return ['-', '-', '-'];
        const p = request.split(' ');
        if (p.length >= 3) return [p[0], p.slice(1, -1).join(' '), p[p.length - 1]];
        if (p.length === 2) return [p[0], p[1], '-'];
        return ['-', p[0], '-'];
    }

    const clean = (v) => (!v || v === '-' ? '' : v);

    function build(ip, identd, userId, date, request, status, bytes, referer, userAgent, raw, lineNumber) {
        const [method, url, httpVersion] = parseRequest(request);
        return {
            ip, identd, userId,
            datetime: parseDate(date),
            method, url, httpVersion,
            status: parseInt(status, 10) || 0,
            bytes: parseInt(bytes, 10) || 0, // "-" -> 0
            referer: clean(referer),
            userAgent: clean(userAgent),
            raw, lineNumber
        };
    }

    // Loose fallback for lines that do not follow the standard formats
    function parseFlexible(line, lineNumber) {
        const ip = /^(\d+\.\d+\.\d+\.\d+|[0-9a-fA-F:]+)/.exec(line);
        const date = /\[([^\]]+)\]/.exec(line);
        if (!ip || !date) return null;
        const request = /"([^"]*)"/.exec(line);
        const status = / (\d{3}) /.exec(line);
        const ua = /"([^"]+)"$/.exec(line);
        return build(ip[1], '-', '-', date[1], request ? request[1] : '-', status ? status[1] : 0, 0, '', ua ? ua[1] : '', line, lineNumber);
    }

    // Returns an entry, or null when the line is not a log line
    function parseLine(line, lineNumber) {
        const m = LINE.exec(line);
        return m
            ? build(m[1], m[2], m[3], m[4], m[5], m[6], m[7], m[8], m[9], line, lineNumber)
            : parseFlexible(line, lineNumber);
    }

    const ApacheParser = { parseLine, parseDate, parseRequest };
    if (typeof module !== 'undefined' && module.exports) module.exports = ApacheParser;
    else root.ApacheParser = ApacheParser;
})(typeof self !== 'undefined' ? self : this);
