import { Activity, CheckCircle2, Code2, FileText, Maximize, MoreVertical } from 'lucide-react';
import { useState } from 'react';
import type { Language, ValidationStatus } from '../types';
import ScriptEditor from './ScriptEditor';

type WorkspaceTab = 'script' | 'state' | 'documents';

interface WorkspaceProps {
  scriptCode: string;
  validationStatus: ValidationStatus;
  onScriptCodeChange: (code: string) => void;
  language: Language;
}

const tabs: Array<{ id: WorkspaceTab; icon: typeof Code2 }> = [
  { id: 'script', icon: Code2 },
  { id: 'state', icon: Activity },
  { id: 'documents', icon: FileText },
];

const workspaceCopy = {
  'zh-TW': {
    documentsPreview: 'Documents 預覽區',
    execute: '執行',
    expandScriptEditor: '展開腳本編輯器',
    moreScriptActions: '更多腳本操作',
    moreWorkspaceActions: '更多工作區操作',
    scriptEditor: '腳本編輯器',
    scriptEditorAria: '腳本編輯器',
    scriptPlaceholder: '輸入 TMScript...',
    statePreview: 'State 預覽區',
    tabs: {
      documents: '文件',
      script: '腳本',
      state: '狀態',
    },
    validation: '驗證：',
    workspace: '工作區',
  },
  'en-US': {
    documentsPreview: 'Documents preview placeholder',
    execute: 'Execute',
    expandScriptEditor: 'Expand script editor',
    moreScriptActions: 'More script actions',
    moreWorkspaceActions: 'More workspace actions',
    scriptEditor: 'Script Editor',
    scriptEditorAria: 'Script editor',
    scriptPlaceholder: 'Enter TMScript...',
    statePreview: 'State preview placeholder',
    tabs: {
      documents: 'Documents',
      script: 'Script',
      state: 'State',
    },
    validation: 'Validation:',
    workspace: 'Workspace',
  },
} satisfies Record<Language, {
  documentsPreview: string;
  execute: string;
  expandScriptEditor: string;
  moreScriptActions: string;
  moreWorkspaceActions: string;
  scriptEditor: string;
  scriptEditorAria: string;
  scriptPlaceholder: string;
  statePreview: string;
  tabs: Record<WorkspaceTab, string>;
  validation: string;
  workspace: string;
}>;

function Workspace({ scriptCode, validationStatus, onScriptCodeChange, language }: WorkspaceProps) {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('script');
  const copy = workspaceCopy[language];

  return (
    <section className="flex h-full flex-col rounded-md border border-slate-300 bg-white shadow-panel">
      <header className="flex h-[74px] items-center border-b border-slate-200 px-6">
        <h2 className="flex-1 text-xl font-semibold">{copy.workspace}</h2>
        <button className="rounded-md p-2 hover:bg-slate-100" aria-label={copy.moreWorkspaceActions}>
          <MoreVertical size={22} />
        </button>
      </header>

      <nav className="flex h-14 items-end gap-8 border-b border-slate-200 px-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.id === activeTab;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={[
                'flex h-full items-center gap-2 border-b-2 px-2 text-sm font-medium transition',
                isActive
                  ? 'border-primary-600 text-slate-950'
                  : 'border-transparent text-slate-700 hover:text-slate-950',
              ].join(' ')}
            >
              <Icon size={18} />
              {copy.tabs[tab.id]}
            </button>
          );
        })}
      </nav>

      <div className="flex min-h-0 flex-1 flex-col p-4">
        {activeTab === 'script' && (
          <>
            <div className="flex min-h-0 flex-1 flex-col rounded-md border border-slate-300 bg-white">
              <div className="flex h-[58px] items-center border-b border-slate-200 px-5">
                <h3 className="flex-1 text-base font-semibold">{copy.scriptEditor}</h3>
                <button className="rounded-md p-2 hover:bg-slate-100" aria-label={copy.expandScriptEditor}>
                  <Maximize size={18} />
                </button>
                <button className="rounded-md p-2 hover:bg-slate-100" aria-label={copy.moreScriptActions}>
                  <MoreVertical size={20} />
                </button>
              </div>
              <ScriptEditor
                code={scriptCode}
                onCodeChange={onScriptCodeChange}
                placeholder={copy.scriptPlaceholder}
                ariaLabel={copy.scriptEditorAria}
              />
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="flex h-14 items-center gap-3 rounded-md border border-slate-300 px-5 text-base">
                <CheckCircle2 className="text-primary-600" size={28} fill="currentColor" strokeWidth={2.5} />
                <span>{copy.validation}</span>
                <span className="font-medium text-primary-600">{validationStatus}</span>
              </div>
              <button className="h-12 rounded-md bg-primary-600 px-8 text-base font-semibold text-white hover:bg-primary-700">
                {copy.execute}
              </button>
            </div>
          </>
        )}

        {activeTab === 'state' && (
          <div className="grid flex-1 place-items-center rounded-md border border-dashed border-slate-300 text-slate-500">
            {copy.statePreview}
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="grid flex-1 place-items-center rounded-md border border-dashed border-slate-300 text-slate-500">
            {copy.documentsPreview}
          </div>
        )}
      </div>
    </section>
  );
}

export default Workspace;
