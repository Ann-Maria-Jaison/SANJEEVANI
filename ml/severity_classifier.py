from ultralytics import YOLO
import cv2
import numpy as np
from pathlib import Path

SEVERITY_LABELS={0:'Minor',1:'Moderate',2:'Severe'}
SEVERITY_PROTOCOLS = {
    "Minor": (
        "Dispatch nearest ambulance. "
        "Prepare basic emergency care and observation beds."
    ),

    "Moderate": (
        "Alert trauma response unit. "
        "Prepare blood units, imaging support, and emergency ward."
    ),

    "Severe": (
        "Activate critical emergency protocol. "
        "Mobilize ICU, operating room, trauma surgeons, and multiple ambulances."
    )
}

class SeverityClassifier:
    def __init__(self, model_path: str = "severity_cls.pt"):
        self.model_path = model_path
        self.model = None
        self._load_model()

    def _load_model(self):
        if not Path(self.model_path).exists():
            print(f"[SeverityClassifier] Model not found at {self.model_path}. Run train_severity.py first.")
            self.model = None
            return
        self.model = YOLO(self.model_path)
        print(f"[SeverityClassifier] Loaded from {self.model_path}")
        
    def classify(self, frame: np.ndarray) -> dict:
        """
        Takes a BGR frame (numpy array from OpenCV).
        Returns severity label, confidence, and hospital protocol.
        """
        if self.model is None:
            return {"severity": "Unknown", "confidence": 0.0, "protocol": "Model not loaded"}

        results = self.model(frame, verbose=True)
        probs = results[0].probs  # ClassificationResults probs object

        top_class = int(probs.top1)
        confidence = float(probs.top1conf)
        label = SEVERITY_LABELS.get(top_class, "Unknown")

        return {
            "severity": label,
            "confidence": round(confidence, 3),
            "protocol": SEVERITY_PROTOCOLS[label],
            "class_id": top_class
        }