# Changelog

## Version 2.5.0

### Fixes
- Unified log parser (`js/parser.js`) shared by page and worker: the worker used different field names, which broke search, date filter and sorting on big files
- Date filter works (and "clear date filter" refreshes the table); presets use local dates
- Sorting no longer flips direction after loading or ignores active filters; zero-result filters show zero stats
- Page size selector no longer concatenates strings; log files without `.log` extension (`access_log`) are accepted
- Geo info (flag, country, region) displays correctly; removed forbidden `User-Agent` header
- Single service worker registration (it was registered twice)

### Performance
- One worker reads the `File` directly (no more 6 copies of the file); results arrive in batches
- Big arrays are frozen so Alpine does not proxy every entry; single-pass filtering; debounced search
- Statistics cache browser/OS detection per user agent

## Version 2.3.0 - July 28, 2025

### 🌍 Multi-Language Expansion
- **5 New Languages Added**: French (🇫🇷), German (🇩🇪), Italian (🇮🇹), Portuguese (🇵🇹), Catalan (🏳️)
- **Complete Translation Coverage**: All interface elements translated for 7 languages total
- **Automatic Language Detection**: Browser preference detection with manual override

### 🎨 UI/UX Improvements  
- **Social Integration**: GitHub and Ko-fi links in header
- **Refined Header Layout**: Better spacing and visual hierarchy
- **Icon Integration**: SVG icons for external links and branding

### 🐛 Critical Bug Fixes
- **Stack Overflow Fix**: Resolved infinite recursion in `calculateLogDateRange()` method
- **Performance Optimization**: Improved date range calculation algorithm
- **Memory Management**: Better handling of large log files during date processing

### 🔧 Technical Improvements
- **Date Processing Rewrite**: More efficient timestamp handling
- **Error Prevention**: Added null checks and validation