from flask import Blueprint, request, jsonify, current_app
from models.user_model import create_user, get_user_by_aadhaar
from password_utils import hash_password
from werkzeug.utils import secure_filename
import os
import uuid

enroll_bp = Blueprint("enroll_bp", __name__)


@enroll_bp.route("/enroll", methods=["POST"])
def enroll():
    try:
        form = request.form

        full_name = form.get("fullName")
        email = form.get("email")
        phone = form.get("phone")
        aadhaar = form.get("aadhaar")
        password = form.get("password")

        file = request.files.get("idFile")

        # 🔹 Validate required fields
        if not all([full_name, email, phone, aadhaar, password]):
            return jsonify({"message": "Missing required fields"}), 400

        if not file:
            return jsonify({"message": "Biometric document required"}), 400

        # 🔹 Check duplicate Aadhaar
        if get_user_by_aadhaar(aadhaar):
            return jsonify({"message": "User already enrolled"}), 409

        # 🔹 Validate file extension
        allowed_extensions = current_app.config["ALLOWED_EXTENSIONS"]

        if "." not in file.filename:
            return jsonify({"message": "Invalid file name"}), 400

        extension = file.filename.rsplit(".", 1)[1].lower()

        if extension not in allowed_extensions:
            return jsonify({"message": "Invalid file type"}), 400

        # 🔹 Secure filename + unique ID
        filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4()}_{filename}"

        upload_folder = current_app.config["UPLOAD_FOLDER"]
        os.makedirs(upload_folder, exist_ok=True)

        filepath = os.path.join(upload_folder, unique_filename)
        file.save(filepath)

        # 🔹 Hash password
        hashed_password = hash_password(password)

        # 🔹 Create user document structure
        user_data = {
            "full_name": full_name,
            "email": email,
            "phone": phone,
            "aadhaar": aadhaar,
            "password": hashed_password,
            "role":"user",
            "documents": {
                "aadhaar": {
                    "uploaded": True,
                    "verified": False,
                    "path": filepath
                },
                "pan": {
                    "uploaded": False,
                    "verified": False,
                    "path": None
                },
                "passport": {
                    "uploaded": False,
                    "verified": False,
                    "path": None
                }
            }
        }

        create_user(user_data)

        return jsonify({
            "message": "Enrollment successful",
            "status": "pending_verification"
        }), 201

    except Exception as e:
        return jsonify({
            "message": "Enrollment failed",
            "error": str(e)
        }), 500

