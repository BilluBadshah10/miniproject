import jwt
from datetime import datetime, timedelta
from flask import current_app

def generate_token(user_id):
    expiration = datetime.utcnow() + timedelta(
        minutes=current_app.config["JWT_EXPIRATION_MINUTES"]
    )

    payload = {
        "user_id": str(user_id),
        "role": user.get("role", "user"),
        "exp": expiration
    }

    token = jwt.encode(
        payload,
        current_app.config["SECRET_KEY"],
        algorithm="HS256"
    )

    return token


def verify_token(token):
    try:
        payload = jwt.decode(
            token,
            current_app.config["SECRET_KEY"],
            algorithms=["HS256"]
        )
        return payload   
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None



