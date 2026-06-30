from fastapi import APIRouter, HTTPException, Query
from typing import List
from database import supabase
from models.schemas import VehicleSchema

router = APIRouter()

@router.get("/vehicles/all", response_model=List[VehicleSchema])
async def get_all_vehicles(
    limit: int = Query(50, ge=1, le=500, description="Number of vehicles to return"),
    offset: int = Query(0, ge=0, description="Number of vehicles to skip")
):
    result = supabase.table("vehicles").select("*").range(offset, offset + limit - 1).execute()
    return result.data

@router.get("/vehicle/{plate}", response_model=VehicleSchema)
async def get_vehicle(plate: str):
    result = supabase.table("vehicles").select("*").eq("plate", plate).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail=f"Vehicle with plate {plate} not found")
        
    return result.data[0]
