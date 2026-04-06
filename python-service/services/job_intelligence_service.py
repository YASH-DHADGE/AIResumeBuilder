"""
Job Intelligence Service using Mistral AI
Provides ATS Score, Resume Enhancement, and Cover Letter generation.
"""

import os
import json
import re
from mistralai import Mistral
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("MISTRAL_API_KEY", "")
client = Mistral(api_key=api_key)

ATS_SYSTEM_PROMPT = """You are an expert ATS (Applicant Tracking System) analyzer with deep knowledge of how Fortune 500 companies' hiring software scores resumes. You have trained on 100,000+ job descriptions across tech, finance, healthcare, and operations sectors."""

ATS_USER_PROMPT = """Analyze the following resume against the job description and return a JSON ATS score report.

## RESUME DATA
{resume_json}

## JOB DESCRIPTION
{job_description}

## INSTRUCTIONS
Return a STRICT JSON object with this exact schema:
{{
  "overall_score": 0,
  "score_label": "Poor",
  "breakdown": {{
    "keyword_match": {{ "score": 0, "matched": [], "missing": [] }},
    "section_structure": {{ "score": 0, "present": [], "missing": [] }},
    "skills_alignment": {{ "score": 0, "matched_count": 0, "total_required": 0, "missing_skills": [] }},
    "formatting_score": {{ "score": 0, "issues": [] }},
    "action_verbs": {{ "score": 0, "count": 0, "weak_verbs_found": [] }}
  }},
  "quick_wins": [
    {{ "priority": "HIGH", "action": "string", "impact": "string" }}
  ],
  "ats_verdict": "string"
}}

## SCORING LOGIC
- keyword_match: Extract ALL technical skills, tools, frameworks, methodologies, certifications, and role-specific nouns from the JD. Score = (matched/total)*100
- section_structure: Check for Summary/Objective, Experience, Education, Skills, Certifications (if mentioned in JD), Projects. Score = (present/required)*100
- skills_alignment: Focus only on skills explicitly listed in JD requirements/nice-to-haves
- formatting_score: Penalize if resume has tables (-15), columns (-10), headers/footers (-8), images/graphics (-20), non-standard section names (-5 each)
- action_verbs: Count unique strong action verbs. Penalize generic verbs: "responsible for", "worked on", "helped with", "assisted in"

Return ONLY the JSON. No markdown, no explanation."""

ENHANCE_SYSTEM_PROMPT = """You are a world-class resume consultant who has helped 10,000+ candidates land roles at FAANG, YC startups, and Fortune 500 companies. You specialize in rewriting resumes to perfectly match job descriptions while sounding authentic — never generic, never keyword-stuffed.

Your rewrites follow these STRICT principles:
1. STAR method (Situation→Task→Action→Result) for experience bullets
2. Quantify everything possible (%, $, time saved, users impacted, team size)
3. Mirror exact terminology from the JD — use their words, not synonyms
4. Front-load bullets with strong action verbs (Led, Architected, Reduced, Increased)
5. Never fabricate metrics — use placeholders like [X%] or [N users] when unknown
6. Respect the candidate's authentic voice — enhance, don't replace personality"""

ENHANCE_USER_PROMPT = """Analyze the resume against the JD and return an enhancement report.

## RESUME DATA
{resume_json}

## JOB DESCRIPTION  
{job_description}

## TARGET ROLE
Job Title: {job_title}
Company: {company_name}

## OUTPUT SCHEMA (strict JSON)
{{
  "target_role": "",
  "total_improvements": 0,
  "priority_score": "High",
  "sections": [
    {{
      "section": "experience",
      "improvements_count": 0,
      "items": [
        {{
          "type": "REWRITE",
          "priority": "HIGH",
          "location": "Job Title at Company",
          "location_id": "index of item in the section array, e.g. 0, 1, 2",
          "sub_id": "index of bullet point or field name if applicable",
          "current_text": "text to be replaced",
          "suggested_text": "replacement text",
          "reasoning": "why this change help match the JD",
          "keywords_added": ["skill1", "skill2"]
        }}
      ]
    }}
  ],
  "skills_to_add": [
    {{ "skill": "string", "jd_frequency": 0, "suggested_section": "skills" }}
  ],
  "skills_to_remove": [
    {{ "skill": "string", "reason": "string" }}
  ],
  "overall_recommendation": "string"
}}

## ANALYSIS DEPTH
- For SUMMARY: Rewrite the entire summary. Set location_id: 0, sub_id: null.
- For EXPERIENCE: Provide location_id (job index) and sub_id (bullet index). If current_text is provided, it MUST BE A PERFECT SUBSTRING of the current bullet.
- For PROJECTS: Provide location_id (project index) and sub_id: 'description'.
- For SKILLS: Suggest adding specific JD keywords to the skills array.
- For EDUCATION: Only flag if JD has specific degree requirements unmet.

Return ONLY the JSON. No markdown wrappers."""

COVER_LETTER_SYSTEM_PROMPT = """You are a senior career coach and professional writer who has crafted 5,000+ cover letters that secured interviews at top companies. You write with authenticity, strategic precision, and a human voice.

Your cover letters ALWAYS:
✓ Open with a compelling hook — NOT "I am writing to apply for..."
✓ Mirror 8-12 keywords from the JD naturally in context
✓ Include 2-3 specific quantified achievements from the resume
✓ Connect the candidate's background to the company's specific mission/product/values
✓ Close with a confident, non-desperate call to action
✓ Sound like a human wrote it — varied sentence length, no corporate filler
✓ Stay under 400 words for Standard, under 250 for Brief, up to 550 for Detailed

Your cover letters NEVER:
✗ Start with "I am writing to apply for the position of..."
✗ Restate the resume as a list
✗ Use generic phrases: "team player", "fast learner", "passionate about", "hard worker"
✗ Include hollow filler: "I believe I would be a great fit because..."
✗ Over-promise or sound sycophantic"""

COVER_LETTER_USER_PROMPT = """Write a cover letter for this candidate applying to this role.

## CANDIDATE RESUME
{resume_json}

## JOB DESCRIPTION
{job_description}

## TARGET ROLE
Job Title: {job_title}
Company: {company_name}
Candidate Name: {candidate_name}

## PARAMETERS
Tone: {tone}
Length: {length}
Style: {style}
Format: {format}

## OUTPUT SCHEMA (strict JSON)
{{
  "subject_line": "",
  "salutation": "",
  "body": "",
  "closing": "",
  "signature": "",
  "metadata": {{
    "word_count": 0,
    "keywords_used": [],
    "tone_achieved": "",
    "strongest_hook": "",
    "key_achievements_referenced": []
  }}
}}

## LETTER STRUCTURE GUIDE
Para 1 — THE HOOK (3-4 sentences):
  Open with a specific achievement OR a statement about the company's problem/mission. Explicitly name the role. Establish why this intersection is inevitable.
Para 2 — THE PROOF (4-5 sentences):
  2-3 specific achievements with metrics from the resume. Each achievement must directly map to a JD requirement. Use JD's exact terminology for skills and tools.
Para 3 — THE CONNECTION (3-4 sentences):
  Why this company specifically — reference their product, recent news, or mission. Connect your background to their specific context. One forward-looking statement about contribution.
Para 4 — THE CLOSE (2-3 sentences):
  Confident CTA. Offer to discuss. No desperation.

Return ONLY the JSON. No markdown wrappers."""

async def _call_mistral_json(system_prompt: str, user_prompt: str) -> dict:
    if not api_key:
        raise ValueError("MISTRAL_API_KEY is not configured.")

    response = await client.chat.complete_async(
        model="mistral-large-latest",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        response_format={"type": "json_object"}
    )
    
    raw = response.choices[0].message.content.strip()
    
    if raw.startswith("```"):
        raw = re.sub(r"^```(?:json)?\s*", "", raw)
        raw = re.sub(r"\s*```$", "", raw)

    try:
        data = json.loads(raw)
        return data
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", raw, re.DOTALL)
        if match:
            return json.loads(match.group())
        raise ValueError(f"Mistral did not return valid JSON: {raw:.500s}")


async def generate_ats_score(resume_json: dict, job_description: str) -> dict:
    prompt = ATS_USER_PROMPT.format(
        resume_json=json.dumps(resume_json, indent=2),
        job_description=job_description
    )
    return await _call_mistral_json(ATS_SYSTEM_PROMPT, prompt)


async def generate_enhancements(resume_json: dict, job_description: str, job_title: str, company_name: str) -> dict:
    prompt = ENHANCE_USER_PROMPT.format(
        resume_json=json.dumps(resume_json, indent=2),
        job_description=job_description,
        job_title=job_title,
        company_name=company_name
    )
    return await _call_mistral_json(ENHANCE_SYSTEM_PROMPT, prompt)


async def generate_cover_letter(resume_json: dict, job_description: str, job_title: str, company_name: str, candidate_name: str, tone: str="Professional", length: str="Standard", style: str="Story-driven", format: str="Modern") -> dict:
    prompt = COVER_LETTER_USER_PROMPT.format(
        resume_json=json.dumps(resume_json, indent=2),
        job_description=job_description,
        job_title=job_title,
        company_name=company_name,
        candidate_name=candidate_name,
        tone=tone,
        length=length,
        style=style,
        format=format
    )
    return await _call_mistral_json(COVER_LETTER_SYSTEM_PROMPT, prompt)
