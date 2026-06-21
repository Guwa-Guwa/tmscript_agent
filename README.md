# TMScript Agent

## 功能

- 建立、切換、重新命名與刪除對話
- 透過聊天介面向 TMScript agent 提問
- 使用瀏覽器麥克風錄音，將語音轉成輸入文字
- 在 Workspace 中編輯 TMScript
- 顯示腳本驗證狀態與執行入口

## 專案結構

```text
.
├── .env                 # 本機環境變數，請勿提交真實 API key
├── .env.example         # 環境變數範例
├── utli.py              # LLM provider、agent 與 session 相關設定
├── backend/
│   ├── main.py          # FastAPI app、聊天 API、語音轉文字 API
│   ├── schemas.py       # API request / response schema
│   └── voice.py         # faster-whisper 語音辨識邏輯
└── frontend/
    ├── package.json     # React / Vite scripts
    ├── src/
    │   ├── App.tsx      # 前端主要狀態與 API 串接
    │   ├── components/  # Sidebar、ChatPanel、Workspace、ScriptEditor
    │   └── styles.css
    └── dist/            # 前端 build 輸出
```

## 啟動前準備

請先確認已安裝：

- Python 3.11+
- uv
- Node.js / npm
- NVIDIA driver / CUDA runtime / cuDNN（可選；只有語音辨識要使用 GPU 時需要）

語音辨識使用 `faster-whisper` 與 `ctranslate2`。若要讓 `VOICE_DEVICE=cuda`
正常運作，請先確認 NVIDIA driver、CUDA runtime 與 cuDNN 已安裝，並且版本與
目前安裝的 `ctranslate2` 相容。可以先用以下指令確認系統看得到 GPU：

```bash
nvidia-smi
```

如果 CUDA 環境尚未準備好，請先在 `.env` 設定 `VOICE_DEVICE=cpu`，讓語音辨識
改用 CPU 執行。

### 1. 安裝後端依賴

後端依賴已定義在 `pyproject.toml`。在專案根目錄執行：

```bash
uv sync
```

這會建立或更新 `.venv`，並安裝 FastAPI、OpenAI Agents SDK、faster-whisper 等後端套件。

### 2. 建立環境變數

```bash
cp .env.example .env
```

接著依照要使用的 provider 修改 `.env`：

- 使用 OpenAI：設定 `LLM_PROVIDER=openai`、`OPENAI_API_KEY`、`OPENAI_MODEL`
- 使用 Ollama：設定 `LLM_PROVIDER=ollama`、`OLLAMA_BASE_URL`、`OLLAMA_MODEL`

### 3. 安裝前端依賴

```bash
cd frontend
npm install
```

目前 `frontend/node_modules` 已存在；若換到新環境，仍建議重新執行 `npm install`。

### 4. LLM 選擇

後端會依照 `.env` 的 `LLM_PROVIDER` 決定使用哪一種模型來源。

#### OpenAI

```env
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4.1-mini
```

使用 OpenAI 時，`OPENAI_API_KEY` 必填。可以放在本機 `.env`，也可以在啟動前用 `export OPENAI_API_KEY=...` 設定

#### Ollama / Local model

```env
LLM_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11435/v1
OLLAMA_API_KEY=ollama
OLLAMA_MODEL=qwen3.5:9b
```

使用 Ollama 前，請先確認 Ollama server 已啟動，且指定的模型已存在。例如：

```bash
ollama list
```

如果 Ollama 使用預設 port `11434`，請把 `.env` 的 `OLLAMA_BASE_URL` 改成：

```env
OLLAMA_BASE_URL=http://localhost:11434/v1
```

修改 `.env` 後需要重新啟動後端，新的 provider 設定才會生效。

## 開發啟動

### 啟動後端

在專案根目錄執行：

```bash
uv run uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

後端預設服務位置：

```text
http://localhost:8000
```

### 啟動前端

另開一個終端機：

```bash
cd frontend
npm run dev
```

前端預設服務位置：

```text
http://localhost:5173
```

後端 CORS 目前允許 `http://localhost:5173`，如果前端改用其他 port，需要同步調整 `backend/main.py` 的 `allow_origins`。


## 環境變數

### LLM 設定

| 變數 | 預設值 | 說明 |
| --- | --- | --- |
| `LLM_PROVIDER` | `openai` | 可選 `openai` 或 `ollama` |
| `OPENAI_API_KEY` | 無 | 使用 OpenAI provider 時需要設定 |
| `OPENAI_MODEL` | `gpt-4.1-mini` | OpenAI provider 使用的模型名稱 |
| `OLLAMA_BASE_URL` | `http://localhost:11435/v1` | Ollama / OpenAI-compatible local endpoint |
| `OLLAMA_API_KEY` | `ollama` | Ollama 相容 API key，通常可用固定字串 |
| `OLLAMA_MODEL` | `qwen3.5:9b` | Ollama provider 使用的模型名稱 |

OpenAI 範例：

```env
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4.1-mini
```

Ollama 範例：

```env
LLM_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11435/v1
OLLAMA_API_KEY=ollama
OLLAMA_MODEL=qwen3.5:9b
```

### 語音辨識設定

`backend/voice.py` 支援以下環境變數：

| 變數 | 預設值 | 說明 |
| --- | --- | --- |
| `VOICE_DEVICE` | 自動偵測 | 可指定 `cuda` 或 `cpu` |
| `VOICE_MODEL_SIZE` | `large-v3-turbo` | faster-whisper 模型大小 |
| `VOICE_COMPUTE_TYPE` | `int8` | 推論計算型別 |

前端設定中的語言切換會同步影響語音辨識語言：中文介面使用 `zh`，English
介面使用 `en`。後端會透過 `/api/voice/transcribe` 的 `language` 表單欄位接收
目前語言，再轉成 faster-whisper 的語言代碼。

若機器有 CUDA，程式會優先使用 GPU；否則回退到 CPU。若機器有 NVIDIA GPU 但
CUDA / cuDNN 尚未正確安裝，初始化語音模型時可能會失敗。此時可先改用：

```env
VOICE_DEVICE=cpu
VOICE_COMPUTE_TYPE=int8
```


## 目前注意事項

- 對話與腳本內容目前只存在前端記憶體，重新整理頁面後會消失。
- `Workspace` 中的 `State`、`Documents` 目前是 placeholder。
- `Execute` 按鈕目前尚未接上後端執行 API。
