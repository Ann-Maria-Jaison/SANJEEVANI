from fastapi import APIRouter, HTTPException
from typing import List
from database import supabase
from models.schemas import VehicleSchema

router = APIRouter()

@router.get("/vehicles/all", response_model=List[VehicleSchema])
async def get_all_vehicles():
    result = supabase.table("vehicles").select("*").execute()
    return result.data

@router.get("/vehicle/{plate}", response_model=VehicleSchema)
async def get_vehicle(plate: str):
    result = supabase.table("vehicles").select("*").eq("plate", plate).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail=f"Vehicle with plate {plate} not found")
        
    return result.data[0]
