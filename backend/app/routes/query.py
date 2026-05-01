# Kept for backward compatibility — use /ai/query instead
from fastapi import APIRouter
from pydantic import BaseModel
from app.services.utils import process_query

router = APIRouter(tags=["legacy"])


class QueryRequest(BaseModel):
    text: str


@router.post("/query")
def query_ai(request: QueryRequest):
    return process_query(request.text)
