from flask import Blueprint, jsonify, request, send_file, current_app
from models.user_model import get_user_by_id
from database.db import get_db
from werkzeug.utils import secure_filename
from bson import ObjectId
from services.pqc_service import PQCService
from utils.auth_middleware import token_required, role_required
from services.encryption_service import EncryptionService
from io import BytesIO
import uuid
import os

biometric_bp = Blueprint("biometric_bp", __name__)

ALLOWED_DOC_TYPES = ["aadhaar", "pan", "passport"]

# ================= ADMIN ROUTES =================

@biometric_bp.route("/verify-document/<doc_type>", methods=["POST"])
@role_required("admin")
def verify_document(current_user, doc_type):

    if doc_type not in ALLOWED_DOC_TYPES:
        return jsonify({"message": "Invalid document type"}), 400

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
@role_required("admin")
def get_all_users(current_user):

    db = get_db()
    users = list(db.users.find({}, {"password": 0}))

    for user in users:
        user["_id"] = str(user["_id"])

    return jsonify(users)


# ================= USER ROUTES =================

@biometric_bp.route("/biometric-status", methods=["GET"])
@token_required
def biometric_status(current_user):

    user_id = current_user["user_id"]
    user = get_user_by_id(user_id)

    if not user:
        return jsonify({"message": "User not found"}), 404

    return jsonify({
        "biometric_status": "secured",
        "documents": user.get("documents", {})
    })


@biometric_bp.route("/view-document/<doc_type>", methods=["GET"])
@token_required
def view_document(current_user, doc_type):

    if doc_type not in ALLOWED_DOC_TYPES:
        return jsonify({"message": "Invalid document type"}), 400

    user_id = current_user["user_id"]
    user = get_user_by_id(user_id)

    if not user:
        return jsonify({"message": "User not found"}), 404

    document = user.get("documents", {}).get(doc_type)

    if not document or not document.get("uploaded"):
        return jsonify({"message": "Document not uploaded"}), 404

    file_path = document.get("path")

    if not file_path or not os.path.exists(file_path):
        return jsonify({"message": "File not found on server"}), 404

    #  Decrypt in memory before sending
    with open(file_path, "rb") as f:
        encrypted_data = f.read()

    decrypted_data = EncryptionService.decrypt_bytes(encrypted_data)

    return send_file(
        BytesIO(decrypted_data),
        as_attachment=False,
        download_name=os.path.basename(file_path)
    )


@biometric_bp.route("/upload-document/<doc_type>", methods=["POST"])
@token_required
def upload_document(current_user, doc_type):

    if doc_type not in ALLOWED_DOC_TYPES:
        return jsonify({"message": "Invalid document type"}), 400

    user_id = current_user["user_id"]
    user = get_user_by_id(user_id)

    if not user:
        return jsonify({"message": "User not found"}), 404

    file = request.files.get("file")
    if not file:
        return jsonify({"message": "File required"}), 400

    filename = secure_filename(file.filename)
    unique_filename = f"{uuid.uuid4()}_{filename}"

    upload_folder = current_app.config["UPLOAD_FOLDER"]
    os.makedirs(upload_folder, exist_ok=True)

    filepath = os.path.join(upload_folder, unique_filename)

    # Save temporarily
    file.save(filepath)

    # 🔐 Encrypt file at rest
    with open(filepath, "rb") as f:
        original_data = f.read()

    encrypted_data = EncryptionService.encrypt_bytes(original_data)

    with open(filepath, "wb") as f:
        f.write(encrypted_data)
    # 🧠 PQC Simulation Layer
quantum_key = PQCService.generate_quantum_safe_key()
pqc_marker = PQCService.create_pqc_marker(encrypted_data)

# Update DB
db = get_db()

db.users.update_one(
    {"_id": user["_id"]},
    {
        "$set": {
            f"documents.{doc_type}.uploaded": True,
            f"documents.{doc_type}.verified": False,
            f"documents.{doc_type}.path": filepath,
            f"documents.{doc_type}.encryption": "AES-256",
            f"documents.{doc_type}.pqc_enabled": True,
            f"documents.{doc_type}.pqc_marker": pqc_marker,
            f"documents.{doc_type}.quantum_key": quantum_key
        }
    }
)

    return jsonify({
        "message": f"{doc_type.capitalize()} uploaded successfully",
        "status": "pending_verification"
    }), 200
