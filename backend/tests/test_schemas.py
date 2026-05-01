import pytest
from app.schemas import QueryRequest, QueryResponse, FavoriteRequest, LocationItem

def test_query_request():
    req = QueryRequest(text="Hello Lucy")
    assert req.text == "Hello Lucy"

def test_query_response():
    resp = QueryResponse(
        text="Response text",
        images=[],
        map_query="query",
        suggested_followups=["Follow up"]
    )
    assert resp.text == "Response text"

def test_favorite_request():
    req = FavoriteRequest(user_id="user1", location_id="loc1")
    assert req.user_id == "user1"
    assert req.location_id == "loc1"

def test_location_item():
    loc = LocationItem(
        id="1",
        name="Axum",
        description="Ancient city",
        history="Old history",
        architecture="Obelisks",
        cultural_significance="UNESCO site"
    )
    assert loc.name == "Axum"
    assert loc.to_context_text().startswith("1. Ancient city")