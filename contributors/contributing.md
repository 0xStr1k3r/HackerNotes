# Contributing to HackerNotes

> HackerNotes is a community-driven, open-source cybersecurity knowledge base. Every contribution makes it better.

## 🌟 What We're Looking For

- Deep technical notes (not summaries — full depth)
- Real exploitation techniques and payloads
- Mermaid diagrams for complex concepts
- Beginner-friendly explanations for advanced topics
- Corrections and improvements to existing notes

## 📋 Before You Contribute

1. Check if the note already exists in [the paths](../paths.html)
2. Read the [Note Template](note-template.md)
3. Research thoroughly — cite OWASP, PortSwigger, CVEs where relevant
4. Test any payloads you include

## 🔄 Contribution Workflow

```
1. Fork the repository on GitHub
2. Create a branch: git checkout -b add/topic-name
3. Write your note following the template
4. Place it in the correct folder
5. Open a Pull Request with description of what you added
6. Wait for review (usually 48-72 hours)
7. Address any feedback
8. Get merged 🎉
```

## 📁 File Placement

| Path | Description |
|------|-------------|
| `notes/web-pentesting/06-core-vulnerabilities/` | Core web vulns (XSS, SQLi, etc.) |
| `notes/web-pentesting/07-advanced-vulnerabilities/` | Advanced web vulns |
| `notes/ad-pentesting/` | Active Directory attacks |
| `notes/cloud-security/` | Cloud attack notes |

## ✅ Quality Checklist

Before submitting, verify:

- [ ] Uses the standard note template structure
- [ ] Has a beginner-friendly explanation section
- [ ] Has technical deep-dive section
- [ ] Includes at least one Mermaid diagram
- [ ] Has real payload/command examples in code blocks
- [ ] Includes tools section with real commands
- [ ] Has detection and mitigation sections
- [ ] No copyrighted content copy-pasted
- [ ] All code blocks have language tags (```python, ```bash, etc.)

## ⚠️ Rules

- **No CTF writeups** — notes only, no challenge solutions
- **No plagiarism** — write in your own words, cite sources
- **No harmful content** — techniques must have educational framing
- **No credentials** — never include real passwords, API keys, etc.

## 💬 Questions?

Open a GitHub Issue or Discussion.
