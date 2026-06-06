from ultralytics import YOLO
import cv2
import os
from plate_detection import detect_plate_from_frame

# --- Setup ---
model = YOLO("yolov8n.pt")
video_path = os.path.join(os.path.dirname(__file__), "accident_video.mp4")
cap = cv2.VideoCapture(video_path)

print("▶ Starting video processing...")

while True:
    ret, frame = cap.read()
    if not ret:
        print("\n🛑 Video finished.")
        break

    # Process the frame
    small_frame = cv2.resize(frame, (640, 360))
    results = model(small_frame, verbose=False)

    # LOOP IS NOW INDENTED CORRECTLY
    for r in results:
        for box in r.boxes:
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            vehicle_crop = small_frame[y1:y2, x1:x2]

            if vehicle_crop.size > 0:
                print("🔎 Performing OCR on vehicle crop...")
                plate_text, ocr_conf = detect_plate_from_frame(vehicle_crop)
                
                if plate_text:
                    print(f"✅ SUCCESS: Plate Detected: {plate_text}")
                else:
                    print("⚠️ No plate readable in this frame.")

    # Show the video
    cv2.imshow("Accident Detection", small_frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()