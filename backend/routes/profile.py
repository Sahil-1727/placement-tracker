from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from models import db, User, Student

profile_bp = Blueprint("profile", __name__, url_prefix="/api/profile")


@profile_bp.route("", methods=["GET"])
@profile_bp.route("/", methods=["GET"])
@jwt_required()
def get_profile():
    user = User.query.get(int(get_jwt_identity()))
    if not user:
        return jsonify({"error": "User not found"}), 404
    skills = []
    branch, cgpa, year, profile_completion = "", 0.0, 4, 0
    if user.student:
        skills = [s.strip() for s in user.student.skills.split(",") if s.strip()]
        branch = user.student.branch or ""
        cgpa = user.student.cgpa or 0.0
        year = user.student.year or 4
        profile_completion = user.student.profile_completion or 0
    return jsonify({
        "id": user.id, "name": user.name, "email": user.email,
        "role": user.role, "branch": branch, "skills": skills,
        "bio": user.bio or "", "phone": user.phone or "",
        "linkedin": user.linkedin or "", "github": user.github or "",
        "graduation": user.graduation or "",
        "cgpa": cgpa, "year": year,
        "profileCompletion": profile_completion
    }), 200


@profile_bp.route("", methods=["PUT"])
@profile_bp.route("/", methods=["PUT"])
@jwt_required()
def update_profile():
    user = User.query.get(int(get_jwt_identity()))
    if not user:
        return jsonify({"error": "User not found"}), 404
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400

    # ── Validation ────────────────────────────────────────────────────────────
    import re
    errors = {}

    name = data.get("name", "").strip()
    if "name" in data:
        if not name:
            errors["name"] = "Full name is required."
        elif len(name) < 2:
            errors["name"] = "Name must be at least 2 characters."
        elif len(name) > 100:
            errors["name"] = "Name must be under 100 characters."
        elif not re.match(r"^[a-zA-Z\s.'\-]+$", name):
            errors["name"] = "Name can only contain letters, spaces, dots, hyphens."

    if data.get("phone"):
        digits = re.sub(r"[\s\-+()]", "", data["phone"])
        if not digits.isdigit():
            errors["phone"] = "Phone must contain only digits."
        elif len(digits) != 10:
            errors["phone"] = "Phone must be exactly 10 digits."

    if data.get("graduation"):
        try:
            yr = int(data["graduation"])
            if yr < 2000 or yr > 2035:
                errors["graduation"] = "Graduation year must be between 2000 and 2035."
        except ValueError:
            errors["graduation"] = "Graduation year must be a valid 4-digit number."

    if data.get("linkedin") and "linkedin.com" not in data["linkedin"].lower():
        errors["linkedin"] = "Must be a valid LinkedIn URL."

    if data.get("github") and "github.com" not in data["github"].lower():
        errors["github"] = "Must be a valid GitHub URL."

    if data.get("bio") and len(data["bio"]) > 500:
        errors["bio"] = "Bio must be under 500 characters."

    if data.get("skills") and len(data["skills"]) > 20:
        errors["skills"] = "Maximum 20 skills allowed."

    if errors:
        return jsonify({"error": "Validation failed", "fields": errors}), 422
    # ─────────────────────────────────────────────────────────────────────────

    if "name" in data:
        user.name = data["name"]
    if "bio" in data:
        user.bio = data["bio"]
    if "phone" in data:
        user.phone = data["phone"]
    if "linkedin" in data:
        user.linkedin = data["linkedin"]
    if "github" in data:
        user.github = data["github"]
    if "graduation" in data:
        user.graduation = data["graduation"]

    if user.student:
        if "branch" in data:
            user.student.branch = data["branch"]
        if "cgpa" in data:
            user.student.cgpa = float(data["cgpa"])
        if "year" in data:
            user.student.year = int(data["year"])
        if "skills" in data:
            skills = data["skills"]
            user.student.skills = ",".join(skills) if isinstance(skills, list) else skills

        filled = sum(bool(x) for x in [
            user.name, user.bio, user.phone, user.linkedin,
            user.github, user.graduation,
            user.student.branch, user.student.skills, user.student.cgpa
        ])
        user.student.profile_completion = int((filled / 9) * 100)

    db.session.commit()

    skills_list = [s.strip() for s in user.student.skills.split(",") if s.strip()] if user.student and user.student.skills else []
    return jsonify({
        "id": user.id, "name": user.name, "email": user.email,
        "role": user.role,
        "branch": user.student.branch or "" if user.student else "",
        "skills": skills_list,
        "bio": user.bio or "", "phone": user.phone or "",
        "linkedin": user.linkedin or "", "github": user.github or "",
        "graduation": user.graduation or "",
        "cgpa": user.student.cgpa or 0.0 if user.student else 0.0,
        "year": user.student.year or 4 if user.student else 4,
        "profileCompletion": user.student.profile_completion or 0 if user.student else 0
    }), 200
