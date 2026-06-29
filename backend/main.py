import logging
from pathlib import Path

import anyio
from backend.db.init_db import init_db
from backend.routers.sessions import router as sessions_router
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from utli import Runner, SQLiteSession, build_tmscript_agent
from backend.schemas import ChatRequest, ChatResponse, VoiceTranscriptionResponse
from backend.voice import transcribe_audio_bytes

app = FastAPI()
init_db()
app.include_router(sessions_router, prefix="/api")

logger = logging.getLogger(__name__)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

agent = build_tmscript_agent()
sessions: dict[str, SQLiteSession] = {}


def get_chat_session(session_id: str) -> SQLiteSession:
    if session_id not in sessions:
        sessions[session_id] = SQLiteSession(session_id)

    return sessions[session_id]


@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    result = await Runner.run(
        agent,
        request.message,
        session=get_chat_session(request.session_id),
    )

    return ChatResponse(reply=result.final_output)


VOICE_LANGUAGE_MAP = {
    "zh": "zh",
    "zh-tw": "zh",
    "en": "en",
    "en-us": "en",
}


@app.post("/api/voice/transcribe", response_model=VoiceTranscriptionResponse)
async def transcribe_voice(audio: UploadFile = File(...), language: str = Form("zh-TW")):
    audio_bytes = await audio.read()

    if not audio_bytes:
        raise HTTPException(status_code=400, detail="音訊檔案是空的")

    normalized_language = language.strip().lower()
    whisper_language = VOICE_LANGUAGE_MAP.get(normalized_language)
    if whisper_language is None:
        raise HTTPException(status_code=400, detail=f"不支援的語音辨識語言：{language}")

    suffix = Path(audio.filename).suffix if audio.filename else ".webm"
    if not suffix:
        suffix = ".webm"

    try:
        text = await anyio.to_thread.run_sync(transcribe_audio_bytes, audio_bytes, suffix, whisper_language)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    except Exception as error:
        logger.exception("Voice transcription failed")
        raise HTTPException(status_code=500, detail=f"語音辨識失敗：{error}") from error

    if not text:
        raise HTTPException(status_code=422, detail="沒有辨識到可用文字")

    return VoiceTranscriptionResponse(text=text)
