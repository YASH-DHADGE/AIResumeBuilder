"""
Mistral AI service for structured resume text extraction.
Uses Mistral's structured JSON extraction to parse resume text into JSON.
"""

import os
import json
import re
from mistralai import Mistral
from dotenv import load_dotenv

load_dotenv()

# Initialize Mistral client
api_key = os.getenv("MISTRAL_API_KEY", "")
client = Mistral(api_key=api_key)

PARSE_SYSTEM_PROMPT = "You are a resume parsing expert."

PARSE_USER_TEMPLATE = """
Parse this resume text and return a strict JSON object with this exact structure:
{{
  "personalInfo": {{ "name":"","email":"","phone":"","location":"","linkedin":"","github":"" }},
  "summary": "",
  "experience": [{{"company":"","role":"","duration":"","bullets":[]}}],
  "education": [{{"institution":"","degree":"","year":"","gpa":""}}],
  "skills": [],
  "projects": [{{"name":"","description":"","techStack":[],"link":""}}],
  "certifications": []
}}
Resume text:
{resume_text}
Return ONLY the JSON. No explanation. No markdown.
"""


async def parse_resume_text(resume_text: str) -> dict:
    """
    Send resume text to Mistral AI and get back structured JSON sections.
    """
    if not api_key:
        raise ValueError("MISTRAL_API_KEY is not configured.")

    prompt = PARSE_USER_TEMPLATE.format(resume_text=resume_text)

    # Note: Mistral's current library uses synchronous calls for most standard endpoints, 
    # but there are async versions. We'll stick to a straightforward sync chat call wrapped in the async route.
    response = client.chat.complete(
        model="mistral-large-latest",
        messages=[
            {"role": "system", "content": PARSE_SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ],
        response_format={"type": "json_object"}
    )
    
    raw = response.choices[0].message.content.strip()

    # Strip markdown code fences if present
    if raw.startswith("```"):
        raw = re.sub(r"^```(?:json)?\s*", "", raw)
        raw = re.sub(r"\s*```$", "", raw)

    try:
        sections = json.loads(raw)
    except json.JSONDecodeError:
        # Attempt to find JSON object in response
        match = re.search(r"\{.*\}", raw, re.DOTALL)
        if match:
            sections = json.loads(match.group())
        else:
            raise ValueError(f"Mistral did not return valid JSON: {raw:.500s}")

    return sections


async def extract_job_skills(job_description: str) -> list[str]:
    """
    Extract required skills from a job description using Mistral AI.
    """
    if not api_key:
        raise ValueError("MISTRAL_API_KEY is not configured.")

    prompt = f"""
    Extract ALL required technical and soft skills from this job description.
    Return ONLY a JSON array of strings. No explanation.
    
    Job Description:
    {job_description}
    """

    response = await client.chat.complete_async(
        model="mistral-large-latest",
        messages=[
            {"role": "system", "content": "You are a technical job description analyzer."},
            {"role": "user", "content": prompt}
        ],
        response_format={"type": "json_object"}
    )
    
    raw = response.choices[0].message.content.strip()

    try:
        # If response_format was json_object, Mistral might still wrap it in a root key
        data = json.loads(raw)
        if isinstance(data, dict):
            # Look for a list in the dict
            for val in data.values():
                if isinstance(val, list):
                    return [str(s) for s in val]
        if isinstance(data, list):
            return [str(s) for s in data]
        
        raise ValueError("Mistral did not return a list of skills.")
    except json.JSONDecodeError:
        match = re.search(r"\[.*\]", raw, re.DOTALL)
        if match:
            return json.loads(match.group())
        raise ValueError(f"Mistral did not return valid JSON array: {raw:.500s}")
