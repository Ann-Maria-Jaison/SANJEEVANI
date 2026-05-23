# ml/train_severity.py
"""
Dataset structure expected (standard YOLOv8 cls format):
  datasets/severity/
    train/
      Minor/     <- images
      Moderate/  <- images
      Severe/    <- images
    val/
      Minor/
      Moderate/
      Severe/

Kaggle datasets to use:
  - "Road Accident Image Dataset" (search on Kaggle)
  - CADP (Car Accident Detection and Prediction)
  - Manually label frames from accident_video.mp4 as a starting point

Label guide:
  Minor    → vehicle damage only, no visible people injured
  Moderate → one vehicle, visible casualties or airbag deployment
  Severe   → multiple vehicles, fire, smoke, pedestrians, rollover
"""

from ultralytics import YOLO

def train():
    # Start from YOLOv8n classification backbone
    model = YOLO("yolov8n-cls.pt") 
    

    results = model.train(
        data="datasets/severity_split",   # path to your dataset root
        epochs=30,
        imgsz=224,                  # classification standard
        batch=32,
        project="runs",
        name="severity",
        patience=5,                 # early stopping
        augment=True,               # flips, color jitter — important for accident variety
        dropout=0.3,                # prevent overfitting on small dataset
        lr0=0.001,
    )

    print("Training complete.")
    print(f"Best model saved to: runs/severity_cls/weights/best.pt")
    print("Copy it to severity_cls.pt for use in the pipeline.")

if __name__ == "__main__":
    train()