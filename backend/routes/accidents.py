from fastapi import APIRouter, HTTPException
from typing import List
from models.schemas import AccidentReport, AccidentResponse, AccidentSchema
from database import supabase
from datetime import datetime

router = APIRouter()

def get_canonical_status(status_raw: str) -> str:
    """Consolidate various status inputs into ACTIVE or CLEARED."""
    if not status_raw:
        return "ACTIVE"
    s = status_raw.lower()
    if s in ["active", "reported", "detected", "pending"]:
        return "ACTIVE"
    return "CLEARED"

@router.post("/report-accident", response_model=AccidentResponse)
async def report_accident(report: AccidentReport):
    # Insert logs
    log_data = {
        "plate": report.plate,
        "camera_id": report.camera_id,
        "accident_time": report.accident_time.isoformat(),
        "status": "reported"
    }
    log_res = supabase.table("accident_logs").insert(log_data).execute()
    
    if not log_res.data:
        raise HTTPException(status_code=500, detail="Failed to log accident")
    
    # Fetch details for real-time response
    veh_res = supabase.table("vehicles").select("*").eq("plate", report.plate).single().execute()
    cam_res = supabase.table("cameras").select("*").eq("camera_id", report.camera_id).single().execute()
    
    vehicle = veh_res.data or {}
    camera = cam_res.data or {}
    
    return AccidentResponse(
        message="ACCIDENT_RECORDED",
        accident_id=log_res.data[0]["id"],
        status="ACTIVE",
        plate=report.plate,
        owner_name=vehicle.get("owner_name", "Unknown"),
        owner_phone=vehicle.get("owner_phone", "N/A"),
        emergency_contact=vehicle.get("emergency_contact", "N/A"),
        location=camera.get("area_name", "Unknown"),
        severity="HIGH"
    )

@router.get("/accidents", response_model=List[AccidentSchema])
async def get_accidents():
    # Fetch all logs
    acc_res = supabase.table("accident_logs").select("*").order("accident_time", desc=True).execute()
    if not acc_res.data:
        return []

    accidents = acc_res.data
    plates = list(set(a["plate"] for a in accidents))
    cams = list(set(a["camera_id"] for a in accidents if a.get("camera_id")))

    # Bulk fetch references
    veh_res = supabase.table("vehicles").select("*").in_("plate", plates).execute()
    cam_res = supabase.table("cameras").select("*").in_("camera_id", cams).execute()

    veh_map = {v["plate"]: v for v in (veh_res.data or [])}
    cam_map = {c["camera_id"]: c for c in (cam_res.data or [])}

    enriched = []
    for a in accidents:
        status_raw = a.get("status", "reported")
        status_display = get_canonical_status(status_raw)
        
        # Severity logic: Active ones are HIGH by default
        severity = a.get("severity") or ("HIGH" if status_display == "ACTIVE" else "LOW")
        
        vehicle = veh_map.get(a["plate"], {})
        camera = cam_map.get(a.get("camera_id"), {})

        enriched.append({
            **a,
            "status": status_display,
            "severity": severity,
            "owner_name": vehicle.get("owner_name"),
            "owner_phone": vehicle.get("owner_phone"),
            "emergency_contact": vehicle.get("emergency_contact"),
            "vehicle_type": vehicle.get("vehicle_type"),
            "insurance_id": vehicle.get("insurance_id"),
            "location": camera.get("area_name"),
            "latitude": camera.get("latitude"),
            "longitude": camera.get("longitude"),
            "is_false_positive": a.get("is_false_positive", False),  # ADD THIS LINE
        })

    return enriched


@router.patch("/accidents/{accident_id}/false-positive")
async def mark_false_positive(accident_id: int):
    # Update the record in Supabase
    res = supabase.table("accident_logs") \
        .update({"is_false_positive": True}) \
        .eq("id", accident_id) \
        .execute()

    if not res.data:
        raise HTTPException(status_code=404, detail="Accident not found")

        return {"message": "Marked as false positive", "accident_id": accident_id}
