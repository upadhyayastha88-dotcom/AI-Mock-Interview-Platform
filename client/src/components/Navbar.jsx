import React, { useState, useEffect } from 'react';
import { Mic, Sparkles, History as HistoryIcon, PlusCircle, Settings, ShieldCheck, Terminal } from 'lucide-react';
import ApiKeyModal from './ApiKeyModal';

export default function Navbar({ currentView, setCurrentView }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    const key = localStorage.getItem('preppulse_gemini_key');
    setHasApiKey(Boolean(key));
  }, [isModalOpen]);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#090d16]/85 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div 
            onClick={() => setCurrentView('home')} 
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 via-teal-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
                PrepPulse <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-teal-500/10 text-teal-400 border border-teal-500/20">AI</span>
              </span>
              <p className="text-[10px] text-slate-400 font-medium">MERN Interview Simulator</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800/60">
            <button
              onClick={() => setCurrentView('home')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentView === 'home'
                  ? 'bg-teal-600 text-white shadow'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setCurrentView('setup')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentView === 'setup'
                  ? 'bg-teal-600 text-white shadow'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" /> Start Interview
            </button>
            <button
              onClick={() => setCurrentView('history')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentView === 'history'
                  ? 'bg-teal-600 text-white shadow'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <HistoryIcon className="w-3.5 h-3.5" /> Past Sessions
            </button>
          </nav>

          {/* AI Mode badge & Settings */}
          <div className="flex items-center gap-3">
            <div 
              onClick={() => setIsModalOpen(true)}
              className="cursor-pointer hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors"
              title="Click to configure AI Engine"
            >
              <span className={`w-2 h-2 rounded-full ${hasApiKey ? 'bg-teal-400 animate-pulse' : 'bg-emerald-400'}`}></span>
              <span className="text-slate-300">
                {hasApiKey ? 'Gemini Live' : 'Smart Simulation'}
              </span>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="p-2 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl transition-colors"
              title="AI Settings"
            >
              <Settings className="w-4 h-4" />
            </button>

            {currentView !== 'setup' && currentView !== 'active' && (
              <button
                onClick={() => setCurrentView('setup')}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 rounded-xl shadow-lg shadow-teal-500/20 transition-all hover:scale-[1.02]"
              >
                <Sparkles className="w-3.5 h-3.5" /> Practice Now
              </button>
            )}
          </div>
        </div>
      </header>

      <ApiKeyModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
