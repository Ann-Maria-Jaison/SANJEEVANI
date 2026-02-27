from ultralytics import YOLO
import cv2
import os
import time
from plate_detection import detect_plate_from_frame
from alert_system import simulate_accident

# Load lightweight model
model = YOLO("yolov8n.pt")

cap = cv2.VideoCapture("accident_video.mp4")

ACCIDENT_CONFIDENCE = 0.9
FRAME_SKIP = 5   # Process 1 frame every 5 frames
frame_count = 0
last_vehicle_crop = None

if not os.path.exists("captured_frames"):
    os.makedirs("captured_frames")

print("▶ Smooth optimized video running...\n")

while True:
    ret, frame = cap.read()
    if not ret:
        print("\n🛑 Video finished.\n")
        break

    frame_count += 1

    # Resize for speed (very important)
    small_frame = cv2.resize(frame, (640, 360))

    # Only run YOLO on every 5th frame
    if frame_count % FRAME_SKIP == 0:

        results = model(small_frame, verbose=False)

        for r in results:
            for box in r.boxes:
                conf = float(box.conf[0])

                if conf > ACCIDENT_CONFIDENCE:
                    print("🚗 Accident frame captured")

                    x1, y1, x2, y2 = map(int, box.xyxy[0])
                    vehicle_crop = small_frame[y1:y2, x1:x2]

                    # Save full frame
                    cv2.imwrite(f"captured_frames/accident_{frame_count}.jpg", small_frame)

                    if vehicle_crop.size != 0:
                        cv2.imwrite(f"captured_frames/vehicle_{frame_count}.jpg", vehicle_crop)
                        last_vehicle_crop = vehicle_crop

    cv2.imshow("Accident Detection", small_frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()

# -------- AFTER VIDEO --------

print("🔎 Performing OCR after video ends...\n")

plate = None

if last_vehicle_crop is not None:
    plate = detect_plate_from_frame(last_vehicle_crop)

if not plate:
    print("⚠️ OCR failed due to blur.")
    print("⚠️ Using demo plate number.")
    plate = "KL01AB1234"   # 👈 IMPORTANT: assign demo plate

print(f'Final Plate Used For Demo: "{plate}"')