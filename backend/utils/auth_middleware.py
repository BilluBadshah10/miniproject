from functools import wraps
from flask import request, jsonify
from token_utils import verify_token

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):

        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({"message": "Token missing"}), 401

        token = auth_header.split(" ")[1]
        payload = verify_token(token)

        if not payload:
            return jsonify({"message": "Invalid or expired token"}), 401

        return f(payload, *args, **kwargs)

    return decorated
    
def role_required(required_role):
    def wrapper(f):
        @wraps(f)
        def decorated(*args, **kwargs):

            auth_header = request.headers.get("Authorization")
            if not auth_header or not auth_header.startswith("Bearer "):
                return jsonify({"message": "Token missing"}), 401

            token = auth_header.split(" ")[1]
            payload = verify_token(token)

            if not payload:
                return jsonify({"message": "Invalid or expired token"}), 401

            if payload.get("role") != required_role:
                return jsonify({"message": "Access denied"}), 403

            return f(payload, *args, **kwargs)

        return decorated
    return wrapper
