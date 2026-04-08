# Sumi.ai — AI Resume Screener

An AI-powered resume screening system that automatically extracts, scores, and ranks candidates against job requirements using Google Gemini. HR teams can also ask natural language questions about candidates through a RAG-based chat interface.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Screenshots](#screenshots)
- [Architecture](#architecture)
- [Directory Structure](#directory-structure)
- [Setup & Installation](#setup--installation)
- [How the AI Works](#how-the-ai-works)
- [Resume Processing Flow](#resume-processing-flow)
- [What Each Chain Does](#what-each-chain-does)
- [Data Storage](#data-storage)
- [API Reference](#api-reference)

---

## Project Overview

### What it does

1. **Resume Upload** — HR uploads PDF or DOCX resumes for a specific job posting
2. **AI Analysis** — The system automatically extracts structured data, scores the candidate, evaluates resume design, and generates a summary
3. **Candidate Dashboard** — View all candidates ranked by match score with filtering by role and status
4. **HR Chat** — Ask natural language questions like *"Which candidates have Python experience?"* and get answers grounded in actual resume data

### Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, React 19, Tailwind CSS, shadcn/ui |
| Backend | FastAPI, SQLAlchemy, PostgreSQL |
| LLM | Google Gemini 2.5 Pro |
| Vector DB | ChromaDB (persistent, local) |
| Embeddings | HuggingFace `all-MiniLM-L6-v2` |
| File Storage | Local disk (`ai/app/uploads/resumes/`) |

---

## Screenshots

![Screenshot 1](assets/image/resume1.png)
![Screenshot 2](assets/image/resume2.png)
![Screenshot 3](assets/image/resume3.png)
![Screenshot 4](assets/image/resume4.png)
![Screenshot 5](assets/image/resume5.png)
![Screenshot 6](assets/image/resume6.png)
![Screenshot 7](assets/image/resume7.png)

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Next.js Frontend                  │
│ Dashboard │ Jobs │ Upload │ Candidate Detail │ Chat │
│                                                     │
│           Next.js Route Handlers (/api/*)           │
│         (proxy layer — hides backend URL)           │
└─────────────────────┬───────────────────────────────┘
                      │ HTTP
┌─────────────────────▼───────────────────────────────┐
│                 FastAPI Backend                     │
│   /api/jobs   /api/resumes   /api/chat              │
│                                                     │
│  ┌──────────────────────────────────────────────┐   │
│  │           Resume Pipeline                    │   │
│  │  Extract → Score → Design → Summary → Save   │   │
│  └──────────────────────────────────────────────┘   │
│                                                     │
│   ┌─────────────────┐   ┌───────────────────────┐   │
│   │   PostgreSQL    │   │   ChromaDB            │   │
│   │  Jobs           │   │  Resume embeddings    │   │
│   │  Candidates     │   │  for HR Q&A search    │   │
│   │  Scores         │   └───────────────────────┘   │
│   └─────────────────┘                               │
└─────────────────────────────────────────────────────┘
                      │
              Google Gemini API
```

---

## Directory Structure

```
ai-rag-resume/
├── ai/                              # Python FastAPI backend
│   ├── app/
│   │   ├── main.py                  # App entry point, router registration
│   │   ├── config/
│   │   │   └── config.py            # Settings (API keys, model, DB URL)
│   │   ├── api/
│   │   │   ├── jobs.py              # Job CRUD endpoints
│   │   │   ├── resumes.py           # Resume upload, candidates, download
│   │   │   └── chat.py              # HR Q&A chat endpoint
│   │   ├── core/
│   │   │   ├── prompt.py            # All LLM prompts (centralized)
│   │   │   ├── extraction_chain.py  # Parses resume to structured data
│   │   │   ├── scoring_chain.py     # Scores candidate vs job
│   │   │   ├── summary_chain.py     # Generates candidate summary
│   │   │   ├── design_chain.py      # Evaluates resume design (vision AI)
│   │   │   └── rag_chain.py         # RAG chain for HR Q&A
│   │   ├── db/
│   │   │   └── database.py          # SQLAlchemy engine, session, Base
│   │   ├── models/
│   │   │   ├── domain.py            # ORM models: Job, Candidate, CandidateScore
│   │   │   └── schemas.py           # Pydantic schemas for API and LLM output
│   │   ├── services/
│   │   │   ├── document_parser.py   # Extracts text from PDF/DOCX files
│   │   │   └── resume_pipeline.py   # Orchestrates all AI processing steps
│   │   ├── vector_store/
│   │   │   └── vector_store.py      # Chroma client and collection setup
│   │   ├── ingestion/
│   │   │   ├── loader.py            # Document loading utilities
│   │   │   ├── splitter.py          # Text chunking for vector store
│   │   │   └── embedder.py          # Embedding generation helpers
│   │   └── utils/
│   │       └── logger.py            # Logging configuration
│   ├── pyproject.toml               # Python dependencies
│   └── .env                         # Backend environment variables
│
└── frontend/                        # Next.js frontend
    └── src/
        ├── app/
        │   ├── layout.tsx               # Root layout with Sidebar
        │   ├── page.tsx                 # Home / landing page
        │   ├── dashboard/page.tsx       # Candidate dashboard
        │   ├── chat/page.tsx            # HR chat interface
        │   ├── jobs/
        │   │   ├── page.tsx             # Job list with edit and delete
        │   │   └── create/page.tsx      # Create job form
        │   ├── candidates/
        │   │   ├── upload/page.tsx      # Resume upload
        │   │   └── [id]/page.tsx        # Candidate detail with scores
        │   └── api/                     # Next.js Route Handlers (proxy)
        │       ├── chat/route.ts
        │       ├── jobs/route.ts
        │       ├── jobs/[id]/route.ts
        │       └── resumes/
        │           ├── candidates/route.ts
        │           ├── candidates/[id]/route.ts
        │           ├── candidates/[id]/status/route.ts
        │           ├── upload/route.ts
        │           └── download/[id]/route.ts
        ├── components/
        │   ├── layout/Sidebar.tsx       # Navigation sidebar
        │   ├── feature/AssistantChat.tsx  # Chat UI component
        │   └── ui/                      # shadcn/ui components
        ├── styles/globals.css
        └── lib/utils.ts                 # cn() tailwind utility
```

---

## Setup & Installation

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL
- Google Gemini API key

### 1. Backend

```bash
cd ai
```

Install dependencies:

```bash
uv sync
# or: pip install -e .
```

Create `ai/.env`:

```env
GOOGLE_API_KEY=your_google_api_key_here
GEMINI_MODEL=gemini-2.5-pro
DATABASE_URL=postgresql://user:password@localhost:5432/resume_db
LOG_LEVEL=info
CHUNK_SIZE=1000
CHUNK_OVERLAP=200
```

Create the PostgreSQL database, then start the server:

```bash
createdb resume_db
uv run uvicorn app.main:app --reload --port 8000
```

Database tables are created automatically on startup. Swagger docs are available at `http://localhost:8000/docs`.

### 2. Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
BACKEND_URL=http://localhost:8000
```

Start the dev server:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

### 3. First Use

1. Go to **Jobs** → **Create New Job** and define a job posting with scoring weights
2. Go to **Upload Resumes**, select the job, and drag in PDF or DOCX files
3. The AI analyzes each resume automatically — watch the progress in real time
4. View ranked results in the **Candidate Dashboard**
5. Use the **Chat** page to ask natural language questions about candidates

---

## How the AI Works

The system uses **Google Gemini 2.5 Pro** for all language and vision tasks. All text chains use structured output (enforced JSON via Pydantic schemas) to ensure the LLM returns consistent, parseable data every time.

For the chat feature, resumes are embedded using **HuggingFace `all-MiniLM-L6-v2`** (runs locally, no API cost) and stored in **ChromaDB**. When a question is asked, the most relevant resume chunks are retrieved and passed to Gemini as context.

---

## Resume Processing Flow

When a resume is uploaded, the backend runs a sequential pipeline:

```
1. Fetch job from PostgreSQL
   Get the job's description, requirements, and scoring weights.
   │
   ▼
2. Parse document
   PDF  → PyPDFLoader (text extraction)
   DOCX → Docx2txtLoader
   File saved to: uploads/resumes/<uuid>_filename.pdf
   │
   ▼
3. extraction_chain  (Gemini)
   Input:  raw resume text (capped at 12,000 characters)
   Output: structured JSON — name, email, phone, skills,
           experience, education, certifications, languages
   │
   ▼
4. scoring_chain  (Gemini)
   Input:  extracted candidate data + job description + requirements
   Output: skill_score, experience_score, education_score (each 0–100)
           + reasoning per dimension + overall recommendation
   │
   ▼
5. design_chain  (Gemini Vision)
   Input:  first page of PDF rendered as a PNG image (2× zoom)
   Output: design_score (0–100) measuring ATS-friendliness
   │
   ▼
6. Calculate weighted overall score
   overall = (skill_score  × skill_weight / 100)
           + (exp_score    × experience_weight / 100)
           + (edu_score    × education_weight / 100)
           + (design_score × design_weight / 100)

   Default weights per job: 45% skill / 30% experience / 15% education / 10% design
   │
   ▼
7. Map recommendation → status
   "Pass"   → SHORTLISTED
   "Review" → PENDING
   "Fail"   → REJECTED
   │
   ▼
8. summary_chain  (Gemini)
   Input:  all extracted data + scores
   Output: 8–10 sentence narrative profile summary
   │
   ▼
9. Save to PostgreSQL
   → candidates table  (profile, status, file path)
   → candidate_scores  (all 4 scores + reasoning JSON)
   │
   ▼
10. Add to ChromaDB
    Resume text is chunked, embedded, and stored with metadata
    (candidate_id, job_id, name) for HR Q&A search
```

---

## What Each Chain Does

### `extraction_chain.py` — Resume Data Extraction

Converts raw resume text into structured JSON using Gemini's structured output mode.

- **Input**: Plain text from PDF or DOCX (max 12,000 characters)
- **Output**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+66812345678",
    "skills": ["Python", "FastAPI", "Docker"],
    "experience": [{ "company": "...", "role": "...", "duration": "..." }],
    "education": [{ "institution": "...", "degree": "...", "year": "..." }],
    "certifications": ["AWS Certified Developer"],
    "languages": ["Thai", "English"]
  }
  ```
- Automatically normalizes emails to lowercase and deduplicates skills

---

### `scoring_chain.py` — Candidate Scoring

Evaluates how well the candidate fits the job description.

- **Input**: Extracted candidate data + job title + description + requirements
- **Output**:
  ```json
  {
    "skill_evaluation":      { "score": 85, "reason": "..." },
    "experience_evaluation": { "score": 70, "reason": "..." },
    "education_evaluation":  { "score": 60, "reason": "..." },
    "overall_recommendation": "Pass"
  }
  ```
- Scores are 0–100; recommendation is `"Pass"`, `"Review"`, or `"Fail"`

---

### `design_chain.py` — Resume Design Evaluation

Uses Gemini Vision to assess how ATS-friendly the resume looks visually.

- **Input**: First page of the PDF rendered as a PNG image at 2× zoom (via PyMuPDF)
- **Output**: `design_score` (0–100) and a short reason
- **Scoring logic**:
  - **High score (80–100)**: Clean single-column layout, standard fonts, clear section headers — easy for ATS parsers to read
  - **Low score (0–40)**: Heavy graphics, tables, multi-column layout, photos — ATS systems often fail to parse these correctly
- Falls back to `score: 0` if the file is a DOCX (no image rendering)

---

### `summary_chain.py` — Profile Summarization

Generates a human-readable narrative about the candidate.

- **Input**: All extracted data (skills, experience, education) + scores from scoring chain
- **Output**: 8–10 sentence paragraph that highlights the candidate's strengths and key observations
- Temperature is set to 0.3 for consistent, factual output

---

### `rag_chain.py` — HR Q&A (Retrieval-Augmented Generation)

Lets HR teams ask natural language questions about candidates.

- **Embeddings**: HuggingFace `all-MiniLM-L6-v2` (384-dimensional, runs locally)
- **Vector store**: ChromaDB
- **Retrieval**: Fetches the top 5 most semantically relevant resume chunks for the question
- **Generation**: Gemini generates an answer using only the retrieved chunks as context — it will not hallucinate information not present in the resumes
- Supports an optional `job_id` filter to scope the search to one specific job posting

Example questions:
- *"Who has the most experience with machine learning?"*
- *"Which candidates have a Master's degree?"*
- *"Compare the top 3 candidates for communication skills"*

---

## Data Storage

### PostgreSQL — Structured Data

**`jobs`**
| Column | Type | Description |
|---|---|---|
| id | int | Primary key |
| title | string | Job title |
| description | text | Job description |
| requirements | text | Required skills and qualifications |
| skill_weight | int | % weight for skill score (default 45) |
| experience_weight | int | % weight for experience score (default 30) |
| education_weight | int | % weight for education score (default 15) |
| design_weight | int | % weight for design score (default 10) |
| created_at | datetime | |

**`candidates`**
| Column | Type | Description |
|---|---|---|
| id | int | Primary key |
| job_id | int | FK → jobs |
| name | string | Extracted from resume |
| email | string | Extracted from resume |
| phone | string | Extracted from resume |
| extracted_data | JSON | Full structured extraction result |
| summary | text | AI-generated narrative summary |
| status | enum | PENDING / SHORTLISTED / REJECTED |
| resume_file_path | string | Relative path to uploaded file on disk |
| vector_id | string | ChromaDB document ID for this candidate |
| created_at | datetime | |

**`candidate_scores`**
| Column | Type | Description |
|---|---|---|
| id | int | Primary key |
| candidate_id | int | FK → candidates |
| skill_score | float | 0–100 |
| experience_score | float | 0–100 |
| education_score | float | 0–100 |
| design_score | float | 0–100 |
| overall_score | float | Weighted average 0–100 |
| reasoning | JSON | Per-dimension reason text from LLM |

### ChromaDB — Vector Store

Stores resume embeddings for semantic search used by the chat feature.

- **Location**: `ai/chroma_data/` (persistent local directory, created automatically)
- **Collection**: `resumes`
- **Document ID format**: `candidate_{candidate_id}`
- **Metadata per document**: `candidate_id`, `job_id`, `name`
- **Embedding model**: `all-MiniLM-L6-v2` (384-dimensional vectors)
- When a candidate is deleted, their vector is removed from Chroma alongside the database record and file

### File Storage

Uploaded resume files are saved to `ai/app/uploads/resumes/` with unique filenames (`<uuid4>_<originalname>.pdf`). The relative path is stored in `candidates.resume_file_path` and served back through the download endpoint.

---

## API Reference

All endpoints are accessible via Next.js route handlers at `/api/*` (which proxy to the FastAPI backend at `BACKEND_URL`).

| Method | Path | Description |
|---|---|---|
| GET | `/api/jobs/` | List all jobs |
| POST | `/api/jobs/` | Create a new job |
| PUT | `/api/jobs/{id}` | Update a job |
| DELETE | `/api/jobs/{id}` | Delete job and all its candidates |
| POST | `/api/resumes/upload` | Upload a resume — triggers full AI pipeline |
| GET | `/api/resumes/candidates` | List all candidates sorted by score (supports `?job_id=`) |
| GET | `/api/resumes/candidates/{id}` | Get full candidate details and score breakdown |
| PATCH | `/api/resumes/candidates/{id}/status` | Manually update candidate status |
| DELETE | `/api/resumes/candidates/{id}` | Delete candidate, file, and vector |
| GET | `/api/resumes/download/{id}` | Download original resume file |
| POST | `/api/chat/` | Send a question to the HR Q&A assistant |

**Chat request/response example:**
```json
// POST /api/chat/
{ "message": "Which candidates have Docker experience?", "job_id": 1 }

// Response
{ "response": "Based on the resumes, 2 candidates mention Docker..." }
```
