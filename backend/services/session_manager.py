import uuid
from backend.db import session_repository

def _generate_session_id():
    return str(uuid.uuid4())

def create_session():
    session_id = _generate_session_id()
    title="Untitled Chat"

    return session_repository.create_session(
        session_id=session_id,
        title=title,
    )