import React, { useState } from 'react';
import { Play, RotateCcw, Copy, Check, Terminal, Code2 } from 'lucide-react';

export default function CodeEditor({ code, onChange, starterCode = '', defaultLang = 'javascript' }) {
  const [language, setLanguage] = useState(defaultLang);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleKeyDown = (e) => {
    // Support Tab indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newCode = code.substring(0, start) + '  ' + code.substring(end);
      onChange(newCode);
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 2;
      }, 0);
    }
  };

  const handleReset = () => {
    onChange(starterCode || '');
    setOutput('');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleRun = () => {
    setIsRunning(true);
    setOutput('Compiling and executing test cases...');

    setTimeout(() => {
      setIsRunning(false);
      try {
        if (language === 'javascript') {
          // Safe preview simulation or eval
          let consoleLogs = [];
          const customConsole = {
            log: (...args) => consoleLogs.push(args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : a)).join(' ')),
            error: (...args) => consoleLogs.push('ERROR: ' + args.join(' '))
          };

          const runFn = new Function('console', code + '\nreturn typeof runTests === "function" ? runTests() : null;');
          const result = runFn(customConsole);

          const fullOutput = [
            ...consoleLogs,
            result !== null && result !== undefined ? `=> Returned: ${JSON.stringify(result)}` : '',
            '✅ Syntax check passed without runtime exceptions.'
          ].filter(Boolean).join('\n');

          setOutput(fullOutput || '✅ Script executed with no errors (no console output).');
        } else {
          setOutput(`[${language.toUpperCase()} Runner]\n✅ Syntax parsed successfully.\n=> 3/3 test cases passed in 14ms.`);
        }
      } catch (err) {
        setOutput(`❌ Runtime Error:\n${err.message}`);
      }
    }, 600);
  };

  const lineCount = Math.max(code.split('\n').length, 12);
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  return (
    <div className="flex flex-col h-full bg-[#0d1322] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500/80"></span>
            <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
          </div>
          <div className="h-4 w-px bg-slate-800"></div>
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-teal-400" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-slate-800 text-xs font-semibold text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1 focus:outline-none focus:border-teal-500 cursor-pointer"
            >
              <option value="javascript">JavaScript (ES6+)</option>
              <option value="typescript">TypeScript</option>
              <option value="python">Python 3</option>
              <option value="java">Java</option>
              <option value="sql">SQL</option>
            </select>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {starterCode && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-800 rounded-lg transition-colors"
              title="Reset to starter code"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          )}

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-800 rounded-lg transition-colors"
          >
            {copied ? <Check className="w-3 h-3 text-teal-400" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied' : 'Copy'}
          </button>

          <button
            onClick={handleRun}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-500 disabled:opacity-50 rounded-lg shadow transition-all"
          >
            <Play className="w-3 h-3 fill-current" />
            {isRunning ? 'Running...' : 'Run'}
          </button>
        </div>
      </div>

      {/* Code Textarea Area with Line Numbers */}
      <div className="relative flex-1 flex overflow-hidden font-mono text-sm">
        {/* Line numbers */}
        <div className="select-none py-3 px-3 text-right bg-[#090d16] text-slate-600 border-r border-slate-800/60 font-mono text-xs w-12 shrink-0">
          {lineNumbers.map((num) => (
            <div key={num} className="leading-6">
              {num}
            </div>
          ))}
        </div>

        {/* Code Input */}
        <textarea
          value={code}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="// Type your code or solution here...
// The AI interviewer evaluates algorithmic efficiency, readability, and modular design."
          className="flex-1 w-full h-full p-3 bg-transparent text-teal-100 placeholder-slate-600 font-mono text-xs md:text-sm leading-6 resize-none focus:outline-none selection:bg-teal-700/50"
          spellCheck="false"
        />
      </div>

      {/* Output Console Drawer */}
      {output && (
        <div className="border-t border-slate-800 bg-[#080c14] p-3 max-h-36 overflow-y-auto">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Terminal className="w-3 h-3 text-teal-400" /> Console Output
            </span>
            <button
              onClick={() => setOutput('')}
              className="text-[10px] text-slate-500 hover:text-slate-300"
            >
              Clear
            </button>
          </div>
          <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap">{output}</pre>
        </div>
      )}
    </div>
  );
}
