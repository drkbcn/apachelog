// Run: node tests/parser.test.js
const assert = require('assert');
const { parseLine, parseDate } = require('../js/parser.js');

const combined = parseLine('1.2.3.4 - bob [10/Oct/2023:13:55:36 -0700] "GET /a b.html HTTP/1.1" 200 2326 "http://ref/" "Mozilla \\"x\\" 5.0"', 7);
assert.strictEqual(combined.ip, '1.2.3.4');
assert.strictEqual(combined.userId, 'bob');
assert.strictEqual(combined.url, '/a b.html');       // URL with a space
assert.strictEqual(combined.httpVersion, 'HTTP/1.1');
assert.strictEqual(combined.userAgent, 'Mozilla \\"x\\" 5.0'); // escaped quotes
assert.strictEqual(combined.referer, 'http://ref/');
assert.strictEqual(combined.bytes, 2326);
assert.strictEqual(combined.lineNumber, 7);
assert.strictEqual(combined.datetime, Date.UTC(2023, 9, 10, 20, 55, 36)); // -0700

const clf = parseLine('::1 - - [10/Oct/2023:13:55:36 +0200] "POST /x HTTP/2" 404 - ', 1); // IPv6, "-" bytes, CLF
assert.strictEqual(clf.ip, '::1');
assert.strictEqual(clf.bytes, 0);
assert.strictEqual(clf.status, 404);
assert.strictEqual(clf.referer, '');
assert.strictEqual(clf.datetime, Date.UTC(2023, 9, 10, 11, 55, 36)); // +0200

assert.strictEqual(parseDate('garbage'), 0);
assert.strictEqual(parseDate('10/Xxx/2023:13:55:36 +0000'), 0);
assert.strictEqual(parseLine('not a log line', 1), null);
// bad date but otherwise valid line: still parsed, datetime 0
assert.strictEqual(parseLine('1.1.1.1 - - [bad] "GET / HTTP/1.1" 200 5', 1).datetime, 0);
console.log('parser ok');
