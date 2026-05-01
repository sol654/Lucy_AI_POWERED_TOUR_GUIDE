import pytest
from app.models import HeritageSite, User, Favorite

def test_heritage_site():
    site = HeritageSite(
        name="Axum",
        description="Ancient city",
        history="Founded long ago",
        architecture="Obelisks",
        cultural_significance="UNESCO"
    )
    assert site.name == "Axum"
    context = site.to_context_text()
    assert "Axum" in context
    assert "UNESCO" in context

def test_user():
    user = User(user_id="u1", name="John", email="john@example.com")
    assert user.name == "John"

def test_favorite():
    fav = Favorite(user_id="u1", location_id="l1")
    assert fav.user_id == "u1"