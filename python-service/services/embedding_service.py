"""
Embedding service using sentence-transformers (all-MiniLM-L6-v2).
Computes cosine similarity to match resume skills against job skills.
"""

import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

# Load model once at module level for performance
model = SentenceTransformer("all-MiniLM-L6-v2")

SIMILARITY_THRESHOLD = 0.75


async def match_skills(
    resume_skills: list[str], job_skills: list[str]
) -> dict:
    """
    Encode both skill lists with sentence-transformers, compute cosine similarity,
    and return matched/missing skills plus an ATS score.
    """
    if not job_skills:
        return {"matched": [], "missing": [], "ats_score": 0.0}

    if not resume_skills:
        return {"matched": [], "missing": job_skills, "ats_score": 0.0}

    # Encode skills
    resume_embeddings = model.encode(resume_skills, convert_to_numpy=True)
    job_embeddings = model.encode(job_skills, convert_to_numpy=True)

    # Compute cosine similarity matrix: (num_job_skills x num_resume_skills)
    sim_matrix = cosine_similarity(job_embeddings, resume_embeddings)

    matched = []
    missing = []

    for i, job_skill in enumerate(job_skills):
        max_sim = float(np.max(sim_matrix[i]))
        if max_sim >= SIMILARITY_THRESHOLD:
            # Find the best-matching resume skill
            best_idx = int(np.argmax(sim_matrix[i]))
            matched.append(job_skill)
        else:
            missing.append(job_skill)

    ats_score = round((len(matched) / len(job_skills)) * 100, 1)

    return {
        "matched": matched,
        "missing": missing,
        "ats_score": ats_score,
    }
