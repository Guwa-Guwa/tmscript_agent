import { useState } from 'react';
import type { ChatMessage, Conversation, Language, ValidationStatus } from '../types';
import ChatPanel from './ChatPanel';
import Sidebar from './Sidebar';
import Workspace from './Workspace';

interface AppLayoutProps {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: ChatMessage[];
  draft: string;
  scriptCode: string;
  validationStatus: ValidationStatus;
  onSelectConversation: (conversationId: string) => void;
  onCreateConversation: () => void;
  onDraftChange: (draft: string) => void;
  onScriptCodeChange: (code: string) => void;
  onSendMessage: () => void;
  onRenameConversation: (title: string) => void;
  onDeleteConversation: () => void;
  onVoiceInput: () => void;
  isVoiceInputActive: boolean;
  language: Language;
  onLanguageChange: (language: Language) => void;
}

function AppLayout({
  conversations,
  activeConversation,
  messages,
  draft,
  scriptCode,
  validationStatus,
  onSelectConversation,
  onCreateConversation,
  onDraftChange,
  onScriptCodeChange,
  onSendMessage,
  onRenameConversation,
  onDeleteConversation,
  onVoiceInput,
  isVoiceInputActive,
  language,
  onLanguageChange,
}: AppLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <main
      className={[
        'grid h-screen min-h-0 gap-3 bg-white p-2 text-slate-950 transition-[grid-template-columns] duration-200',
        isSidebarCollapsed
          ? 'grid-cols-[72px_minmax(360px,0.6fr)_minmax(520px,0.5fr)]'
          : 'grid-cols-[300px_minmax(360px,0.6fr)_minmax(520px,0.5fr)]',
      ].join(' ')}
    >
      <Sidebar
        conversations={conversations}
        activeConversationId={activeConversation?.id ?? null}
        onSelectConversation={onSelectConversation}
        onCreateConversation={onCreateConversation}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((isCollapsed) => !isCollapsed)}
        language={language}
        onLanguageChange={onLanguageChange}
      />
      <ChatPanel
        conversation={activeConversation}
        messages={messages}
        draft={draft}
        onDraftChange={onDraftChange}
        onSendMessage={onSendMessage}
        onRenameConversation={onRenameConversation}
        onDeleteConversation={onDeleteConversation}
        onVoiceInput={onVoiceInput}
        isVoiceInputActive={isVoiceInputActive}
        language={language}
      />
      <Workspace
        scriptCode={scriptCode}
        validationStatus={validationStatus}
        onScriptCodeChange={onScriptCodeChange}
        language={language}
      />
    </main>
  );
}

export default AppLayout;
