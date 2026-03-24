from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from models import Company

companies_bp = Blueprint("companies", __name__, url_prefix="/api/companies")


@companies_bp.route("", methods=["GET"])
@companies_bp.route("/", methods=["GET"])
def list_companies():
    return jsonify([{
        "id": c.id, "name": c.name,
        "domain": c.domain or c.industry or "",
        "location": c.location or "",
        "website": c.website or "",
        "job_count": len(c.jobs)
    } for c in Company.query.all()]), 200
