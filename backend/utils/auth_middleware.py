from functools import wraps
from flask import request, jsonify
from token_utils import verify_token

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):

        auth_header = request.headers.get("Authorization")

        if not auth_header:
            return jsonify({"message": "Token missing"}), 401

        try:
            token = auth_header.split(" ")[1]
        except IndexError:
            return jsonify({"message": "Invalid token format"}), 401

        user_id = verify_token(token)

        if not user_id:
            return jsonify({"message": "Invalid or expired token"}), 401

        return f(user_id, *args, **kwargs)

    return decorated

