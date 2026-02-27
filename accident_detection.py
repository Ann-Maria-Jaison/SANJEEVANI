from ultralytics import YOLO
import cv2
import time
import os
from plate_detection import detect_plate_from_frame
from alert_system import simulate_accident

# Load YOLO model
model = YOLO("yolov8n.pt")

# 🎥 Load video file
cap = cv2.VideoCapture("accident_video.mp4")

ACCIDENT_CONFIDENCE = 0.9
ALERT_COOLDOWN = 10  # seconds
last_alert_time = 0

frame_count = 0
accident_active = False

if not os.path.exists("captured_frames"):
    os.makedirs("captured_frames")

while True:
    ret, frame = cap.read()

    if not ret:
        print("Video finished.")
        break

    frame_count += 1   # ✅ ADD THIS

    results = model(frame)

    accident_detected = False
    vehicle_crop = None

    for r in results:
        for box in r.boxes:
            conf = float(box.conf[0])
            cls = int(box.cls[0])

            if conf > ACCIDENT_CONFIDENCE:
                accident_detected = True
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                vehicle_crop = frame[y1:y2, x1:x2]
                break

        if accident_detected:
            break

    current_time = time.time()

    if accident_detected and (current_time - last_alert_time > ALERT_COOLDOWN):
        print("🚗 Possible Accident Detected!")

        # Save full frame
        frame_path = f"captured_frames/accident_{frame_count}.jpg"
        cv2.imwrite(frame_path, frame)
        print("📸 Frame saved:", frame_path)

        # Save vehicle crop and run OCR
        if vehicle_crop is not None and vehicle_crop.size != 0:
            crop_path = f"captured_frames/vehicle_{frame_count}.jpg"
            cv2.imwrite(crop_path, vehicle_crop)
            print("🚘 Vehicle crop saved:", crop_path)

        plate = detect_plate_from_frame(frame)

        if plate:
            simulate_accident(plate, "CAM001")
            last_alert_time = current_time

    # Reset when accident not detected anymore
    if not accident_detected:
        accident_active = False

    cv2.imshow("Accident Detection", frame)

    if cv2.waitKey(25) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()