from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional

from services.job_intelligence_service import generate_cover_letter

router = APIRouter()

class CoverLetterRequest(BaseModel):
    resume_json: Dict[str, Any]
    job_description: str
    job_title: str
    company_name: str
    candidate_name: str
    tone: Optional[str] = "Professional"
    length: Optional[str] = "Standard"
    style: Optional[str] = "Story-driven"
    format: Optional[str] = "Modern"

class CoverLetterResponse(BaseModel):
    cover_letter: Dict[str, Any]

@router.post("/cover-letter", response_model=CoverLetterResponse)
async def cover_letter_endpoint(request: CoverLetterRequest):
    if not request.job_description.strip():
        raise HTTPException(status_code=400, detail="Job description cannot be empty")
    
    try:
        report = await generate_cover_letter(
            request.resume_json, 
            request.job_description, 
            request.job_title, 
            request.company_name, 
            request.candidate_name,
            request.tone,
            request.length,
            request.style,
            request.format
        )
        return {"cover_letter": report}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cover Letter generation failed: {str(e)}")
