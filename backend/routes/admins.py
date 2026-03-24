from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from models import db, User

admins_bp = Blueprint("admins", __name__, url_prefix="/api/admins")


@admins_bp.route("/me", methods=["PUT"])
@jwt_required()
def update_admin():
    claims = get_jwt()
    if claims["role"] != "admin":
        return jsonify({"error": "Admin access required"}), 403
    user = User.query.get(int(get_jwt_identity()))
    data = request.get_json()
    if "name" in data:
        user.name = data["name"]
    if "email" in data:
        user.email = data["email"]
    db.session.commit()
    return jsonify({"id": user.id, "name": user.name, "email": user.email, "role": user.role}), 200
