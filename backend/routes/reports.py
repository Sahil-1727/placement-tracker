from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from models import Student, Application, Company
from sqlalchemy import func

reports_bp = Blueprint("reports", __name__, url_prefix="/api/reports")


@reports_bp.route("/summary", methods=["GET"])
@jwt_required()
def summary():
    claims = get_jwt()
    if claims["role"] != "admin":
        return jsonify({"error": "Admin access required"}), 403
    students = Student.query.all()
    total = len(students)
    selected = sum(1 for s in students if any(a.status == "Selected" for a in s.applications))
    return jsonify({
        "total_students": total,
        "total_applications": Application.query.count(),
        "selected_students": selected,
        "companies": Company.query.count()
    }), 200


@reports_bp.route("/branch", methods=["GET"])
@jwt_required()
def branch_report():
    claims = get_jwt()
    if claims["role"] != "admin":
        return jsonify({"error": "Admin access required"}), 403
    students = Student.query.all()
    branch_map = {}
    for s in students:
        b = s.branch or "Unknown"
        if b not in branch_map:
            branch_map[b] = {"branch": b, "total": 0, "applied": 0, "selected": 0, "scores": []}
        branch_map[b]["total"] += 1
        if s.applications:
            branch_map[b]["applied"] += 1
        if any(a.status == "Selected" for a in s.applications):
            branch_map[b]["selected"] += 1
        scores = [a.match_score for a in s.applications if a.match_score]
        if scores:
            branch_map[b]["scores"].extend(scores)
    result = []
    for b, d in branch_map.items():
        avg = round(sum(d["scores"]) / len(d["scores"]), 1) if d["scores"] else 0.0
        result.append({"branch": b, "total": d["total"], "applied": d["applied"],
                        "selected": d["selected"], "avg_match_score": avg})
    return jsonify(result), 200


@reports_bp.route("/unplaced", methods=["GET"])
@jwt_required()
def unplaced():
    claims = get_jwt()
    if claims["role"] != "admin":
        return jsonify({"error": "Admin access required"}), 403
    students = Student.query.all()
    result = []
    for s in students:
        if not any(a.status == "Selected" for a in s.applications):
            result.append({
                "id": s.id, "name": s.user.name, "branch": s.branch or "",
                "cgpa": s.cgpa or 0.0,
                "skills": [x.strip() for x in s.skills.split(",") if x.strip()],
                "applied_jobs": len(s.applications)
            })
    return jsonify(result), 200
