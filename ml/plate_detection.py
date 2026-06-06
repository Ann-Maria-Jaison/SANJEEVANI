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

        # Check if length is valid (8-12 characters)
        if 8 <= len(cleaned_text) <= 12:
            print("🔎 Detected Plate:", cleaned_text, "with confidence:", prob)
            # RETURN both the text and the confidence score
            return cleaned_text, prob

    # Return None for both if no valid plate found
    return None, 0.0