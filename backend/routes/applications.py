from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from models import Application, Student, Job

applications_bp = Blueprint("applications", __name__, url_prefix="/api/applications")


def _app_dict(a):
    return {
        "id": a.id,
        "jobId": a.job_id, "job_id": a.job_id,
        "jobTitle": a.job.role_title, "job_title": a.job.role_title,
        "company": a.job.company.name,
        "status": a.status,
        "appliedOn": a.applied_on.isoformat(), "applied_on": a.applied_on.isoformat(),
        "matchScore": a.match_score or 0.0, "match_score": a.match_score or 0.0
    }


@applications_bp.route("", methods=["GET"])
@applications_bp.route("/", methods=["GET"])
@jwt_required()
def get_applications():
    claims = get_jwt()
    if claims["role"] != "student":
        return jsonify({"error": "Student access required"}), 403
    student = Student.query.filter_by(user_id=int(get_jwt_identity())).first()
    if not student:
        return jsonify([]), 200
    return jsonify([_app_dict(a) for a in student.applications]), 200
