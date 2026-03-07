from flask import Blueprint, jsonify, request, send_file, current_app
from models.user_model import get_user_by_id
from database.db import get_db
from werkzeug.utils import secure_filename
from bson import ObjectId
from utils.auth_middleware import token_required, role_required
from services.encryption_service import EncryptionService
from services.pqc_service import PQCService
from services.ai_verification_service import AIVerificationService
from io import BytesIO
import io
import uuid
import os

biometric_bp = Blueprint("biometric_bp", __name__)

ALLOWED_DOC_TYPES = ["aadhaar", "pan", "passport", "driving", "voter"]

@biometric_bp.route("/admin/user/<user_id>", methods=["GET"])
@role_required("admin")
def get_single_user(current_user, user_id):

    db = get_db()

    user = db.users.find_one(
        {"_id": ObjectId(user_id)},
        {"password": 0}
    )

    if not user:
        return jsonify({"message":"User not found"}),404

    user["_id"] = str(user["_id"])

    return jsonify(user)

@biometric_bp.route("/reject-document/<doc_type>", methods=["POST"])
@role_required("admin")
def reject_document(current_user, doc_type):

    user_id = request.json.get("user_id")

    if not user_id:
        return jsonify({"message": "User ID required"}), 400

    db = get_db()

    db.users.update_one(
        {"_id": ObjectId(user_id)},
        {
            "$set": {
                f"documents.{doc_type}.verified": False,
                f"documents.{doc_type}.rejected": True
            }
        }
    )

    return jsonify({"message": f"{doc_type} rejected"}), 200

@biometric_bp.route("/admin/view-document/<user_id>/<doc_type>", methods=["GET"])
@role_required("admin")
def admin_view_document(current_user, user_id, doc_type):

    if doc_type not in ALLOWED_DOC_TYPES:
        return jsonify({"message": "Invalid document type"}), 400

    db = get_db()
    user = db.users.find_one({"_id": ObjectId(user_id)})

    if not user:
        return jsonify({"message": "User not found"}), 404

    document = user.get("documents", {}).get(doc_type)

    if not document or not document.get("uploaded"):
        return jsonify({"message": "Document not uploaded"}), 404

    file_path = document.get("path")

    if not os.path.exists(file_path):
        return jsonify({"message": "File not found"}), 404

    with open(file_path, "rb") as f:
        file_data = f.read()

    # Try decrypting
    try:
        decrypted_data = EncryptionService.decrypt_bytes(file_data)
    except Exception:
        decrypted_data = file_data  # fallback if not encrypted

    # Integrity check (only if encrypted)
    stored_marker = document.get("pqc_marker")
    if stored_marker:
        calculated_marker = PQCService.create_pqc_marker(file_data)
        if stored_marker != calculated_marker:
            return jsonify({"message": "Integrity check failed"}), 403

    return send_file(
        io.BytesIO(decrypted_data),
        download_name=f"{doc_type}.pdf",
        mimetype="application/pdf",
        as_attachment=False
    )

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

    db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {f"documents.{doc_type}.verified": True}}
    )

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

    user = get_user_by_id(current_user["user_id"])
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

    user = get_user_by_id(current_user["user_id"])
    if not user:
        return jsonify({"message": "User not found"}), 404

    document = user.get("documents", {}).get(doc_type)
    if not document or not document.get("uploaded"):
        return jsonify({"message": "Document not uploaded"}), 404

    file_path = document.get("path")
    if not os.path.exists(file_path):
        return jsonify({"message": "File not found"}), 404

    with open(file_path, "rb") as f:
        encrypted_data = f.read()

    # Integrity check
    stored_marker = document.get("pqc_marker")
    calculated_marker = PQCService.create_pqc_marker(encrypted_data)

    if stored_marker and stored_marker != calculated_marker:
        return jsonify({"message": "Integrity check failed"}), 403

    decrypted_data = EncryptionService.decrypt_bytes(encrypted_data)
    file_ext = file_path.split(".")[-1].lower()
    
    mime_map = {
    	"pdf": "application/pdf",
    	"png": "image/png",
    	"jpg": "image/jpeg",
    	"jpeg": "image/jpeg"
    }
    
    return send_file(
        io.BytesIO(decrypted_data),
    	download_name=f"{doc_type}.pdf",
    	mimetype="application/pdf",
    	as_attachment=False
    )


@biometric_bp.route("/upload-document/<doc_type>", methods=["POST"])
@token_required
def upload_document(current_user, doc_type):

    if doc_type not in ALLOWED_DOC_TYPES:
        return jsonify({"message": "Invalid document type"}), 400

    user = get_user_by_id(current_user["user_id"])
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
    file.save(filepath)

    # 🤖 AI Verification
    ai_result = AIVerificationService.verify_document(
        filepath,
        doc_type,
        user
    )
    
    if ai_result and ai_result["status"] == "auto_verified":
    	verified_status = True
    else:
    	verified_status = False
    
    # 🔐 AES Encryption
    with open(filepath, "rb") as f:
        original_data = f.read()

    encrypted_data = EncryptionService.encrypt_bytes(original_data)

    with open(filepath, "wb") as f:
        f.write(encrypted_data)

    # 🧠 PQC Simulation
    quantum_key = PQCService.generate_quantum_safe_key()
    pqc_marker = PQCService.create_pqc_marker(encrypted_data)

    # 💾 Update DB
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
                f"documents.{doc_type}.quantum_key": quantum_key,
                f"documents.{doc_type}.ai_verification": ai_result
            }
        }
    )

    return jsonify({
        "message": f"{doc_type.capitalize()} uploaded successfully",
        "ai_status": ai_result["status"] if ai_result else "manual_review"
    }), 200
