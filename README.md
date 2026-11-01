# Apache Log Viewer 🌐

## Overview
🔍 **Apache Log Viewer** is a powerful, web-based tool designed to visualize and analyze Apache server logs. Built with **Tailwind CSS** and **Alpine.js**, this application provides an intuitive interface for log management and analysis.

## ✨ Features

### 🌎 Core Functionality
- **Multi-language support** (7 languages)
- **Installable PWA** that also works offline
- **Advanced log filtering** and search capabilities
- **Real-time log parsing** with multiple format support
- **Interactive data visualization** with sortable columns
- **Responsive design** optimized for all devices

### 🔍 Analysis Tools
- **IP Geolocation** with country flags and organization info
- **Reverse DNS lookup** for hostname resolution
- **Direct integration** with AbuseIPDB for security analysis
- **HTTP status code** categorization and descriptions
- **Performance metrics** and processing statistics

### 🚀 Performance Optimizations
- **Web Worker parsing** keeps the UI responsive (a 400,000-line / ~60MB log loads in ~2s on a desktop)
- **Single-pass filtering**, debounced search and cached statistics
- **Pagination** for smooth navigation
- **Intelligent caching** for IP information
- **Progressive loading** with real-time progress indicators
- **Memory-efficient** storage of parsed entries

### 🛡️ Security Features
- **Client-side processing** - your logs never leave your browser
- **IP reputation checking** via AbuseIPDB integration
- **Threat analysis** with visual indicators
- **Privacy-focused** design with no data collection

## 🛠️ Tech Stack

| Technology | Purpose | Version |
|------------|---------|---------|
| **Tailwind CSS** | Styling & UI Framework | 3.4.17 CDN |
| **Alpine.js** | Reactive JavaScript Framework | 3.17.5 |
| **Vanilla JavaScript** | Core Application Logic | ES6+ |

## 🎯 Supported Log Formats

- **Combined Log Format**
- **Common Log Format**
- Lines that do not match are parsed loosely (IP, date, request, status) when possible

Not supported: the Apache *error* log format and logs with a vhost prefix (`%v:%p`).

## 🚀 Usage

### Online Version
Visit the live version at: [Apache Log Viewer on GitHub Pages](https://drkbcn.github.io/apachelog)

### Local Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/drkbcn/apachelog.git
   ```
2. Serve the folder with any static server (e.g. `python3 -m http.server`) and open it in your browser
3. Upload your Apache log file and start analyzing!

Opening `index.html` directly (`file://`) also works, but without the Web Worker and service worker (parsing runs on the main thread and there is no offline mode).

### Install as an app (PWA)
Use your browser's "Install" option. After the first load with network, the app and its Tailwind/Alpine scripts are cached and it works offline. Updates are picked up automatically and a notice offers to reload.

### File Requirements
- **Any text log file** (`access.log`, `access_log`, `.txt`...); there is no extension check
- **Large files**: above 50MB you are asked to confirm; the whole file is read into memory
- **Encoding**: UTF-8 recommended

## 📊 Performance Benchmarks

Measured on a desktop Chromium with a synthetic 400,000-line log: load ~2s, filter ~0.3s, sort ~0.2s. The default page size is picked from the file size (500 entries under 10MB, down to 50 above 100MB).

## 🌍 Internationalization

The application supports multiple languages:
- **English** (default)
- **Spanish** (Español)
- **French** (Français)
- **Italian** (Italiano)
- **German** (Deutsch)
- **Portuguese** (Portugês)
- **Catalan** (Català)

Language detection is automatic based on browser settings, with manual override available.

## 🔧 Configuration

### URL Parameters
- `?lang=en` - Force English language
- `?lang=es` - Force Spanish language

### Browser Storage
The application uses localStorage for:
- Language preference

IP information is cached in memory for 24 hours (not persisted).

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Development Guidelines
- Follow existing code style and conventions
- Add comments for complex functionality
- Test with various log formats
- Run `node tests/parser.test.js` after touching `js/parser.js`
- Bump the version in `js/version.js` (and `manifest.json`) when releasing so the service worker cache refreshes
- Ensure responsive design compatibility
- Update documentation as needed

## 🐛 Bug Reports

Found a bug? Please open an issue with:
- Browser and version
- Log file format (anonymized sample if possible)
- Steps to reproduce
- Expected vs actual behavior

## Support

☕ If you find this project helpful, consider buying me a coffee!

[![Ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/drkbcn)

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Apache Software Foundation** for the web server that generates these logs
- **Tailwind CSS** team for the excellent utility-first framework
- **Alpine.js** community for the lightweight reactive framework
- **ipapi.co** for geolocation and **Google DNS over HTTPS** for reverse lookups
- **AbuseIPDB** for IP reputation data
- All contributors and users who help improve this project

---

<div align="center">

**Made with ❤️ by [drkbcn](https://github.com/drkbcn)**

⭐ Star this repo if you find it useful!

</div>

