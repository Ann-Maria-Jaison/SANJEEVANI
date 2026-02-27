from ultralytics import YOLO
import cv2
import os
import requests
import random
import time
from datetime import datetime

# -------- CONFIG --------
API_URL = "http://localhost:8000"
ACCIDENT_CONFIDENCE = 0.8  # Lowered for demo consistency
FRAME_SKIP = 30 # Check every 1 second of video roughly

# -------- LOAD MODEL --------
# Use absolute path for robustness
MODEL_PATH = "C:\\Users\\Ann\\Desktop\\Sanjeevani\\ml\\yolov8n.pt"
VIDEO_PATH = "C:\\Users\\Ann\\Desktop\\Sanjeevani\\ml\\accident_video.mp4"

model = YOLO(MODEL_PATH)
cap = cv2.VideoCapture(VIDEO_PATH)

def fetch_db_plates():
    try:
        res = requests.get(f"{API_URL}/vehicles/all", timeout=5)
        if res.status_code == 200:
            return [v["plate"] for v in res.json()]
    except: pass
    return ["KL10UV9900", "KL07CD5678", "KL03GH6789"]

DB_PLATES = fetch_db_plates()

def report_to_backend(plate, camera_id="CAM001"):
    payload = {
        "plate": plate,
        "camera_id": camera_id,
        "accident_time": datetime.now().isoformat()
    }
    try:
        requests.post(f"{API_URL}/report-accident", json=payload, timeout=5)
        return True
    except: return False

print("🚀 Headless AI Detection Engine Started...")

frame_count = 0
reported = False

while True:
    ret, frame = cap.read()
    if not ret:
        cap.set(cv2.CAP_PROP_POS_FRAMES, 0) # Loop video
        reported = False # Reset report for loop
        continue

    frame_count += 1
    if frame_count % FRAME_SKIP == 0 and not reported:
        results = model(frame, verbose=False)
        for r in results:
            for box in r.boxes:
                conf = float(box.conf[0])
                if conf > ACCIDENT_CONFIDENCE:
                    plate = random.choice(DB_PLATES)
                    print(f"🚨 [AI] Accident Detected! (conf={conf:.2f}) Reporting plate {plate}...")
                    if report_to_backend(plate):
                        reported = True
                        print("✅ [AI] Incident successfully logged to backend.")
                        # Wait for a bit before allowing another detection to prevent spam
                        time.sleep(10) 

    # No sleep needed here as we want to process fast, 
    # but in a real live feed we'd sync with clock.
    time.sleep(0.01)
