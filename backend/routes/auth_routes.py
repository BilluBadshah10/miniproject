from flask import Blueprint, request, jsonify
from models.user_model import get_user_by_email_or_aadhaar
from password_utils import verify_password
from token_utils import generate_token

auth_bp = Blueprint("auth_bp", __name__)

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    identifier = data.get("identifier")
    password = data.get("password")

    user = get_user_by_email_or_aadhaar(identifier)

    if not user:
        return jsonify({"message": "User not found"}), 404

    if not verify_password(password, user["password"]):
        return jsonify({"message": "Invalid credentials"}), 401

    token = generate_token(user)

    return jsonify({
        "message": "Login successful",
        "token": token
    }), 200

