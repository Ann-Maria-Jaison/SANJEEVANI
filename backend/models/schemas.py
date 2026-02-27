from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class AccidentReport(BaseModel):
    plate: str
    camera_id: str
    accident_time: datetime

class AccidentResponse(BaseModel):
    status: str
    plate: str
    message: str
    accident_id: int
    status: str
    # Enriched details returned on report
    owner_name: str
    owner_phone: str
    emergency_contact: str
    location: str
    severity: str

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
