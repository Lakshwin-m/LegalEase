<div align="center"><pre>
  ██╗   ██╗██████╗ ██╗███╗   ███╗ █████╗ ██╗
  ██║   ██║██╔══██╗██║████╗ ████║██╔══██╗██║
  ██║   ██║██████╔╝██║██╔████╔██║███████║██║
  ██║   ██║██╔══██╗██║██║╚██╔╝██║██╔══██║██║
  ╚██████╔╝██║  ██║██║██║ ╚═╝ ██║██║  ██║██║
   ╚═════╝ ╚═╝  ╚═╝╚═╝╚═╝     ╚═╝╚═╝  ╚═╝╚═╝
              Democratizing Indian Law through Local, Multilingual AI
</pre></div>

<p align="center"><strong>10 languages · 100% local · privacy-first · real-time streaming · legal dictionary</strong></p>

<p align="center">
  <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-15.0-black?style=for-the-badge&logo=next.js" alt="Next.js"></a>
  <a href="https://fastapi.tiangolo.com/"><img src="https://img.shields.io/badge/FastAPI-Python-009688?style=for-the-badge&logo=fastapi" alt="FastAPI"></a>
  <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge" alt="License: MIT"></a>
</p>

<p align="center">
  <a href="#what-it-does">Features</a> ·
  <a href="#how-it-works-30-seconds">Architecture</a> ·
  <a href="#get-started-60-seconds">Install</a> ·
  <a href="#meet-mei">Meet MEI</a>
</p>

---

URIMAI is a powerful, locally-run AI application designed to make the **Indian Penal Code (IPC)** and Indian laws accessible to everyone. By breaking down complex legal jargon into simple, digestible explanations, URIMAI ensures that understanding your rights isn't restricted by language barriers or legal expertise.

At the heart of URIMAI is **MEI (Multilingual Engine for Information)**—your friendly, transparent, and intelligent legal guide.

## What it does

- **Multilingual Support** — Seamlessly switch between 10 Indian languages (English, Hindi, Tamil, Telugu, Kannada, Malayalam, Bengali, Marathi, Gujarati, Punjabi) inline.
- **Transparent Thinking** — See MEI's internal thought process and reasoning before it answers, ensuring complete transparency in legal explanations.
- **Legal Dictionary** — Built-in dictionary with fuzzy search to instantly look up complex legal terms and IPC sections.
- **Source Citations** — Every answer is backed by direct references to the source material via clickable source cards.
- **100% Local & Private** — Powered by local AI inference. Your legal queries and personal situations never leave your machine.
- **Premium UI/UX** — A deeply customized, distraction-free interface built with beautiful typography, smooth animations, and a rich brand palette.

## How it works (30 seconds)

```
 Your local machine
        │   queries · language selection · dictionary lookups
        ▼
    ┌────────────────────────────────────────────────────┐
    │  URIMAI   (runs locally — your data stays here)    │
    │  ────────────────────────────────────────────────  │
    │  Next.js Frontend  →  FastAPI Backend              │
    │                    ├─ Local LLM Context Manager    │
    │                    ├─ IPC RAG Retrieval Layer      │
    │                    └─ MEI Streaming Engine         │
    │                                                    │
    │  Fuzzy Dictionary  ·  Thought Process Exposer      │
    └────────────────────────────────────────────────────┘
        │   simplified legal explanations + source citations
        ▼
 You (in your preferred language)
```

## Get started (60 seconds)

### Prerequisites
- Node.js & Bun installed
- Python 3.9+ & `uv` installed

```bash
# 1 — Clone the repo
git clone https://github.com/Lakshwin-m/LegalEase.git
cd LegalEase

# 2 — Start the Backend (FastAPI)
uv run uvicorn backend.main:app --reload
# Backend runs at http://localhost:8000

# 3 — Start the Frontend (Next.js)
# In a new terminal window:
bun install
bun run dev
# Frontend runs at http://localhost:3000
```

## Meet MEI

**MEI (Multilingual Engine for Information)** isn't just a chatbot; she is an educator. 

Instead of throwing a wall of text at you, MEI structures her answers into:
1. **What the law says (simplified)**
2. **Punishment Details**
3. **Simple, real-world examples**
4. **Important Disclaimers**

> *Disclaimer: MEI is an AI assistant and cannot provide official legal advice. Information is for general understanding only. If you or someone you know needs legal help, please consult a qualified lawyer immediately.*

## License

MIT — see [LICENSE](LICENSE).
