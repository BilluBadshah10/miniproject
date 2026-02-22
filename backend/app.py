from flask import Flask
from flask_cors import CORS
from config import Config
from database.db import init_db
from routes.auth_routes import auth_bp
from routes.enroll_routes import enroll_bp
from routes.biometric_routes import biometric_bp
import os


def create_app():
    app = Flask(__name__)

    # Load configuration
    app.config.from_object(Config)

    # Enable CORS for React frontend
    CORS(app)

    # Initialize MongoDB
    init_db(app)

    # Ensure uploads folder exists
    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

    # Register Blueprints
    app.register_blueprint(auth_bp, url_prefix="/api")
    app.register_blueprint(enroll_bp, url_prefix="/api")
    app.register_blueprint(biometric_bp, url_prefix="/api")

    return app


app = create_app()

if __name__ == "__main__":
    app.run(debug=True, port=5000)

