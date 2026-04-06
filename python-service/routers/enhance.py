from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any

from services.job_intelligence_service import generate_enhancements

router = APIRouter()

class EnhanceRequest(BaseModel):
    resume_json: Dict[str, Any]
    job_description: str
    job_title: str
    company_name: str

class EnhanceResponse(BaseModel):
    enhancement_report: Dict[str, Any]

@router.post("/enhance", response_model=EnhanceResponse)
async def enhance_endpoint(request: EnhanceRequest):
    if not request.job_description.strip():
        raise HTTPException(status_code=400, detail="Job description cannot be empty")
    
    try:
        report = await generate_enhancements(request.resume_json, request.job_description, request.job_title, request.company_name)
        return {"enhancement_report": report}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Enhancement generation failed: {str(e)}")
