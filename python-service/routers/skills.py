"""
Router: /extract-job-skills
Uses Mistral AI to extract skills from a job description.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from services.mistral_service import extract_job_skills

router = APIRouter()


class SkillsRequest(BaseModel):
    job_description: str


class SkillsResponse(BaseModel):
    skills: list[str]


@router.post("/extract-job-skills", response_model=SkillsResponse)
async def extract_skills(request: SkillsRequest):
    """
    Extract required skills from a job description using Mistral AI.
    """
    if not request.job_description.strip():
        raise HTTPException(status_code=400, detail="job_description cannot be empty")

    try:
        skills = await extract_job_skills(request.job_description)
        return {"skills": skills}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Skill extraction failed: {str(e)}"
        )
