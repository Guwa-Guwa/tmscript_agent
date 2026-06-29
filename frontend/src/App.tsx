import { useRef, useState } from 'react';
import AppLayout from './components/AppLayout';
import type { ChatMessage, Conversation, Language, ValidationStatus } from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

const initialConversations: Conversation[] = [];

interface ChatState {
  messages: ChatMessage[];
  draft: string;
  scriptCode: string;
}

interface ApiErrorResponse {
  detail?: string;
}

const defaultScriptCode = '';

const initialChatStates: Record<string, ChatState> = {};

const emptyChatState: ChatState = {
  messages: [],
  draft: '',
  scriptCode: defaultScriptCode,
};

const appCopy = {
  'zh-TW': {
    conversationDefaultTitle: '未命名的對話',
    fetchReplyError: '回覆失敗，請稍後再試。',
    justNow: '剛剛',
    recorderError: '錄音失敗',
    thinking: 'Thinking...',
    unsupportedVoiceInput: '此瀏覽器不支援語音錄音',
  },
  'en-US': {
    conversationDefaultTitle: 'Untitled chat',
    fetchReplyError: 'Reply failed. Please try again later.',
    justNow: 'Just now',
    recorderError: 'Recording failed',
    thinking: 'Thinking...',
    unsupportedVoiceInput: 'This browser does not support voice recording.',
  },
} satisfies Record<Language, Record<string, string>>;

const readApiErrorMessage = async (response: Response) => {
  try {
    const data = (await response.json()) as ApiErrorResponse;
    return data.detail ?? response.statusText;
  } catch {
    return response.statusText;
  }
};

function App() {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [chatStates, setChatStates] = useState<Record<string, ChatState>>(initialChatStates);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [validationStatus] = useState<ValidationStatus>('passed');
  const [isVoiceInputActive, setIsVoiceInputActive] = useState(false);
  const [language, setLanguage] = useState<Language>('zh-TW');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const copy = appCopy[language];

  const activeConversation =
    conversations.find((conversation) => conversation.id === activeConversationId) ?? null;
  const activeChatState = activeConversation
    ? (chatStates[activeConversation.id] ?? emptyChatState)
    : emptyChatState;

  interface CreateSessionResponse {
    session_id: string;
    title: string;
    created_at: string;
    updated_at: string;
  }
  
  const handleCreateConversation = async () => {
    const response = await fetch(`${API_BASE_URL}/api/sessions`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(await readApiErrorMessage(response));
    }

    const data: CreateSessionResponse = await response.json();

    const conversation: Conversation = {
      id: data.session_id,
      title: data.title,
      updatedAt: copy.justNow,
      icon: 'check',
    };
    // add the new conversation to the top of the list
    setConversations((currentConversations) => [conversation, ...currentConversations]);
    // create a new chat state for the new conversation
    setChatStates((currentChatStates) => ({
      ...currentChatStates,
      [conversation.id]: { messages: [], draft: '', scriptCode: defaultScriptCode },
    }));
    setActiveConversationId(conversation.id);
  };

  const handleDraftChange = (draft: string) => {
    if (!activeConversation) {
      return;
    }

    setChatStates((currentChatStates) => ({
      ...currentChatStates,
      [activeConversation.id]: {
        ...(currentChatStates[activeConversation.id] ?? emptyChatState),
        draft,
      },
    }));
  };

  const handleScriptCodeChange = (scriptCode: string) => {
    if (!activeConversation) {
      return;
    }

    setChatStates((currentChatStates) => ({
      ...currentChatStates,
      [activeConversation.id]: {
        ...(currentChatStates[activeConversation.id] ?? emptyChatState),
        scriptCode,
      },
    }));
  };

  const handleSendMessage = async () => {
    if (!activeConversation) {
      return;
    }

    const content = activeChatState.draft.trim();

    if (!content) {
      return;
    }

    const now = new Date();
    const message: ChatMessage = {
      id: `${activeConversation.id}-${now.getTime()}`,
      role: 'user',
      content,
      time: now.toLocaleTimeString('zh-TW', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
    };
    const thinkingMessageId = `${activeConversation.id}-${now.getTime()}-thinking`;
    const thinkingMessage: ChatMessage = {
      id: thinkingMessageId,
      role: 'assistant',
      content: copy.thinking,
      time: '',
      isThinking: true,
    };

    setChatStates((currentChatStates) => ({
      ...currentChatStates,
      [activeConversation.id]: {
        ...(currentChatStates[activeConversation.id] ?? emptyChatState),
        messages: [
          ...(currentChatStates[activeConversation.id]?.messages ?? []),
          message,
          thinkingMessage,
        ],
        draft: '',
      },
    }));

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          session_id: activeConversation.id,
        }),
      });

      if (!response.ok) {
        throw new Error(await readApiErrorMessage(response));
      }

      const data: { reply: string } = await response.json();

      const reply: ChatMessage = {
        id: `${activeConversation.id}-${Date.now()}-assistant`,
        role: 'assistant',
        content: data.reply,
        time: new Date().toLocaleTimeString('zh-TW', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }),
      };

      setChatStates((currentChatStates) => {
        const currentState = currentChatStates[activeConversation.id] ?? emptyChatState;

        return {
          ...currentChatStates,
          [activeConversation.id]: {
            ...currentState,
            messages: currentState.messages.map((currentMessage) =>
              currentMessage.id === thinkingMessageId ? reply : currentMessage,
            ),
            draft: '',
          },
        };
      });
    } catch (error) {
      const errorReply: ChatMessage = {
        id: `${activeConversation.id}-${Date.now()}-assistant-error`,
        role: 'assistant',
        content: copy.fetchReplyError,
        time: new Date().toLocaleTimeString('zh-TW', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }),
      };

      setChatStates((currentChatStates) => {
        const currentState = currentChatStates[activeConversation.id] ?? emptyChatState;

        return {
          ...currentChatStates,
          [activeConversation.id]: {
            ...currentState,
            messages: currentState.messages.map((currentMessage) =>
              currentMessage.id === thinkingMessageId ? errorReply : currentMessage,
            ),
            draft: '',
          },
        };
      });
    }
  };

  const stopVoiceStream = () => {
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
  };

  const resetVoiceCapture = () => {
    setIsVoiceInputActive(false);
    mediaRecorderRef.current = null;
    audioChunksRef.current = [];
    stopVoiceStream();
  };

  const getAudioMimeType = () => {
    const preferredTypes = ['audio/webm;codecs=opus', 'audio/webm'];

    return preferredTypes.find((mimeType) => MediaRecorder.isTypeSupported(mimeType)) ?? '';
  };

  const handleVoiceInput = async () => {
    if (!activeConversation) {
      return;
    }

    if (isVoiceInputActive) {
      const recorder = mediaRecorderRef.current;

      if (recorder && recorder.state !== 'inactive') {
        recorder.stop();
      } else {
        resetVoiceCapture();
      }

      return;
    }

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      console.error(copy.unsupportedVoiceInput);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getAudioMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      const conversationId = activeConversation.id;

      audioChunksRef.current = [];
      mediaStreamRef.current = stream;
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const audioChunks = audioChunksRef.current;
        const audioBlob = new Blob(audioChunks, { type: recorder.mimeType || 'audio/webm' });

        resetVoiceCapture();

        if (audioBlob.size === 0) {
          return;
        }

        const formData = new FormData();
        formData.append('audio', audioBlob, 'voice.webm');
        formData.append('language', language);

        try {
          const response = await fetch(`${API_BASE_URL}/api/voice/transcribe`, {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            throw new Error(await readApiErrorMessage(response));
          }

          const data: { text: string } = await response.json();
          const text = data.text.trim();

          if (!text) {
            return;
          }

          setChatStates((currentChatStates) => {
            const currentState = currentChatStates[conversationId] ?? emptyChatState;
            const currentDraft = currentState.draft.trim();

            return {
              ...currentChatStates,
              [conversationId]: {
                ...currentState,
                draft: currentDraft ? `${currentDraft} ${text}` : text,
              },
            };
          });
        } catch (error) {
          console.error(error);
        }
      };

      recorder.onerror = (event) => {
        console.error(copy.recorderError, event);
        resetVoiceCapture();
      };

      recorder.start();
      setIsVoiceInputActive(true);
    } catch (error) {
      console.error(error);
      resetVoiceCapture();
    }
  };

  const handleDeleteConversation = () => {
    if (!activeConversation) {
      return;
    }

    const conversationId = activeConversation.id;

    setConversations((currentConversations) =>
      currentConversations.filter((conversation) => conversation.id !== conversationId),
    );
    setChatStates((currentChatStates) => {
      const nextChatStates = { ...currentChatStates };
      delete nextChatStates[conversationId];
      return nextChatStates;
    });
    setActiveConversationId(null);
  };

  const handleRenameConversation = (title: string) => {
    if (!activeConversation) {
      return;
    }

    const conversationId = activeConversation.id;

    setConversations((currentConversations) =>
      currentConversations.map((conversation) =>
        conversation.id === conversationId ? { ...conversation, title } : conversation,
      ),
    );
  };

  return (
    <AppLayout
      conversations={conversations}
      activeConversation={activeConversation}
      messages={activeChatState.messages}
      draft={activeChatState.draft}
      scriptCode={activeChatState.scriptCode}
      validationStatus={validationStatus}
      onSelectConversation={setActiveConversationId}
      onCreateConversation={handleCreateConversation}
      onDraftChange={handleDraftChange}
      onScriptCodeChange={handleScriptCodeChange}
      onSendMessage={handleSendMessage}
      onRenameConversation={handleRenameConversation}
      onDeleteConversation={handleDeleteConversation}
      onVoiceInput={handleVoiceInput}
      isVoiceInputActive={isVoiceInputActive}
      language={language}
      onLanguageChange={setLanguage}
    />
  );
}

export default App;
