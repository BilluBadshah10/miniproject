from datetime import datetime
from database.db import get_db
from bson import ObjectId

from datetime import datetime
from database.db import get_db



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
                "uploaded": True,
                "verified": False,
                "path": biometric_path
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

