"""
Router: /match-skills
Uses sentence-transformers embeddings + cosine similarity
to match resume skills against job skills.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from services.embedding_service import match_skills

router = APIRouter()


class MatchRequest(BaseModel):
    resume_skills: list[str]
    job_skills: list[str]


class MatchResponse(BaseModel):
    matched: list[str]
    missing: list[str]
    ats_score: float


@router.post("/match-skills", response_model=MatchResponse)
async def match(request: MatchRequest):
    """
    Match resume skills to job skills using semantic embeddings.
    Returns matched skills, missing skills, and ATS score.
    """
    try:
        result = await match_skills(request.resume_skills, request.job_skills)
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Skill matching error: {str(e)}"
        )

    return result
