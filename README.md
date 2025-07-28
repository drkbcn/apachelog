# Apache Log Viewer 🌐

## Overview
🔍 **Apache Log Viewer** is a powerful, web-based tool designed to visualize and analyze Apache server logs. Built with modern web technologies including **Tailwind CSS**, **Alpine.js**, and **Heroicons**, this application provides an intuitive interface for log management and analysis.

## ✨ Features

### 🌎 Core Functionality
- **Multi-language support** (English, Spanish)
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
- **Chunked processing** for large files (50MB+ support)
- **Virtual pagination** for smooth navigation
- **Intelligent caching** for IP information
- **Progressive loading** with real-time progress indicators
- **Memory-efficient** parsing algorithms

### 🛡️ Security Features
- **Client-side processing** - your logs never leave your browser
- **IP reputation checking** via AbuseIPDB integration
- **Threat analysis** with visual indicators
- **Privacy-focused** design with no data collection

## 🛠️ Tech Stack

| Technology | Purpose | Version |
|------------|---------|---------|
| **Tailwind CSS** | Styling & UI Framework | Latest CDN |
| **Alpine.js** | Reactive JavaScript Framework | 3.x |
| **Heroicons** | SVG Icon Library | Latest |
| **Vanilla JavaScript** | Core Application Logic | ES6+ |

## 🎯 Supported Log Formats

- **Combined Log Format** (CLF)
- **Common Log Format** 
- **Extended Log Format** with additional fields
- **NCSA format variations**
- **Custom Apache configurations**

## 🚀 Usage

### Online Version
Visit the live version at: [Apache Log Viewer on GitHub Pages](https://drkbcn.github.io/apachelog)

### Local Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/drkbcn/apachelog.git
   ```
2. Open `index.html` in your web browser
3. Upload your Apache log file and start analyzing!

### File Requirements
- **Supported extensions**: `.log`, `.txt`, `.access`, `.error`
- **Maximum recommended size**: 50MB (larger files supported with performance warning)
- **Encoding**: UTF-8 recommended

## 📊 Performance Benchmarks

| File Size | Processing Time | Memory Usage | Recommended Page Size |
|-----------|----------------|--------------|----------------------|
| < 1MB | < 1 second | < 10MB | 500-1000 entries |
| 1-10MB | 1-5 seconds | 10-50MB | 250-500 entries |
| 10-50MB | 5-15 seconds | 50-200MB | 100-250 entries |
| > 50MB | 15+ seconds | 200MB+ | 50-100 entries |

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
- Language preferences
- Page size settings
- IP information cache (24-hour TTL)

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
- **ipinfo.io** for geolocation services
- **AbuseIPDB** for IP reputation data
- All contributors and users who help improve this project

---

<div align="center">

**Made with ❤️ by [drkbcn](https://github.com/drkbcn)**

⭐ Star this repo if you find it useful!

</div>

