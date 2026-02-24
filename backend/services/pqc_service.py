import secrets
import hashlib

class PQCService:

    @staticmethod
    def generate_quantum_safe_key():
        """
        Simulated post-quantum secure random key
        """
        return secrets.token_hex(64)

    @staticmethod
    def create_pqc_marker(data: bytes) -> str:
        """
        Generate SHA-512 marker for encrypted data
        """
        return hashlib.sha512(data).hexdigest()
