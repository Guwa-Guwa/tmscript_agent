from backend.services import session_manager
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/sessions", tags=["sessions"])


class SendMessageRequest(BaseModel):
    content: str


class RenameSessionRequest(BaseModel):
    title: str


@router.post("")
def create_session():
    return session_manager.create_session()


@router.get("")
def list_sessions():
    pass


@router.get("/{session_id}")
def get_session(session_id: str):
    pass


@router.post("/{session_id}/messages")
def send_message(session_id: str, request: SendMessageRequest):
    pass


@router.patch("/{session_id}")
def rename_session(session_id: str, request: RenameSessionRequest):
    pass


@router.delete("/{session_id}")
def delete_session(session_id: str):
    pass