# AI Resume Builder 🚀

A full-stack, AI-powered resume builder that parses resumes, matches skills against job descriptions, and exports optimized resumes — all with a Chrome extension for LinkedIn integration.

## Architecture

```
ai-resume-builder/
├── client/          → React 18 + Vite + TailwindCSS (port 5173)
├── server/          → Express 5 + Mongoose API (port 5000)
├── python-service/  → FastAPI AI microservice (port 8000)
├── chrome-extension/→ Manifest V3 Chrome Extension
└── docker-compose.yml
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, TailwindCSS, Radix UI, Lucide Icons |
| Backend | Node.js 20, Express 5, Mongoose, JWT Auth |
| Database | MongoDB Atlas |
| AI / LLM | Google Gemini Flash (resume parsing), Groq LLaMA 3 70B (skill extraction) |
| Embeddings | sentence-transformers (all-MiniLM-L6-v2) |
| File Parse | pdfplumber + python-docx (Python), pdf-parse + mammoth (Node) |
| Export | docxtemplater + PizZip (DOCX), Puppeteer (PDF) |
| Email | Nodemailer (SMTP) |
| Extension | Chrome Manifest V3, LinkedIn DOM scraping |

## Prerequisites

- **Node.js** 20+
- **Python** 3.11+
- **MongoDB** (local or Atlas)
- **Google Gemini API Key** — [Get one here](https://aistudio.google.com/apikey)
- **Groq API Key** — [Get one here](https://console.groq.com/keys)

## Setup Instructions

### 1. Clone & Install

```bash
git clone <repo-url>
cd ai-resume-builder
```

### 2. Python Service (port 8000)

```bash
cd python-service
python -m venv venv
source venv/bin/activate     # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY and GROQ_API_KEY

# Start the service
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 3. Express Server (port 5000)

```bash
cd server
npm install

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, and SMTP settings

# Start the server
npm run dev
```

### 4. React Client (port 5173)

```bash
cd client
npm install
npm run dev
```

### 5. Chrome Extension

1. Open Chrome → `chrome://extensions`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select the `chrome-extension/` folder
5. Pin the extension from the toolbar

### 6. Docker (Optional — MongoDB + Python)

```bash
docker-compose up -d
```

This starts MongoDB on port 27017 and the Python service on port 8000.

## Environment Variables

### Server (`.env`)
```
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/ai_resume_builder
JWT_SECRET=your_secret_key
PYTHON_SERVICE_URL=http://localhost:8000
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your_app_password
CLIENT_URL=http://localhost:5173
```

### Python Service (`.env`)
```
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
UPLOADS_DIR=../server/uploads
```

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login → JWT |

### Resume (Auth Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/resume/upload` | Upload PDF/DOCX → AI parse |
| GET | `/api/resume/:id` | Get resume JSON |
| PUT | `/api/resume/:id/sections` | Update sections |
| PATCH | `/api/resume/:id/skills` | Add/remove skills |

### Job (Auth Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/job/analyze` | Analyze job desc → ATS score |

### Export (Auth Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/export/:id/docx` | Download DOCX |
| POST | `/api/export/:id/pdf` | Download PDF |
| POST | `/api/export/:id/email` | Email resume |

## Features

- 📄 **Smart Resume Parsing** — Upload PDF/DOCX, AI extracts structured sections
- 🎯 **ATS Score Analysis** — Match resume skills against job descriptions
- ✏️ **Inline Editor** — Edit every section with auto-save
- 🧩 **Chrome Extension** — Scrape LinkedIn job posts, analyze in one click
- 📊 **Skill Matching** — Semantic similarity via sentence-transformers
- 📥 **Export** — Download as DOCX or PDF, or email to yourself
- 🔐 **JWT Auth** — Secure user accounts

## License

MIT
