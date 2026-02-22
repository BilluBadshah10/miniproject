from flask import Blueprint, jsonify, request, send_file, current_app
from token_utils import verify_token
from models.user_model import get_user_by_id
from database.db import get_db
from werkzeug.utils import secure_filename
from bson import ObjectId
import uuid
import os

biometric_bp = Blueprint("biometric_bp", __name__)

ALLOWED_DOC_TYPES = ["aadhaar", "pan", "passport"]

@biometric_bp.route("/verify-document/<doc_type>", methods=["POST"])
def verify_document(doc_type):

    if doc_type not in ALLOWED_DOC_TYPES:
        return jsonify({"message": "Invalid document type"}), 400

    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"message": "Token missing"}), 401

    token = auth_header.split(" ")[1]
    payload = verify_token(token)

    if not payload or payload.get("role") != "admin":
        return jsonify({"message": "Admin access required"}), 403

    user_id = request.json.get("user_id")

    if not user_id:
        return jsonify({"message": "User ID required"}), 400

    db = get_db()

    result = db.users.update_one(
        {"_id": ObjectId(user_id)},
        {
            "$set": {
                f"documents.{doc_type}.verified": True
            }
        }
    )

    if result.modified_count == 0:
        return jsonify({"message": "Verification failed"}), 400

    return jsonify({"message": f"{doc_type} verified successfully"}), 200

@biometric_bp.route("/all-users", methods=["GET"])
def get_all_users():

    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"message": "Token missing"}), 401

    token = auth_header.split(" ")[1]
    payload = verify_token(token)

    if not payload or payload.get("role") != "admin":
        return jsonify({"message": "Admin access required"}), 403

    db = get_db()
    users = list(db.users.find({}, {"password": 0}))

    for user in users:
        user["_id"] = str(user["_id"])

    return jsonify(users)

@biometric_bp.route("/biometric-status", methods=["GET"])
def biometric_status():

    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"message": "Token missing"}), 401

    token = auth_header.split(" ")[1]
    payload = verify_token(token)

    if not payload:
        return jsonify({"message": "Invalid or expired token"}), 401

    user_id = payload["user_id"]
    user = get_user_by_id(user_id)

    if not user:
        return jsonify({"message": "User not found"}), 404

    return jsonify({
        "biometric_status": "secured",
        "documents": user.get("documents", {})
    })

@biometric_bp.route("/view-document/<doc_type>", methods=["GET"])
def view_document(doc_type):

    if doc_type not in ALLOWED_DOC_TYPES:
        return jsonify({"message": "Invalid document type"}), 400

    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"message": "Token missing"}), 401

    token = auth_header.split(" ")[1]
    payload = verify_token(token)

    if not payload:
        return jsonify({"message": "Invalid or expired token"}), 401

    user_id = payload["user_id"]
    user = get_user_by_id(user_id)

    if not user:
        return jsonify({"message": "User not found"}), 404

    document = user.get("documents", {}).get(doc_type)

    if not document or not document.get("uploaded"):
        return jsonify({"message": "Document not uploaded"}), 404

    file_path = document.get("path")

    if not file_path or not os.path.exists(file_path):
        return jsonify({"message": "File not found on server"}), 404

    return send_file(file_path, as_attachment=False)

@biometric_bp.route("/upload-document/<doc_type>", methods=["POST"])
def upload_document(doc_type):

    if doc_type not in ALLOWED_DOC_TYPES:
        return jsonify({"message": "Invalid document type"}), 400

    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"message": "Token missing"}), 401

    token = auth_header.split(" ")[1]
    payload = verify_token(token)

    if not payload:
        return jsonify({"message": "Invalid or expired token"}), 401

    user_id = payload["user_id"]
    user = get_user_by_id(user_id)

    if not user:
        return jsonify({"message": "User not found"}), 404

    file = request.files.get("file")
    if not file:
        return jsonify({"message": "File required"}), 400

    # Secure filename
    filename = secure_filename(file.filename)
    unique_filename = f"{uuid.uuid4()}_{filename}"

    upload_folder = current_app.config["UPLOAD_FOLDER"]
    os.makedirs(upload_folder, exist_ok=True)

    filepath = os.path.join(upload_folder, unique_filename)
    file.save(filepath)

    # Update user document in DB
    db = get_db()

    db.users.update_one(
        {"_id": user["_id"]},
        {
            "$set": {
                f"documents.{doc_type}.uploaded": True,
                f"documents.{doc_type}.verified": False,
                f"documents.{doc_type}.path": filepath
            }
        }
    )

    return jsonify({
        "message": f"{doc_type.capitalize()} uploaded successfully",
        "status": "pending_verification"
    }), 200

