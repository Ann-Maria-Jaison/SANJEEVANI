from ultralytics import YOLO
import cv2
import time
from plate_detection import detect_plate_from_frame
from alert_system import simulate_accident

# Load YOLO model
model = YOLO("yolov8n.pt")

# 🎥 Load video file
cap = cv2.VideoCapture("accident_video.mp4")

ACCIDENT_CONFIDENCE = 0.9
ALERT_COOLDOWN = 10  # seconds
last_alert_time = 0

while True:
    ret, frame = cap.read()

    if not ret:
        print("Video finished.")
        break

    results = model(frame)

    accident_detected = False

    for r in results:
        for box in r.boxes:
            conf = float(box.conf[0])

            if conf > ACCIDENT_CONFIDENCE:
                accident_detected = True
                break

        if accident_detected:
            break

    current_time = time.time()

    if accident_detected and (current_time - last_alert_time > ALERT_COOLDOWN):
        print("🚗 Possible Accident Detected!")

        plate = detect_plate_from_frame(frame)

        if plate:
            simulate_accident(plate, "CAM001")
            last_alert_time = current_time

    cv2.imshow("Accident Detection", frame)

    if cv2.waitKey(25) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()