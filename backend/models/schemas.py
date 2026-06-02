from pydantic import BaseModel
from datetime import datetime
from typing import Dict, Optional

class AccidentReport(BaseModel):
    plate: str
    camera_id: str
    accident_time: datetime
    confidence: Optional[float] = None

class AccidentResponse(BaseModel):
    status: str
    plate: str
    message: str
    accident_id: int
    # Enriched details returned on report
    owner_name: str
    owner_phone: str
    emergency_contact: str
    location: str
    severity: str
    confidence: Optional[float] = None  # ADDED THIS LINE

class VehicleSchema(BaseModel):
    plate: str
    owner_name: Optional[str] = None
    owner_phone: Optional[str] = None
    emergency_contact: Optional[str] = None
    vehicle_type: Optional[str] = None
    insurance_id: Optional[str] = None

class CameraSchema(BaseModel):
    camera_id: str
    latitude: float
    longitude: float
    area_name: str

class AccidentSchema(BaseModel):
    id: int
    plate: str
    camera_id: Optional[str] = None
    accident_time: datetime
    status: str
    image_path: Optional[str] = None
    # Enriched from vehicles table
    owner_name: Optional[str] = None
    owner_phone: Optional[str] = None
    emergency_contact: Optional[str] = None
    vehicle_type: Optional[str] = None
    insurance_id: Optional[str] = None
    # Enriched from cameras table
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    severity: Optional[str] = "LOW"
    confidence: Optional[float] = None
    is_false_positive: Optional[bool] = False  # ADD THIS LINE

class SendAlertRequest(BaseModel):
    accident_id: int

class DispatchServiceStatus(BaseModel):
    name: str
    status: str
    contact: Optional[str] = None
    eta_minutes: Optional[int] = None
    message: Optional[str] = None

class SendAlertResponse(BaseModel):
    message: str
    accident_id: int
    status: str
    dispatched_at: datetime
    emergency_contact: Optional[str] = None
    services: Dict[str, DispatchServiceStatus]
