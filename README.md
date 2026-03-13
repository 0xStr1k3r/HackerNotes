# HackerNotes

A free, open-source cybersecurity knowledge base covering penetration testing, web security, red teaming, cloud security, API security, and Active Directory attacks.

**Online version → [hackernotes.dev](https://hackernotes.dev)**

---

## Use Online

Visit **[hackernotes.dev](https://hackernotes.dev)** — no sign-up, no install, works in any browser.

---

## Use Offline

1. **Clone the repo**
   ```bash
   git clone https://github.com/0xStr1k3r/HackerNotes.git
   cd HackerNotes
   ```

2. **Serve locally** (pick any method)

   ```bash
   # Python
   python3 -m http.server 8080

   # Node.js
   npx serve .

   # VS Code
   # Install "Live Server" extension → right-click index.html → Open with Live Server
   ```

3. **Open your browser**
   ```
   http://localhost:8080
   ```

> **Note:** Do not open `index.html` directly as a file (`file://`). You need a local server because notes are loaded dynamically.

---

## Contribute

Contributions are welcome — whether it's fixing a typo, improving an existing note, or adding a new topic.

### How to contribute

1. **Fork the repository**
   ```
   https://github.com/0xStr1k3r/HackerNotes
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/HackerNotes.git
   cd HackerNotes
   ```

3. **Create a branch**
   ```bash
   git checkout -b add/your-topic-name
   ```

4. **Add or edit notes**

   Notes live in the `notes/` folder, organized by path and phase:
   ```
   notes/
   ├── web-pentesting/
   ├── pentesting/
    ├── red-teaming/
    ├── cloud-security/
    ├── api-pentesting/
    ├── linux-essentials/
    └── ad-pentesting/
    ```

   Each note is a plain Markdown (`.md`) file. Follow the existing style — use headings, code blocks, and Mermaid diagrams where helpful.

5. **Register your note in navigation**

   Open `data/navigation.json` and add your note's entry under the correct phase:
   ```js
   { id: "pentesting/04-reconnaissance/your-topic", title: "Your Topic Title" }
   ```
   The `id` must match the file path under `notes/` (without `.md`).

6. **Commit and push**
   ```bash
   git add .
   git commit -m "add: your topic name"
   git push origin add/your-topic-name
   ```

7. **Open a Pull Request** on GitHub against the `main` branch.

### Note writing guidelines

- Write for beginners but go deep — assume zero knowledge, build up to advanced
- Use real commands and examples
- Add a Mermaid diagram if it helps explain a concept
- Keep file names lowercase with hyphens: `sql-injection.md`

---

## License

MIT — free to use, share, and modify.
