from cryptography.fernet import Fernet
import base64
import hashlib
from config import Config


class EncryptionService:

    @staticmethod
    def generate_key():
        """
        Generate AES-compatible key from SECRET_KEY
        """
        key = hashlib.sha256(Config.SECRET_KEY.encode()).digest()
        return base64.urlsafe_b64encode(key)

    @staticmethod
    def encrypt_data(data: str) -> str:
        key = EncryptionService.generate_key()
        f = Fernet(key)
        encrypted = f.encrypt(data.encode())
        return encrypted.decode()

    @staticmethod
    def decrypt_data(token: str) -> str:
        key = EncryptionService.generate_key()
        f = Fernet(key)
        decrypted = f.decrypt(token.encode())
        return decrypted.decode()

