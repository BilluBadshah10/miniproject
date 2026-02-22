import secrets
import hashlib


class PQCService:

    @staticmethod
    def generate_quantum_safe_key():
        """
        Simulate post-quantum key exchange
        """
        return secrets.token_hex(32)

    @staticmethod
    def hybrid_encrypt_marker(data: str) -> str:
        """
        Mark data as PQC-protected (simulation layer)
        """
        quantum_marker = hashlib.sha512(data.encode()).hexdigest()
        return quantum_marker

