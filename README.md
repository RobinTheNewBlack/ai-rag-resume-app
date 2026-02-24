# AI Resume Screening System 🚀

This project is an AI-powered Resume Screening System that analyzes uploaded resumes (PDF/DOCX) against Job Descriptions using LangChain and Google Gemini. It provides structured extraction, automated scoring, summary generation, and a natural language HR Chat Assistant (RAG).

The project is divided into two main components:
1. **`ai/`**: The FastAPI Backend engine powering the AI pipelines.
2. **`frontend/`**: The Next.js Web UI for HR users to manage jobs and view candidate profiles.

---

## 🏗️ 1. Backend (`/ai`)
The backend is built with **FastAPI**, **LangChain**, **PostgreSQL** (for relational data), and **ChromaDB** (for vector storage/RAG).

### Prerequisites
- Python 3.12+
- `uv` (Fast Python package installer and resolver)
- PostgreSQL database (Local or Docker)

### Environment Variables
Create a `.env` file inside the `ai/` folder:
```env
GOOGLE_API_KEY="your-gemini-api-key"
GEMINI_MODEL="gemini-2.5-flash"
DATABASE_URL="postgresql://user:password@localhost:5432/resume_db"
```

### Installation & Setup
1. Navigate to the backend directory:
   ```bash
   cd ai
   ```
2. Install dependencies using `uv`:
   ```bash
   uv sync
   ```
3. Start the FastAPI server:
   ```bash
   uv run uvicorn app.main:app --reload
   ```
   *The API will be running at `http://localhost:8000`. You can view the Swagger Docs at `http://localhost:8000/docs`.*

---

## 🖥️ 2. Frontend (`/frontend`)
The frontend is a modern web application built with **Next.js 15 (App Router)**, **Tailwind CSS**, and **Shadcn UI**.

### Prerequisites
- Node.js (v18+)
- `npm` or `yarn`

### Environment Variables (Optional for now)
If the backend is running on a different port/host, you would typically set an environment variable for the API base URL here. By default, the frontend will be set up to call `http://localhost:8000`.

### Installation & Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   *The UI will be accessible at `http://localhost:3000`. It will automatically redirect to `/dashboard`.*

---

## 🌟 Key Features

### HR Job Management
- Create Job requirements and assign dynamic AI weighting criteria (e.g., Skills 50%, Experience 30%, Education 20%).

### Automated Processing Pipeline
1. **Document Loading**: Extracts raw text from PDFs and DOCXs.
2. **Extraction Chain**: Uses LLM Structured Output to convert unstructured text into rigid JSON format (Name, Skills, Experience, Education).
3. **Scoring Chain**: Cross-references the extracted JSON with the Job Description to automatically generate a Match Score (0-100) and recommendation status (Shortlisted/Pending/Rejected).
4. **Summary Chain**: Condenses the profile into a 3-5 sentence readable summary.

### Vector Q&A (RAG)
- Raw resumes are embedded into **ChromaDB**. HR can use the interactive **Chatbot Panel** to ask questions like *"Who has the most experience with React?"* and the AI will scan the database to answer contextually.
