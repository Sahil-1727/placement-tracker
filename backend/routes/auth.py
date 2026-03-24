from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from werkzeug.security import generate_password_hash, check_password_hash
from models import db, User, Student

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"message": "Request body must be JSON"}), 400
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    if not email or not password:
        return jsonify({"message": "email and password are required"}), 400
    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password, password):
        return jsonify({"message": "Invalid credentials"}), 401

    skills = []
    profile_completion = 0
    branch = ""
    if user.student:
        skills = [s.strip() for s in user.student.skills.split(",") if s.strip()]
        profile_completion = user.student.profile_completion
        branch = user.student.branch or ""

    token = create_access_token(
        identity=str(user.id),
        additional_claims={"role": user.role, "name": user.name}
    )
    user_obj = {
        "id": user.id, "name": user.name, "email": user.email,
        "role": user.role, "branch": branch,
        "skills": skills, "profileCompletion": profile_completion
    }
    return jsonify({"token": token, "user": user_obj, "data": {"token": token, "user": user_obj}}), 200


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"message": "Request body must be JSON"}), 400
    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    branch = data.get("branch", "")
    if not name or not email or not password:
        return jsonify({"message": "name, email and password are required"}), 400
    if len(password) < 6:
        return jsonify({"message": "Password must be at least 6 characters"}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({"message": "Email already registered"}), 409
    try:
        user = User(
            name=name,
            email=email,
            password=generate_password_hash(password),
            role="student"
        )
        db.session.add(user)
        db.session.flush()
        student = Student(user_id=user.id, branch=branch)
        db.session.add(student)
        db.session.commit()
        return jsonify({"message": "Registered successfully"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Registration failed", "error": str(e)}), 500
