import hashlib
import uuid


class BiometricService:

    @staticmethod
    def generate_cancelable_template(file_path: str) -> str:
        """
        Simulate feature extraction + transformation
        """
        with open(file_path, "rb") as f:
            raw_data = f.read()

        # Feature hash
        feature_hash = hashlib.sha256(raw_data).hexdigest()

        # Cancelable transformation using random salt
        salt = str(uuid.uuid4())
        transformed = hashlib.sha256((feature_hash + salt).encode()).hexdigest()

        return transformed

