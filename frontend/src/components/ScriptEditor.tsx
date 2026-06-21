interface ScriptEditorProps {
  code: string;
  onCodeChange: (code: string) => void;
  placeholder: string;
  ariaLabel: string;
}

function ScriptEditor({ code, onCodeChange, placeholder, ariaLabel }: ScriptEditorProps) {
  const lineCount = Math.max(code.split('\n').length, 1);

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden font-mono text-[15px] leading-7">
      <div className="w-[64px] shrink-0 select-none overflow-hidden border-r border-slate-200 bg-slate-50 px-3 py-4 text-right text-slate-400">
        {Array.from({ length: lineCount }, (_, index) => (
          <div key={index} className="h-7">
            {index + 1}
          </div>
        ))}
      </div>
      <textarea
        value={code}
        onChange={(event) => onCodeChange(event.target.value)}
        className="min-h-full flex-1 resize-none overflow-auto border-0 bg-white px-5 py-4 font-mono text-[15px] leading-7 text-slate-950 outline-none placeholder:text-slate-400"
        placeholder={placeholder}
        spellCheck={false}
        aria-label={ariaLabel}
      />
    </div>
  );
}

export default ScriptEditor;
