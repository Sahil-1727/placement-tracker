from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from models import db, Company, Student, Application, User

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")


def _company_dict(c):
    return {
        "id": c.id, "name": c.name,
        "domain": c.domain or c.industry or "",
        "industry": c.industry or "",
        "location": c.location or "",
        "website": c.website or "",
        "contactEmail": c.contact_email or "",
        "contact_email": c.contact_email or "",
        "contactPhone": c.contact_phone or "",
        "contact_phone": c.contact_phone or "",
        "roles": c.roles or 1,
        "openings": c.openings or 1,
        "requiredSkills": [s.strip() for s in c.required_skills.split(",") if s.strip()] if c.required_skills else [],
        "job_count": len(c.jobs)
    }


@admin_bp.route("/companies", methods=["GET"])
@jwt_required()
def list_companies():
    return jsonify([_company_dict(c) for c in Company.query.all()]), 200


@admin_bp.route("/companies", methods=["POST"])
@jwt_required()
def create_company():
    claims = get_jwt()
    if claims["role"] != "admin":
        return jsonify({"error": "Admin access required"}), 403
    data = request.get_json()
    skills = data.get("requiredSkills") or data.get("required_skills") or []
    c = Company(
        name=data.get("name"),
        domain=data.get("domain", ""),
        industry=data.get("domain") or data.get("industry", ""),
        location=data.get("location", ""),
        website=data.get("website", ""),
        contact_email=data.get("contactEmail") or data.get("contact_email", ""),
        contact_phone=data.get("contactPhone") or data.get("contact_phone", ""),
        roles=int(data.get("roles", 1)),
        openings=int(data.get("openings", 1)),
        required_skills=",".join(skills) if isinstance(skills, list) else skills
    )
    db.session.add(c)
    db.session.commit()
    return jsonify(_company_dict(c)), 201


@admin_bp.route("/companies/<int:id>", methods=["PUT"])
@jwt_required()
def update_company(id):
    claims = get_jwt()
    if claims["role"] != "admin":
        return jsonify({"error": "Admin access required"}), 403
    c = Company.query.get_or_404(id)
    data = request.get_json()
    for field, col in [("name", "name"), ("location", "location"), ("website", "website")]:
        if field in data:
            setattr(c, col, data[field])
    if "domain" in data:
        c.domain = data["domain"]
        c.industry = data["domain"]
    if "contactEmail" in data or "contact_email" in data:
        c.contact_email = data.get("contactEmail") or data.get("contact_email")
    if "contactPhone" in data or "contact_phone" in data:
        c.contact_phone = data.get("contactPhone") or data.get("contact_phone")
    if "roles" in data:
        c.roles = int(data["roles"])
    if "openings" in data:
        c.openings = int(data["openings"])
    skills = data.get("requiredSkills") or data.get("required_skills")
    if skills:
        c.required_skills = ",".join(skills) if isinstance(skills, list) else skills
    db.session.commit()
    return jsonify(_company_dict(c)), 200


@admin_bp.route("/companies/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_company(id):
    claims = get_jwt()
    if claims["role"] != "admin":
        return jsonify({"error": "Admin access required"}), 403
    c = Company.query.get_or_404(id)
    db.session.delete(c)
    db.session.commit()
    return jsonify({"message": "Company deleted"}), 200


@admin_bp.route("/applications", methods=["GET"])
@jwt_required()
def list_applications():
    claims = get_jwt()
    if claims["role"] != "admin":
        return jsonify({"error": "Admin access required"}), 403
    applications = Application.query.order_by(Application.applied_on.desc()).all()
    result = []
    for a in applications:
        result.append({
            "id": a.id,
            "studentName": a.student.user.name,
            "studentEmail": a.student.user.email,
            "branch": a.student.branch or "",
            "jobTitle": a.job.role_title,
            "company": a.job.company.name,
            "type": a.job.type,
            "status": a.status,
            "appliedOn": a.applied_on.isoformat(),
            "matchScore": a.match_score or 0.0
        })
    return jsonify(result), 200


@admin_bp.route("/applications/<int:id>/status", methods=["PUT"])
@jwt_required()
def update_application_status(id):
    claims = get_jwt()
    if claims["role"] != "admin":
        return jsonify({"error": "Admin access required"}), 403
    a = Application.query.get_or_404(id)
    data = request.get_json(silent=True) or {}
    status = data.get("status")
    if status not in ("Applied", "Selected", "Rejected"):
        return jsonify({"error": "status must be Applied, Selected or Rejected"}), 400
    a.status = status
    db.session.commit()
    return jsonify({"id": a.id, "status": a.status}), 200


@admin_bp.route("/students", methods=["GET"])
@jwt_required()
def list_students():
    claims = get_jwt()
    if claims["role"] != "admin":
        return jsonify({"error": "Admin access required"}), 403
    students = Student.query.all()
    result = []
    for s in students:
        result.append({
            "id": s.id, "user_id": s.user_id,
            "name": s.user.name, "email": s.user.email,
            "branch": s.branch or "", "cgpa": s.cgpa or 0.0,
            "year": s.year or 4, "roll_no": s.roll_no or "",
            "skills": [x.strip() for x in s.skills.split(",") if x.strip()],
            "profile_completion": s.profile_completion or 0,
            "application_count": len(s.applications),
            "selected": any(a.status == "Selected" for a in s.applications)
        })
    return jsonify(result), 200


@admin_bp.route("/reports", methods=["GET"])
@jwt_required()
def reports():
    claims = get_jwt()
    if claims["role"] != "admin":
        return jsonify({"error": "Admin access required"}), 403
    students = Student.query.all()
    total = len(students)
    applied = sum(1 for s in students if s.applications)
    selected = sum(1 for s in students if any(a.status == "Selected" for a in s.applications))
    total_apps = Application.query.count()
    companies = Company.query.count()
    return jsonify({
        "total_students": total, "applied_students": applied,
        "selected_students": selected, "unplaced_students": total - selected,
        "total_applications": total_apps, "companies": companies,
        "placement_rate": round((selected / total * 100), 1) if total else 0
    }), 200
