<div align="center">

# 💀 HackerNotes

**The open-source cybersecurity knowledge base — from foundations to advanced exploitation.**

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Contributions Welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg)](contributors/contributing.md)

[**Browse Paths →**](https://your-username.github.io/HackerNotes)

</div>

---

## 📖 What is HackerNotes?

HackerNotes is a **deep, structured cybersecurity knowledge base** built for learners who want to reach professional-level understanding. Unlike CTF platforms, there are no challenges — only thorough, methodical notes covering real techniques used by security professionals.

**Philosophy:** Every note goes from beginner explanation → technical deep dive → full exploitation methodology.

---

## 🗺️ Learning Paths

| Path | Topics | Coverage |
|------|--------|----------|
| 🌐 **Web Pentesting** | 40+ notes across 12 phases | HTTP, Auth, XSS, SQLi, SSRF, SSTI, APIs... |
| 🎯 **Penetration Testing** | Network pentesting fundamentals | Recon, Scanning, Exploitation, Post-Exploitation |
| 🔴 **Red Teaming** | Adversary simulation | C2, Initial Access, Lateral Movement, EDR Evasion |
| ☁️ **Cloud Security** | AWS, containers, IAM | Misconfigs, IAM exploitation, Container escapes |
| 🔌 **API Pentesting** | REST, GraphQL, OWASP API Top 10 | BOLA, Mass Assignment, Auth bypass |
| 🏛️ **Active Directory** | Complete AD attack path | Kerberoasting, DCSync, Golden Ticket, AD CS |

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/your-username/HackerNotes.git

# Open locally
cd HackerNotes
# Open index.html in your browser
# OR serve with Python:
python3 -m http.server 8080
# Visit: http://localhost:8080
```

Or visit the **[live GitHub Pages site](https://your-username.github.io/HackerNotes)**.

---

## 🏗️ Tech Stack

| Component | Technology |
|-----------|-----------|
| UI | HTML5 + Custom CSS (dark theme) |
| Markdown rendering | Marked.js |
| Sanitization | DOMPurify |
| Syntax highlighting | Prism.js |
| Diagrams | Mermaid.js |
| Search | Lunr.js (client-side full-text) |
| Hosting | GitHub Pages (100% static) |

---

## 📁 Structure

```
HackerNotes/
├── index.html              # Home page
├── paths.html              # All learning paths
├── viewer.html             # Note reader
├── search.html             # Full-text search
├── assets/
│   ├── css/                # Styling
│   └── js/                 # App logic
├── notes/
│   ├── web-pentesting/     # 12 phases, 40+ notes
│   │   ├── 01-foundations/
│   │   ├── 02-web-architecture/
│   │   ├── 03-http-protocol/
│   │   ├── 04-client-side/
│   │   ├── 05-authentication/
│   │   ├── 06-core-vulnerabilities/
│   │   ├── 07-advanced-vulnerabilities/
│   │   ├── 08-api-security/
│   │   ├── 09-modern-web/
│   │   ├── 10-methodology/
│   │   ├── 11-post-exploitation/
│   │   └── 12-reporting/
│   ├── pentesting/
│   ├── red-teaming/
│   ├── cloud-security/
│   ├── api-pentesting/
│   └── ad-pentesting/
├── data/
│   └── navigation.json     # All nav data + JS constants
└── contributors/
    ├── contributing.md
    └── note-template.md
```

---

## 🤝 Contributing

We welcome contributions! Read [CONTRIBUTING.md](contributors/contributing.md) for guidelines.

**Quick steps:**
1. Fork the repo
2. Write a note using the [template](contributors/note-template.md)
3. Place it in the correct path folder
4. Open a Pull Request

---

## 📜 License

MIT License — free to use, share, and contribute.

---

<div align="center">
Built by the community, for the community. 🔐
</div>
