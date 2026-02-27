import easyocr
import cv2

reader = easyocr.Reader(['en'])

def detect_plate_from_frame(frame):
    results = reader.readtext(frame)

    for (bbox, text, prob) in results:
        if prob > 0.5 and len(text) >= 8:
            print("Detected Plate:", text)
            return text.upper()

    return None