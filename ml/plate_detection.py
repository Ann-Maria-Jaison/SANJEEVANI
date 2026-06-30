import cv2
import numpy as np
import easyocr

# Initialize the reader
reader = easyocr.Reader(['en'])

def detect_plate_from_frame(frame):
    # Just use the original frame without heavy filtering first
    results = reader.readtext(frame)

    for (bbox, text, prob) in results:
        cleaned_text = text.replace(" ", "").upper()
        # If we find ANY text, let's trust it for now
        if len(cleaned_text) > 4: 
            print(f"✅ FOUND PLATE: {cleaned_text} (Conf: {prob:.2f})")
            return cleaned_text, prob

    return None, 0.0