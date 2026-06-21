import { useEffect, useRef, useState } from 'react';
import { Check, ChevronsLeft, ChevronsRight, Languages, Plus, Settings } from 'lucide-react';
import type { Conversation, Language } from '../types';

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  onCreateConversation: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  language: Language;
  onLanguageChange: (language: Language) => void;
}

const sidebarCopy = {
  'zh-TW': {
    collapseSidebar: '收合側邊欄',
    conversationList: '對話列表',
    expandSidebar: '展開側邊欄',
    languages: [
      { value: 'zh-TW', label: '中文' },
      { value: 'en-US', label: 'English' },
    ],
    languageSwitch: '語言切換',
    newConversation: '新對話',
    settings: '設定',
  },
  'en-US': {
    collapseSidebar: 'Collapse sidebar',
    conversationList: 'Conversations',
    expandSidebar: 'Expand sidebar',
    languages: [
      { value: 'zh-TW', label: '中文' },
      { value: 'en-US', label: 'English' },
    ],
    languageSwitch: 'Language',
    newConversation: 'New chat',
    settings: 'Settings',
  },
} satisfies Record<Language, {
  collapseSidebar: string;
  conversationList: string;
  expandSidebar: string;
  languages: Array<{ value: Language; label: string }>;
  languageSwitch: string;
  newConversation: string;
  settings: string;
}>;

function Sidebar({
  conversations,
  activeConversationId,
  onSelectConversation,
  onCreateConversation,
  isCollapsed,
  onToggleCollapse,
  language,
  onLanguageChange,
}: SidebarProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement | null>(null);
  const copy = sidebarCopy[language];

  useEffect(() => {
    if (!isSettingsOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!settingsRef.current?.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSettingsOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSettingsOpen]);

  if (isCollapsed) {
    return (
      <aside className="flex h-full min-h-0 flex-col items-center rounded-md border border-slate-300 bg-white py-5 shadow-panel">
        <div className="grid h-11 w-11 place-items-center rounded-md bg-primary-600 text-xl font-semibold text-white">
          TM
        </div>
        <button
          className="mt-4 rounded-md p-1.5 text-slate-700 hover:bg-slate-100"
          type="button"
          aria-label={copy.expandSidebar}
          onClick={onToggleCollapse}
        >
          <ChevronsRight size={20} />
        </button>
      </aside>
    );
  }

  return (
    <aside className="flex h-full min-h-0 flex-col overflow-hidden rounded-md border border-slate-300 bg-white shadow-panel">
      <header className="flex items-center gap-3 px-4 py-5">
        <div className="grid h-11 w-11 place-items-center rounded-md bg-primary-600 text-xl font-semibold text-white">
          TM
        </div>
        <h1 className="min-w-0 flex-1 text-lg font-semibold">TMScript Agent</h1>
        <button
          className="rounded-md p-1.5 text-slate-700 hover:bg-slate-100"
          type="button"
          aria-label={copy.collapseSidebar}
          onClick={onToggleCollapse}
        >
          <ChevronsLeft size={20} />
        </button>
      </header>

      <div className="px-4">
        <button
          className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-primary-600 text-base font-medium text-white shadow-sm hover:bg-primary-700"
          type="button"
          onClick={onCreateConversation}
        >
          <Plus size={19} />
          {copy.newConversation}
        </button>
      </div>

      <section className="mt-7 flex min-h-0 flex-1 flex-col px-4">
        <p className="mb-4 shrink-0 text-sm font-medium text-slate-900">{copy.conversationList}</p>
        <div className="scrollbar-soft min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
          {conversations.map((conversation) => {
            const isActive = conversation.id === activeConversationId;

            return (
              <button
                key={conversation.id}
                onClick={() => onSelectConversation(conversation.id)}
                className={[
                  'flex w-full items-center gap-4 rounded-md border px-4 py-3 text-left transition',
                  isActive
                    ? 'border-slate-300 border-l-4 border-l-primary-600 bg-primary-50'
                    : 'border-slate-300 bg-white hover:bg-slate-50',
                ].join(' ')}
              >
                <span className="min-w-0">
                  <span className="block truncate text-base font-semibold text-slate-950">{conversation.title}</span>
                  <span className="mt-1 block text-sm text-slate-500">{conversation.updatedAt}</span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <div className="relative p-4" ref={settingsRef}>
        {isSettingsOpen ? (
          <div className="absolute inset-x-4 bottom-full z-10 mb-2 rounded-md border border-slate-300 bg-white p-3 shadow-panel">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Languages size={17} />
              {copy.languageSwitch}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {copy.languages.map((languageOption) => {
                const isSelected = language === languageOption.value;

                return (
                  <button
                    key={languageOption.value}
                    type="button"
                    className={[
                      'flex h-10 items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium transition',
                      isSelected
                        ? 'border-primary-600 bg-primary-50 text-primary-700'
                        : 'border-slate-300 text-slate-700 hover:bg-slate-50',
                    ].join(' ')}
                    onClick={() => onLanguageChange(languageOption.value)}
                  >
                    {isSelected ? <Check size={15} /> : null}
                    {languageOption.label}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
        <button
          className="flex h-[56px] w-full items-center gap-3 rounded-md border border-slate-300 px-4 font-medium text-slate-900 hover:bg-slate-50"
          type="button"
          aria-expanded={isSettingsOpen}
          aria-haspopup="menu"
          onClick={() => setIsSettingsOpen((isOpen) => !isOpen)}
        >
          <Settings size={18} />
          {copy.settings}
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
