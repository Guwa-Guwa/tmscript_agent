import { useEffect, useRef, useState } from 'react';
import { Bot, Check, Mic, MoreHorizontal, Pencil, Send, Trash2, X } from 'lucide-react';
import type { ChatMessage, Conversation, Language } from '../types';

interface ChatPanelProps {
  conversation: Conversation | null;
  messages: ChatMessage[];
  draft: string;
  onDraftChange: (draft: string) => void;
  onSendMessage: () => void;
  onRenameConversation: (title: string) => void;
  onDeleteConversation: () => void;
  onVoiceInput?: () => void;
  isVoiceInputActive?: boolean;
  language: Language;
}

const chatCopy = {
  'zh-TW': {
    cancel: '取消',
    cancelRename: '取消重新命名',
    conversationPrefix: '對話：',
    delete: '刪除',
    inputPlaceholder: '輸入訊息...',
    moreActions: '更多對話操作',
    rename: '重新命名',
    saveName: '儲存名稱',
    selectOrCreateConversation: '選擇或建立新對話',
    sendMessage: '送出訊息',
    titleInput: '對話標題',
    voiceInput: '語音輸入',
  },
  'en-US': {
    cancel: 'Cancel',
    cancelRename: 'Cancel rename',
    conversationPrefix: 'Chat:',
    delete: 'Delete',
    inputPlaceholder: 'Type a message...',
    moreActions: 'More chat actions',
    rename: 'Rename',
    saveName: 'Save name',
    selectOrCreateConversation: 'Select or create a chat',
    sendMessage: 'Send message',
    titleInput: 'Conversation title',
    voiceInput: 'Voice input',
  },
} satisfies Record<Language, Record<string, string>>;

function ChatPanel({
  conversation,
  messages,
  draft,
  onDraftChange,
  onSendMessage,
  onRenameConversation,
  onDeleteConversation,
  onVoiceInput,
  isVoiceInputActive = false,
  language,
}: ChatPanelProps) {
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameDraft, setRenameDraft] = useState('');
  const renameInputRef = useRef<HTMLInputElement | null>(null);
  const copy = chatCopy[language];

  useEffect(() => {
    setIsActionMenuOpen(false);
    setIsRenaming(false);
    setRenameDraft(conversation?.title ?? '');
  }, [conversation?.id]);

  useEffect(() => {
    if (isRenaming) {
      renameInputRef.current?.focus();
      renameInputRef.current?.select();
    }
  }, [isRenaming]);

  if (!conversation) {
    return (
      <section className="grid h-full min-h-0 place-items-center rounded-md border border-slate-300 bg-white shadow-panel">
        <p className="text-base font-medium text-slate-500">{copy.selectOrCreateConversation}</p>
      </section>
    );
  }

  const handleDeleteConversation = () => {
    setIsActionMenuOpen(false);
    onDeleteConversation();
  };

  const handleStartRename = () => {
    setRenameDraft(conversation.title);
    setIsActionMenuOpen(false);
    setIsRenaming(true);
  };

  const handleSaveRename = () => {
    const nextTitle = renameDraft.trim();

    if (nextTitle) {
      onRenameConversation(nextTitle);
    } else {
      setRenameDraft(conversation.title);
    }

    setIsRenaming(false);
  };

  const handleCancelRename = () => {
    setRenameDraft(conversation.title);
    setIsRenaming(false);
  };

  return (
    <section className="flex h-full min-h-0 flex-col rounded-md border border-slate-300 bg-white shadow-panel">
      <header className="flex h-[74px] items-center border-b border-slate-200 px-6">
        {isRenaming ? (
          <form className="mr-4 flex min-w-0 flex-1 items-center gap-2" onSubmit={(event) => {
            event.preventDefault();
            handleSaveRename();
          }}>
            <span className="shrink-0 text-xl font-semibold">{copy.conversationPrefix}</span>
            <input
              ref={renameInputRef}
              value={renameDraft}
              onChange={(event) => setRenameDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  handleCancelRename();
                }
              }}
              className="min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-2 text-xl font-semibold outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-100"
              aria-label={copy.titleInput}
            />
            <button
              className="grid h-9 w-9 shrink-0 place-items-center rounded-md text-primary-700 hover:bg-primary-50"
              type="submit"
              aria-label={copy.saveName}
              title={copy.saveName}
            >
              <Check size={20} />
            </button>
            <button
              className="grid h-9 w-9 shrink-0 place-items-center rounded-md text-slate-600 hover:bg-slate-100"
              type="button"
              aria-label={copy.cancelRename}
              title={copy.cancel}
              onClick={handleCancelRename}
            >
              <X size={20} />
            </button>
          </form>
        ) : (
          <h2 className="min-w-0 flex-1 truncate text-xl font-semibold">
            {copy.conversationPrefix}
            <span className="ml-2">{conversation.title}</span>
          </h2>
        )}
        <div className="relative">
          <button
            className="rounded-md p-2 hover:bg-slate-100"
            type="button"
            aria-label={copy.moreActions}
            aria-expanded={isActionMenuOpen}
            onClick={() => setIsActionMenuOpen((isOpen) => !isOpen)}
          >
            <MoreHorizontal size={24} />
          </button>
          {isActionMenuOpen ? (
            <div className="absolute right-0 top-11 z-10 w-36 rounded-md border border-slate-200 bg-white py-1 shadow-panel">
              <button
                className="flex h-10 w-full items-center gap-2 px-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
                type="button"
                onClick={handleStartRename}
              >
                <Pencil size={16} />
                {copy.rename}
              </button>
              <button
                className="flex h-10 w-full items-center gap-2 px-3 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                type="button"
                onClick={handleDeleteConversation}
              >
                <Trash2 size={16} />
                {copy.delete}
              </button>
            </div>
          ) : null}
        </div>
      </header>

      <div className="scrollbar-soft min-h-0 flex-1 overflow-y-auto px-5 py-8">
        {messages.map((message) =>
          message.role === 'user' ? (
            <div key={message.id} className="mb-10 flex justify-end">
              <div className="max-w-[72%]">
                <div className="mb-2 text-right text-sm text-slate-700">{message.time}</div>
                <div className="rounded-md border border-slate-300 bg-white px-5 py-4 text-base leading-7 shadow-sm">
                  {message.content}
                </div>
              </div>
            </div>
          ) : (
            <div
              key={message.id}
              className={[
                'mb-6 flex gap-4',
                message.isThinking ? 'items-center' : 'items-start',
              ].join(' ')}
            >
              <div
                className={[
                  'grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary-600 text-white',
                  message.isThinking ? '' : 'mt-6',
                ].join(' ')}
              >
                <Bot size={22} />
              </div>
              <div className="max-w-[72%]">
                {message.time ? (
                  <div className="mb-2 text-sm text-slate-700">{message.time}</div>
                ) : null}
                <div
                  className={[
                    'rounded-md border px-5 py-4 text-base leading-7 shadow-sm',
                    message.isThinking
                      ? 'border-slate-200 bg-slate-50 text-slate-400'
                      : 'border-slate-300 bg-white text-slate-900',
                  ].join(' ')}
                >
                  {message.content}
                </div>
              </div>
            </div>
          ),
        )}
      </div>

      <footer className="p-4">
        <div className="flex h-[56px] items-center gap-4 rounded-md border border-slate-300 bg-white px-4">
          <textarea
            value={draft}
            onChange={(event) => onDraftChange(event.target.value)}
            placeholder={copy.inputPlaceholder}
            className="h-6 flex-1 resize-none border-0 bg-transparent text-base leading-6 outline-none placeholder:text-slate-400"
          />
          <button
            className={[
              'grid h-10 w-10 place-items-center rounded-md border transition-colors',
              isVoiceInputActive
                ? 'border-primary-600 bg-primary-50 text-primary-600'
                : 'border-slate-300 text-slate-600 hover:border-primary-600 hover:bg-primary-50 hover:text-primary-600',
            ].join(' ')}
            type="button"
            aria-label={copy.voiceInput}
            aria-pressed={isVoiceInputActive}
            title={copy.voiceInput}
            onClick={onVoiceInput}
          >
            <Mic size={20} />
          </button>
          <button
            className="grid h-10 w-10 place-items-center rounded-md bg-primary-600 text-white hover:bg-primary-700"
            type="button"
            aria-label={copy.sendMessage}
            onClick={onSendMessage}
          >
            <Send size={20} fill="currentColor" />
          </button>
        </div>
      </footer>
    </section>
  );
}

export default ChatPanel;
