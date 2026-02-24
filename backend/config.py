import os

class Config:
    # Secret key for JWT / session encryption
    SECRET_KEY = os.environ.get("SECRET_KEY") or"super-secret-key"
    
    JWT_SECRET_KEY = "bharatid_jwt_secret_2026"   # 🔥 ADD THIS
    JWT_EXPIRATION_MINUTES = 60
    
    # MongoDB connection string
    MONGO_URI = os.environ.get("MONGO_URI") or "mongodb://localhost:27017/bharatid_db"

    # Upload folder for biometric files
    UPLOAD_FOLDER = os.path.join(os.getcwd(), "uploads")

    # Allowed file types
    ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "pdf"}

    # JWT Config
    JWT_EXPIRATION_MINUTES = 60

