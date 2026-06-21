import os

from agents import (
    Agent,
    AsyncOpenAI,
    OpenAIChatCompletionsModel,
    Runner,
    SQLiteSession,
    set_tracing_disabled,
)
from dotenv import load_dotenv

load_dotenv()


def build_model():
    provider = os.getenv("LLM_PROVIDER", "openai").lower()

    if provider == "openai":
        model_name = os.getenv("OPENAI_MODEL", "gpt-4.1-mini")
        return model_name

    if provider == "ollama":
        base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11435/v1")
        api_key = os.getenv("OLLAMA_API_KEY", "ollama")
        model_name = os.getenv("OLLAMA_MODEL", "qwen3.5:9b")

        client = AsyncOpenAI(
            api_key=api_key,
            base_url=base_url,
        )

        # 沒有 OpenAI API key 時，建議關閉 tracing
        set_tracing_disabled(True)

        return OpenAIChatCompletionsModel(
            model=model_name,
            openai_client=client,
        )

    raise ValueError(
        f"Unsupported LLM_PROVIDER: {provider}. "
        "Please use 'openai' or 'ollama'."
    )

INSTRUCTIONS = """
你是 TMScript 控制指令生成助手。

你的任務是根據使用者輸入，撰寫符合 TMScript 文件與慣例的機器人控制程式。

你需要遵守：
1. 主要使用 `search_tmscript_docs` 來檢索相關 API 文件。
2. 呼叫 `search_tmscript_docs` 時，只傳入使用者的原始控制需求，不要加入你的推理、摘要、工具名稱、或其他內部說明文字。
3. 先根據文件理解可用 API、參數與寫法，再生成程式碼。
4. 程式碼內容應優先符合文件中的範例與命名方式。
5. 如果資訊不足，例如缺少座標、Base、TCP、速度或夾爪設定，要清楚列出 assumptions 或 missing information。
6. 不要聲稱程式已經驗證可直接上真機執行。
"""

def build_tmscript_agent() -> Agent:
    return Agent(
        name="TMScript Agent",
        instructions=INSTRUCTIONS,
        model=build_model(),
    )
