from datetime import datetime

def biometric_schema(user_id, encrypted_template):
    return {
        "user_id": user_id,
        "encrypted_template": encrypted_template,
        "encryption": "AES-256",
        "pqc_layer": "Enabled",
        "created_at": datetime.utcnow()
    }

