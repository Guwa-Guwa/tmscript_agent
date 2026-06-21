export interface Conversation {
  id: string;
  title: string;
  updatedAt: string;
  icon: 'check' | 'triangle';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  time: string;
  isThinking?: boolean;
}

export interface ToolStatus {
  id: string;
  tool: string;
  status: 'completed' | 'passed' | 'failed' | 'running';
  icon: 'search' | 'shield';
}

export type ValidationStatus = 'passed' | 'failed' | 'pending';

export type Language = 'zh-TW' | 'en-US';
