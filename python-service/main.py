"""
AI Resume Builder - FastAPI Microservice
Handles resume parsing (Gemini), job skill extraction (Groq), and skill matching (embeddings).
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from routers import parse, skills, match, ats, enhance, cover_letter

app = FastAPI(
    title="AI Resume Builder - Python Service",
    description="AI microservice for resume parsing, skill extraction, and matching",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5000",
        "http://localhost:5173",
        "http://127.0.0.1:5000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(parse.router, tags=["Resume Parsing"])
app.include_router(skills.router, tags=["Skill Extraction"])
app.include_router(match.router, tags=["Skill Matching"])
app.include_router(ats.router, tags=["Job Intelligence"])
app.include_router(enhance.router, tags=["Job Intelligence"])
app.include_router(cover_letter.router, tags=["Job Intelligence"])


@app.get("/")
async def health_check():
    return {"status": "healthy", "service": "ai-resume-builder-python"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
