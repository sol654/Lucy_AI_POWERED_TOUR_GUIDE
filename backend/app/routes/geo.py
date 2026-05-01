from fastapi import APIRouter, HTTPException, Query
from app.services.geo_service import geocode, place_details

router = APIRouter(prefix="/geo", tags=["geo"])


@router.get("/search")
async def search_place(q: str = Query(..., description="Place name to geocode")):
    result = await geocode(q)
    if not result:
        raise HTTPException(status_code=404, detail="Place not found")
    return result


@router.get("/reverse")
async def reverse_geocode(lat: float = Query(...), lon: float = Query(...)):
    result = await place_details(lat, lon)
    if not result:
        raise HTTPException(status_code=404, detail="Location not found")
    return result
