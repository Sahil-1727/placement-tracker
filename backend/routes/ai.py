from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User, Student, Job, Application
import os

ai_bp = Blueprint("ai", __name__, url_prefix="/api/ai")


def _get_groq_client():
    from groq import Groq
    return Groq(api_key=os.getenv("GROQ_API_KEY"))


def _build_student_context(user_id):
    user = User.query.get(user_id)
    if not user or not user.student:
        return None, None
    s = user.student
    skills = [x.strip() for x in s.skills.split(",") if x.strip()] if s.skills else []
    applications = []
    for a in s.applications:
        applications.append({
            "job": a.job.role_title,
            "company": a.job.company.name,
            "status": a.status,
            "match_score": a.match_score
        })
    all_jobs = Job.query.all()
    applied_ids = {a.job_id for a in s.applications}
    unapplied = []
    for j in all_jobs:
        if j.id not in applied_ids:
            job_skills = [x.strip() for x in j.required_skills.split(",") if x.strip()]
            matched = [sk for sk in job_skills if sk.lower() in [x.lower() for x in skills]]
            score = round(len(matched) / len(job_skills) * 100) if job_skills else 0
            unapplied.append({"job": j.role_title, "company": j.company.name, "match": score})
    unapplied.sort(key=lambda x: x["match"], reverse=True)

    context = f"""Student Profile:
- Name: {user.name}
- Branch: {s.branch or 'Not set'}
- CGPA: {s.cgpa or 'Not set'}
- Skills: {', '.join(skills) if skills else 'None added yet'}
- Bio: {user.bio or 'Not set'}
- Profile completion: {s.profile_completion}%

Applications ({len(applications)} total):
{chr(10).join(f"  - {a['job']} at {a['company']}: {a['status']} (match: {a['match_score']}%)" for a in applications) or '  None yet'}

Top unapplied jobs by match score:
{chr(10).join(f"  - {j['job']} at {j['company']}: {j['match']}% match" for j in unapplied[:5]) or '  None available'}"""

    return user.name, context


@ai_bp.route("/chat", methods=["POST"])
@jwt_required()
def chat():
    data = request.get_json(silent=True) or {}
    message = data.get("message", "").strip()
    history = data.get("history", [])  # [{role, content}, ...]

    if not message:
        return jsonify({"error": "message is required"}), 400

    api_key = os.getenv("GROQ_API_KEY", "")
    if not api_key or api_key == "your_groq_api_key_here":
        return jsonify({"error": "GROQ_API_KEY not configured"}), 503

    user_id = int(get_jwt_identity())
    name, student_context = _build_student_context(user_id)

    system_prompt = f"""You are PlacePro AI, a smart career coach inside a college placement portal.
You have full access to this student's real profile, applications, and available jobs.

{student_context or "No student profile found."}

Your job:
- Give short, specific, actionable advice (2-4 sentences max per response)
- Recommend which jobs to apply to based on their actual skills
- Tell them exactly which skills to learn to improve match scores
- Be encouraging but honest
- Never make up job listings — only reference what's in the data above
- If asked something unrelated to placements/careers, politely redirect

Always address the student by their first name: {name or 'there'}."""

    messages = [{"role": "system", "content": system_prompt}]
    for h in history[-6:]:  # keep last 6 turns for context
        if h.get("role") in ("user", "assistant") and h.get("content"):
            messages.append({"role": h["role"], "content": h["content"]})
    messages.append({"role": "user", "content": message})

    try:
        client = _get_groq_client()
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            max_tokens=300,
            temperature=0.7,
        )
        reply = response.choices[0].message.content.strip()
        return jsonify({"reply": reply}), 200
    except Exception as e:
        import traceback; traceback.print_exc()
        return jsonify({"error": str(e)}), 500
