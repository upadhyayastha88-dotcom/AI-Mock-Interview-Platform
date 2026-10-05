import React, { useState, useEffect } from 'react';
import { Key, Sparkles, Check, X, ShieldCheck, Cpu } from 'lucide-react';

export default function ApiKeyModal({ isOpen, onClose }) {
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const existing = localStorage.getItem('preppulse_gemini_key') || '';
    setApiKey(existing);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    if (apiKey.trim()) {
      localStorage.setItem('preppulse_gemini_key', apiKey.trim());
    } else {
      localStorage.removeItem('preppulse_gemini_key');
    }
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1000);
  };

  const handleUseMock = () => {
    localStorage.removeItem('preppulse_gemini_key');
    setApiKey('');
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md p-6 bg-[#0f172a] border border-slate-700/80 rounded-2xl shadow-2xl glow-teal text-slate-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-teal-500/10 text-teal-400 border border-teal-500/20 rounded-xl">
            <Key className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">AI Engine Settings</h3>
            <p className="text-xs text-slate-400">Configure Google Gemini or Simulated AI</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Google Gemini API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-4 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            />
            <p className="mt-1.5 text-xs text-slate-400">
              Get a free API key at{' '}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-teal-400 hover:underline"
              >
                Google AI Studio
              </a>
              . Stored locally in your browser.
            </p>
          </div>

          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl flex items-start gap-3">
            <Cpu className="w-5 h-5 text-teal-400 mt-0.5 shrink-0" />
            <div className="text-xs text-slate-300">
              <span className="font-semibold text-white">Zero-Config Mode:</span> If you leave this empty, the platform automatically uses our built-in Smart Simulation Engine with rich questions and realistic scoring!
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={handleUseMock}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all"
            >
              Use Built-in AI Simulation
            </button>

            <button
              type="submit"
              className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-500 rounded-xl shadow-lg shadow-teal-500/20 transition-all"
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4 text-white" /> Saved
                </>
              ) : (
                'Save Settings'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
