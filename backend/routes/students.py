from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from models import db, Student, Application, User

students_bp = Blueprint("students", __name__, url_prefix="/api/students")


@students_bp.route("/me/applications", methods=["GET"])
@jwt_required()
def my_applications():
    claims = get_jwt()
    if claims["role"] != "student":
        return jsonify({"error": "Student access required"}), 403
    student = Student.query.filter_by(user_id=int(get_jwt_identity())).first()
    if not student:
        return jsonify([]), 200
    return jsonify([{
        "id": a.id, "jobId": a.job_id, "jobTitle": a.job.role_title,
        "company": a.job.company.name, "status": a.status,
        "appliedOn": a.applied_on.isoformat(), "matchScore": a.match_score or 0.0
    } for a in student.applications]), 200


@students_bp.route("", methods=["GET"])
@jwt_required()
def list_students():
    claims = get_jwt()
    if claims["role"] != "admin":
        return jsonify({"error": "Admin access required"}), 403
    return jsonify([{
        "id": s.id, "name": s.user.name, "email": s.user.email,
        "branch": s.branch or "", "cgpa": s.cgpa or 0.0,
        "skills": [x.strip() for x in s.skills.split(",") if x.strip()],
        "application_count": len(s.applications)
    } for s in Student.query.all()]), 200
