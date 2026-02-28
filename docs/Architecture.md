# System Architecture

SANJEEVANI is an integrated emergency response framework that combines Computer Vision, Real-time APIs, and Geospatial intelligence.

```mermaid
graph TD
    A[CCTV Feed / Video] --> B[ML Detection Engine]
    B -->|Accident Detected| C[YOLOv8 Model]
    B -->|Number Plate OCR| D[EasyOCR]
    
    C --> E[FastAPI Backend]
    D --> E
    
    E --> F[Supabase Database]
    E --> G[Statewide CCTV Mapping]
    
    F -->|Vehicle Info| H[Dashboard UI]
    G -->|Location Info| H
    
    H --> I[Emergency Services Alert]
    I -->|Dispatch| J[Ambulance / Police]
```

## Workflow
1. **Detection**: The ML engine monitors CCTV feeds for accidents.
2. **Identification**: Upon detection, the system identifies the vehicle via OCR.
3. **Information Retrieval**: The backend fetches owner and emergency contact details from the simulated registry.
4. **Location Mapping**: The system maps the camera location to find the nearest emergency services.
5. **Response**: A single click dispatches alerts to hospitals, ambulances, and police.
