"""
Router: /parse-resume-text
Receives raw text from Node.js and sends it to Gemini Flash for structured extraction.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from services.mistral_service import parse_resume_text

router = APIRouter()


class ParseTextRequest(BaseModel):
    text: str


class ParseResponse(BaseModel):
    sections: dict


@router.post("/parse-resume-text", response_model=ParseResponse)
async def parse_resume_text_endpoint(request: ParseTextRequest):
    """
    Parse raw resume text and return structured sections via Gemini.
    """
    resume_text = request.text.strip()

    if not resume_text:
        raise HTTPException(status_code=400, detail="Text cannot be empty")

    try:
        sections = await parse_resume_text(resume_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Mistral parsing error: {str(e)}")

    return {"sections": sections}
