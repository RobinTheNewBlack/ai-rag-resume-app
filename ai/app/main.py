from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import jobs, resumes, chat
from app.db.database import Base, engine
import app.utils.logger # Initialize logger

# Auto-create tables (in production use Alembic)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Resume Screening API")

# Setup CORS for Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Change in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to AI Resume Screening System"}

# Register API routers
app.include_router(jobs.router, prefix="/api/jobs", tags=["Jobs"])
app.include_router(resumes.router, prefix="/api/resumes", tags=["Resumes"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])
