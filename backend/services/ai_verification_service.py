import pytesseract
import cv2
import re
import numpy as np
import pdfplumber
from pdf2image import convert_from_path


class AIVerificationService:

    # ================= OCR EXTRACTION =================

    @staticmethod
    def extract_text(file_path):
        try:
            if file_path.lower().endswith(".pdf"):

                # Try direct text extraction first
                with pdfplumber.open(file_path) as pdf:
                    text = ""
                    for page in pdf.pages:
                        text += page.extract_text() or ""

                if text.strip():
                    return text

                # If scanned PDF
                pages = convert_from_path(file_path, dpi=300)
                image = np.array(pages[0])

            else:
                image = cv2.imread(file_path)

            if image is None:
                return ""

            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            gray = cv2.medianBlur(gray, 3)

            return pytesseract.image_to_string(gray)

        except Exception as e:
            print("AI OCR Error:", str(e))
            return ""

    # ================= AADHAAR =================

    @staticmethod
    def verify_aadhaar(text, db_name, db_aadhaar):

        score = 0

        # Full 12 digit match
        full_match = re.search(r"\b\d{4}\s?\d{4}\s?\d{4}\b", text)

        # Masked match (XXXX XXXX 1234)
        masked_match = re.search(r"X{4}\W?X{4}\W?(\d{4})", text)

        if full_match:
            extracted = full_match.group().replace(" ","")
            if extracted == db_aadhaar:
                score += 60

        elif masked_match:
            last4 = masked_match.group(1)
            if last4 == db_aadhaar[-4:]:
                score += 40

        # Name match
        if db_name.lower() in text.lower():
            score += 40

        return {
            "document_type": "aadhaar",
            "confidence_score": score,
            "status": "auto_verified" if score >= 80 else "manual_review"
        }

    # ================= PAN =================

    @staticmethod
    def verify_pan(text, db_name):
        score = 0

        pan_match = re.search(r"\b[A-Z]{5}[0-9]{4}[A-Z]\b", text)

        if pan_match:
            score += 60

        if db_name.lower() in text.lower():
            score += 40

        return {
            "document_type": "pan",
            "confidence_score": score,
            "status": "auto_verified" if score >= 75 else "manual_review"
        }

    # ================= DRIVING LICENSE =================

    @staticmethod
    def verify_driving_license(text, db_name):
        score = 0

        dl_match = re.search(r"\b[A-Z]{2}[0-9]{2}[0-9]{4}[0-9]{7}\b", text)

        if dl_match:
            score += 60

        if db_name.lower() in text.lower():
            score += 40

        return {
            "document_type": "driving_license",
            "confidence_score": score,
            "status": "auto_verified" if score >= 75 else "manual_review"
        }

    # ================= MAIN ROUTER =================

    @staticmethod
    def verify_document(file_path, doc_type, user):

        text = AIVerificationService.extract_text(file_path)

        print("========= EXTRACTED TEXT =========")
        print(text)
        print("==================================")

        if not text.strip():
            return {
                "document_type": doc_type,
                "confidence_score": 0,
                "status": "manual_review"
            }

        if doc_type == "aadhaar":
            return AIVerificationService.verify_aadhaar(
                text,
                user["full_name"],
                user["aadhaar"]
            )

        elif doc_type == "pan":
            return AIVerificationService.verify_pan(
                text,
                user["full_name"]
            )

        elif doc_type == "driving":
            return AIVerificationService.verify_driving_license(
                text,
                user["full_name"]
            )

        return None
