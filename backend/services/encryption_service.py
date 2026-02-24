from cryptography.fernet import Fernet
import base64
import hashlib
from config import Config

class EncryptionService:

    @staticmethod
    def generate_key():
        """
        Generate AES-compatible key using SECRET_KEY
        """
        key = hashlib.sha256(Config.SECRET_KEY.encode()).digest()
        return base64.urlsafe_b64encode(key)

    @staticmethod
    def encrypt_bytes(data: bytes) -> bytes:
        key = EncryptionService.generate_key()
        f = Fernet(key)
        return f.encrypt(data)

    @staticmethod
    def decrypt_bytes(token: bytes) -> bytes:
        key = EncryptionService.generate_key()
        f = Fernet(key)
        return f.decrypt(token)
