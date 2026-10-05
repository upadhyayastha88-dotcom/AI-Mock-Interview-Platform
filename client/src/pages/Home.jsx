import React, { useEffect, useState } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Mic, Code, Award, Zap, Brain, CheckCircle2, PlayCircle, BarChart3 } from 'lucide-react';
import { api } from '../services/api';

export default function Home({ onStartInterview, onViewHistory }) {
  const [stats, setStats] = useState({ total: 0, avgScore: 0, latestRole: '' });

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await api.getAllInterviews();
        if (res.interviews && res.interviews.length > 0) {
          const completed = res.interviews.filter((i) => i.status === 'completed');
          const avg = completed.length
            ? Math.round(
                completed.reduce((acc, curr) => acc + (curr.overallFeedback?.overallScore || 0), 0) /
                  completed.length
              )
            : 0;
          setStats({
            total: completed.length,
            avgScore: avg,
            latestRole: res.interviews[0]?.role || 'Full Stack Developer'
          });
        }
      } catch (err) {
        console.warn('Could not load history stats:', err.message);
      }
    }
    loadStats();
  }, []);

  const roles = [
    { title: 'Frontend Developer', icon: '💻', stack: 'React, TypeScript, CSS, Performance' },
    { title: 'Backend Developer', icon: '⚙️', stack: 'Node.js, Express, Microservices, DB' },
    { title: 'Full Stack Engineer', icon: '🚀', stack: 'MERN Stack, System Design, Cloud' },
    { title: 'Behavioral & Leadership', icon: '🤝', stack: 'STAR Method, Conflict, Culture Fit' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Hero Section */}
      <section className="relative text-center pt-8 pb-12 overflow-hidden">
        {/* Glowing background gradient spheres */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-teal-500/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/25 text-teal-400 text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5" /> Next-Gen AI Technical Interview Simulator
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-tight">
          Ace Your Next Tech Interview with Real-Time <span className="bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-300 bg-clip-text text-transparent">AI Mock Practice</span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
          Simulate realistic video & voice interviews with dynamic follow-up probing, integrated live code workspace, and instant granular feedback powered by Google Gemini & MERN.
        </p>

        {/* Call to action buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => onStartInterview()}
            className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-teal-500 via-teal-600 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 shadow-xl shadow-teal-500/25 transition-all hover:scale-105 active:scale-95 text-sm sm:text-base"
          >
            Start Free Mock Interview <ArrowRight className="w-4 h-4" />
          </button>
          
          <button
            onClick={onViewHistory}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-slate-300 hover:text-white bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 transition-all text-sm sm:text-base"
          >
            <BarChart3 className="w-4 h-4 text-teal-400" /> View Analytics ({stats.total} Completed)
          </button>
        </div>

        {/* Quick Highlights / Trust Badges */}
        <div className="mt-12 flex flex-wrap justify-center items-center gap-6 sm:gap-10 text-xs font-medium text-slate-400">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-400" /> Real-Time Voice Synthesis & STT
          </span>
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-400" /> Interactive Live Coding Workspace
          </span>
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-400" /> Granular Scoring & Model Answers
          </span>
        </div>
      </section>

      {/* Featured Role Templates */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Popular Interview Tracks</h2>
            <p className="text-xs sm:text-sm text-slate-400">Select a specialized track or tailor one to your dream job description</p>
          </div>
          <button
            onClick={() => onStartInterview()}
            className="text-xs font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1"
          >
            Custom Track <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {roles.map((r, i) => (
            <div
              key={i}
              onClick={() => onStartInterview(r.title)}
              className="glass-card hover:border-teal-500/50 p-5 rounded-2xl cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-teal-500/10 group"
            >
              <div className="text-3xl mb-3">{r.icon}</div>
              <h3 className="font-bold text-white text-base group-hover:text-teal-400 transition-colors">
                {r.title}
              </h3>
              <p className="text-xs text-slate-400 mt-2 line-clamp-2">{r.stack}</p>
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-teal-400">
                Launch Track <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="glass-panel p-6 rounded-2xl space-y-3">
          <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center">
            <Mic className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Voice & Video Simulation</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Experience the pressure of an actual video interview with live webcam preview, voice question readout, and continuous speech-to-text transcription.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl space-y-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Code className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Integrated Code Sandbox</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Tackle algorithmic and practical programming questions directly in the browser with syntax simulation, tab indentation, and multiple languages.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl space-y-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Comprehensive Scorecard</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Receive in-depth feedback on technical accuracy, communication clarity, problem-solving mindset, and complete model answers to study.
          </p>
        </div>
      </section>
    </div>
  );
}
