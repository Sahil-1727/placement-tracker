from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt, verify_jwt_in_request
from models import db, Job, Student, Application, Company, calculate_match_score
from datetime import date

jobs_bp = Blueprint("jobs", __name__, url_prefix="/api/jobs")


def _job_dict(j, match_score=0.0, already_applied=False, matched_skills=None, missing_skills=None):
    skills = [x.strip() for x in j.required_skills.split(",") if x.strip()]
    if j.stipend:
        stipend_str = str(int(j.stipend))
    elif j.ctc:
        stipend_str = str(j.ctc) + " LPA"
    else:
        stipend_str = "N/A"
    return {
        "id": j.id,
        "title": j.role_title, "job_title": j.role_title,
        "company": j.company.name, "company_id": j.company_id,
        "type": j.type,
        "location": j.company.location or "",
        "stipend": stipend_str,
        "description": "",
        "requiredSkills": skills, "required_skills": skills,
        "deadline": j.drive_date.isoformat() if j.drive_date else None,
        "drive_date": j.drive_date.isoformat() if j.drive_date else None,
        "logo": j.company.name[:2].upper(),
        "color": "bg-blue-500",
        "status": j.status,
        "eligibility_cgpa": j.eligibility_cgpa or 0.0,
        "ctc": j.ctc or 0.0,
        "match_score": match_score, "matchScore": match_score,
        "already_applied": already_applied,
        "matched_skills": matched_skills or [],
        "missing_skills": missing_skills or []
    }


@jobs_bp.route("/", methods=["GET"])
@jobs_bp.route("", methods=["GET"])
def list_jobs():
    query = Job.query
    if request.args.get("type"):
        query = query.filter(Job.type == request.args.get("type"))
    if request.args.get("keyword"):
        query = query.filter(Job.role_title.ilike(f"%{request.args.get('keyword')}%"))
    if request.args.get("company_id"):
        query = query.filter(Job.company_id == int(request.args.get("company_id")))

    jobs = query.all()
    student, applied_job_ids = None, set()
    try:
        verify_jwt_in_request(optional=True)
        claims = get_jwt()
        if claims.get("role") == "student":
            student = Student.query.filter_by(user_id=int(get_jwt_identity())).first()
            if student:
                applied_job_ids = {a.job_id for a in student.applications}
    except Exception:
        pass

    data = []
    for j in jobs:
        score, matched, missing = 0.0, [], []
        if student:
            score, matched, missing = calculate_match_score(student.skills or "", j.required_skills or "")
        data.append(_job_dict(j, score, j.id in applied_job_ids, matched, missing))
    return jsonify(data), 200


@jobs_bp.route("/<int:job_id>/apply", methods=["POST"])
@jwt_required()
def apply_job(job_id):
    claims = get_jwt()
    if claims["role"] != "student":
        return jsonify({"error": "Student access required"}), 403
    student = Student.query.filter_by(user_id=int(get_jwt_identity())).first()
    if not student:
        return jsonify({"error": "Student profile not found"}), 404
    job = Job.query.get_or_404(job_id)
    if Application.query.filter_by(student_id=student.id, job_id=job_id).first():
        return jsonify({"error": "Already applied"}), 409
    score, matched, missing = calculate_match_score(student.skills or "", job.required_skills or "")
    try:
        app = Application(student_id=student.id, job_id=job_id, match_score=score)
        db.session.add(app)
        db.session.commit()
        return jsonify({
            "id": app.id, "jobId": job_id, "jobTitle": job.role_title,
            "company": job.company.name, "status": app.status,
            "matchScore": score, "match_score": score,
            "matched_skills": matched, "missing_skills": missing,
            "appliedOn": app.applied_on.isoformat(), "message": "Applied successfully"
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400


@jobs_bp.route("", methods=["POST"])
@jwt_required()
def create_job():
    claims = get_jwt()
    if claims["role"] != "admin":
        return jsonify({"error": "Admin access required"}), 403
    data = request.get_json()
    try:
        drive_date = None
        raw_date = data.get("deadline") or data.get("drive_date")
        if raw_date:
            drive_date = date.fromisoformat(raw_date)

        company_id = data.get("company_id")
        if not company_id and data.get("company"):
            c = Company.query.filter_by(name=data["company"]).first()
            if not c:
                c = Company(name=data["company"])
                db.session.add(c)
                db.session.flush()
            company_id = c.id

        skills = data.get("requiredSkills") or data.get("required_skills") or []
        if isinstance(skills, list):
            skills = ",".join(skills)

        stipend_val = None
        if data.get("stipend"):
            try:
                stipend_val = float(str(data["stipend"]).replace("LPA", "").replace("INR", "").replace(",", "").strip())
            except Exception:
                pass

        ctc_val = None
        if data.get("ctc"):
            try:
                ctc_val = float(str(data["ctc"]).replace("LPA", "").replace(",", "").strip())
            except Exception:
                pass

        j = Job(
            company_id=int(company_id),
            role_title=data.get("title") or data.get("job_title") or data.get("role_title"),
            required_skills=skills,
            type=data.get("type", "Internship"),
            stipend=stipend_val,
            ctc=ctc_val,
            drive_date=drive_date,
            eligibility_cgpa=float(data.get("eligibility_cgpa", 0.0))
        )
        db.session.add(j)
        db.session.commit()
        return jsonify(_job_dict(j)), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400


@jobs_bp.route("/<int:id>", methods=["PUT"])
@jwt_required()
def update_job(id):
    claims = get_jwt()
    if claims["role"] != "admin":
        return jsonify({"error": "Admin access required"}), 403
    j = Job.query.get_or_404(id)
    data = request.get_json()
    try:
        if data.get("title") or data.get("job_title"):
            j.role_title = data.get("title") or data.get("job_title")
        if "type" in data:
            j.type = data["type"]
        if data.get("deadline"):
            j.drive_date = date.fromisoformat(data["deadline"])
        skills = data.get("requiredSkills") or data.get("required_skills")
        if skills:
            j.required_skills = ",".join(skills) if isinstance(skills, list) else skills
        if "stipend" in data and data["stipend"]:
            try:
                j.stipend = float(str(data["stipend"]).replace("LPA", "").replace(",", "").strip())
            except Exception:
                pass
        if "ctc" in data and data["ctc"]:
            try:
                j.ctc = float(str(data["ctc"]).replace("LPA", "").replace(",", "").strip())
            except Exception:
                pass
        if "eligibility_cgpa" in data:
            j.eligibility_cgpa = float(data["eligibility_cgpa"])
        db.session.commit()
        return jsonify(_job_dict(j)), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400


@jobs_bp.route("/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_job(id):
    claims = get_jwt()
    if claims["role"] != "admin":
        return jsonify({"error": "Admin access required"}), 403
    j = Job.query.get_or_404(id)
    try:
        Application.query.filter_by(job_id=id).delete()
        db.session.delete(j)
        db.session.commit()
        return jsonify({"message": "Job deleted"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400
