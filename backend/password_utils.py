import bcrypt


def hash_password(password: str) -> str:
    """
    Hash user password using bcrypt.
    """
    # Convert to bytes
    password_bytes = password.encode("utf-8")

    # Generate salt + hash
    hashed = bcrypt.hashpw(password_bytes, bcrypt.gensalt())

    # Return string version (MongoDB friendly)
    return hashed.decode("utf-8")


def verify_password(password: str, hashed_password: str) -> bool:
    """
    Verify plain password against stored hash.
    """
    password_bytes = password.encode("utf-8")
    hashed_bytes = hashed_password.encode("utf-8")

    return bcrypt.checkpw(password_bytes, hashed_bytes)

