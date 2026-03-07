from datetime import datetime
from database.db import get_db
from bson import ObjectId


def default_document_schema(path=None, uploaded=False):
    return {
        "uploaded": uploaded,
        "verified": False,
        "path": path,
        "encryption": None,
        "pqc_enabled": False,
        "pqc_marker": None,
        "quantum_key": None,
        "ai_verification": None,
        "uploaded_at": None
    }


def user_schema(data, biometric_path):
    return {
        "full_name": data.get("fullName"),
        "email": data.get("email"),
        "phone": data.get("phone"),
        "aadhaar": data.get("aadhaar"),
        "password": data.get("password"),
        "role": "user",
        "created_at": datetime.utcnow(),

        "documents": {
            "aadhaar": {
                **default_document_schema(
                    path=biometric_path,
                    uploaded=True
                ),
                "uploaded_at": datetime.utcnow()
            },
            "pan": default_document_schema(),
            "passport": default_document_schema(),
            "voter": default_document_schema(),
            "driving": default_document_schema()
        }
    }


def get_user_by_id(user_id):
    db = get_db()
    return db.users.find_one({"_id": ObjectId(user_id)})


def create_user(user_data):
    db = get_db()
    return db.users.insert_one(user_data)


def get_user_by_aadhaar(aadhaar):
    db = get_db()
    return db.users.find_one({"aadhaar": aadhaar})


def get_user_by_email_or_aadhaar(identifier):
    db = get_db()
    return db.users.find_one({
        "$or": [
            {"email": identifier},
            {"aadhaar": identifier}
        ]
    })
