from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any

from services.job_intelligence_service import generate_ats_score

router = APIRouter()

class AtsScoreRequest(BaseModel):
    resume_json: Dict[str, Any]
    job_description: str

class AtsScoreResponse(BaseModel):
    score_report: Dict[str, Any]

@router.post("/ats-score", response_model=AtsScoreResponse)
async def ats_score_endpoint(request: AtsScoreRequest):
    if not request.job_description.strip():
        raise HTTPException(status_code=400, detail="Job description cannot be empty")
    
    try:
        report = await generate_ats_score(request.resume_json, request.job_description)
        return {"score_report": report}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ATS Score generation failed: {str(e)}")
