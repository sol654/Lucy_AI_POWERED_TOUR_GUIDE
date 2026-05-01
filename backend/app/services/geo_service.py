import os
import logging
import httpx

logger = logging.getLogger(__name__)

GEOAPIFY_API_KEY = os.getenv("GEOAPIFY_API_KEY", "")
GEOAPIFY_BASE = "https://api.geoapify.com/v1"


async def geocode(place_name: str) -> dict | None:
    """Forward geocode a place name → { lat, lon, formatted }"""
    if not GEOAPIFY_API_KEY:
        return None
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.get(
                f"{GEOAPIFY_BASE}/geocode/search",
                params={"text": place_name, "apiKey": GEOAPIFY_API_KEY, "limit": 1},
            )
            r.raise_for_status()
            features = r.json().get("features", [])
            if not features:
                return None
            props = features[0]["properties"]
            return {
                "lat": props.get("lat"),
                "lon": props.get("lon"),
                "formatted": props.get("formatted", place_name),
            }
    except Exception as e:
        logger.exception("Geocode error: %s", e)
        return None


async def place_details(lat: float, lon: float) -> dict | None:
    """Reverse geocode coordinates → place details."""
    if not GEOAPIFY_API_KEY:
        return None
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.get(
                f"{GEOAPIFY_BASE}/geocode/reverse",
                params={"lat": lat, "lon": lon, "apiKey": GEOAPIFY_API_KEY},
            )
            r.raise_for_status()
            features = r.json().get("features", [])
            if not features:
                return None
            return features[0]["properties"]
    except Exception as e:
        logger.exception("Reverse geocode error: %s", e)
        return None
