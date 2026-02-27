import easyocr
import cv2
import numpy as np

reader = easyocr.Reader(['en'])

def detect_plate_from_frame(frame):

    # Convert to grayscale
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    # Improve contrast
    gray = cv2.equalizeHist(gray)

    # Reduce noise
    gray = cv2.GaussianBlur(gray, (5, 5), 0)

    # Sharpen
    kernel = np.array([[0, -1, 0],
                       [-1, 5, -1],
                       [0, -1, 0]])
    processed = cv2.filter2D(gray, -1, kernel)

    results = reader.readtext(processed)

    for (bbox, text, prob) in results:
        cleaned_text = text.replace(" ", "").upper()

        # Simple validation for Indian plates
        if prob > 0.6 and 8 <= len(cleaned_text) <= 12:
            print("🔎 Detected Plate:", cleaned_text)
            return cleaned_text

    return None
    