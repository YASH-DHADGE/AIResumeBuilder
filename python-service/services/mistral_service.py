"""
Mistral AI service for structured resume text extraction.
Uses Mistral's structured JSON extraction to parse resume text into JSON.
"""

import os
import json
import re
from mistralai.client import Mistral
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
            raise ValueError(f"Mistral did not return valid JSON: {raw[:500]}")

    return sections
