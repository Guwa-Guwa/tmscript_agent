import os
import tempfile
from pathlib import Path

import ctranslate2
from faster_whisper import WhisperModel


INITIAL_PROMPT = "這是一個機器人語音助手，支援中文和 English 交流"
DEFAULT_MODEL_SIZE = "large-v3-turbo"
DEFAULT_COMPUTE_TYPE = "int8"

_model: WhisperModel | None = None


def _get_device() -> str:
    configured_device = os.getenv("VOICE_DEVICE")
    if configured_device:
        return configured_device

    try:
        return "cuda" if ctranslate2.get_cuda_device_count() > 0 else "cpu"
    except Exception:
        return "cpu"


def get_voice_model() -> WhisperModel:
    global _model

    if _model is None:
        model_size = os.getenv("VOICE_MODEL_SIZE", DEFAULT_MODEL_SIZE)
        compute_type = os.getenv("VOICE_COMPUTE_TYPE", DEFAULT_COMPUTE_TYPE)
        _model = WhisperModel(
            model_size,
            device=_get_device(),
            compute_type=compute_type,
        )
    return _model


def transcribe_audio_bytes(audio: bytes, suffix: str = ".webm", language: str = "zh") -> str:
    if not audio:
        raise ValueError("音訊檔案是空的")

    temp_path: Path | None = None

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
            temp_file.write(audio)
            temp_path = Path(temp_file.name)

        segments, _ = get_voice_model().transcribe(
            str(temp_path),
            language=language,
            initial_prompt=INITIAL_PROMPT,
            beam_size=5,
            vad_filter=True,
            vad_parameters={"min_silence_duration_ms": 500},
        )
        return "".join(segment.text for segment in segments).strip()
    finally:
        if temp_path is not None:
            temp_path.unlink(missing_ok=True)
