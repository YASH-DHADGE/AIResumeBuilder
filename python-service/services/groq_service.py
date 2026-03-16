"""
Groq SDK service for job skill extraction using LLaMA 3 70B.
"""

import os
import json
import re
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

SYSTEM_PROMPT = "You are a technical job description analyzer."

USER_TEMPLATE = """
Extract ALL required skills from this job description.
Return ONLY a raw JSON array of strings. No markdown, no explanation.
Example output: ["Python", "React", "AWS", "REST APIs", "Communication"]

Job Description:
{job_description}
"""


async def extract_job_skills(job_description: str) -> list[str]:
    """
    Use Groq's LLaMA 3 70B to extract a flat list of skills from a job description.
    """
    prompt = USER_TEMPLATE.format(job_description=job_description)

    chat_completion = client.chat.completions.create(
        model="llama3-70b-8192",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt},
        ],
        temperature=0.1,
        max_tokens=1024,
    )

    raw = chat_completion.choices[0].message.content.strip()

    # Strip markdown code fences if present
    if raw.startswith("```"):
        raw = re.sub(r"^```(?:json)?\s*", "", raw)
        raw = re.sub(r"\s*```$", "", raw)

    try:
        skills = json.loads(raw)
    except json.JSONDecodeError:
        # Try to find JSON array in the response
        match = re.search(r"\[.*\]", raw, re.DOTALL)
        if match:
            skills = json.loads(match.group())
        else:
            raise ValueError(f"Groq did not return a valid JSON array: {raw[:500]}")

    if not isinstance(skills, list):
        raise ValueError(f"Expected a list of skills, got: {type(skills)}")

    return [str(s) for s in skills]
