import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Award, CheckCircle2, AlertTriangle, ArrowRight, Printer, RotateCcw, 
  ChevronDown, Code, MessageSquare, TrendingUp, Sparkles, BookOpen 
} from 'lucide-react';

export default function FeedbackReport({ interview, onRetake, onBackHome }) {
  const feedback = interview?.overallFeedback || {};
  const questions = interview?.questions || [];

  useEffect(() => {
    // Fire festive confetti on mounting the report
    try {
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {}
  }, []);

  const overallScore = feedback.overallScore || 80;

  const getVerdictStyle = (verdict = '') => {
    if (verdict.includes('Strong Hire')) {
      return 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300';
    }
    if (verdict.includes('Hire')) {
      return 'bg-teal-500/15 border-teal-500/30 text-teal-300';
    }
    if (verdict.includes('Leaning')) {
      return 'bg-amber-500/15 border-amber-500/30 text-amber-300';
    }
    return 'bg-rose-500/15 border-rose-500/30 text-rose-300';
  };

  const metrics = [
    { label: 'Technical Depth', value: feedback.technicalScore || overallScore + 2, color: 'bg-teal-500' },
    { label: 'Communication Clarity', value: feedback.communicationScore || overallScore - 2, color: 'bg-indigo-500' },
    { label: 'Problem Solving', value: feedback.problemSolvingScore || overallScore + 1, color: 'bg-cyan-500' },
    { label: 'Confidence & Delivery', value: feedback.confidenceScore || overallScore - 1, color: 'bg-emerald-500' }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 print:py-0 print:px-0">
      {/* Top Banner & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Performance Evaluation Report
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            {interview.role} Mock Interview
          </h1>
          <p className="text-xs text-slate-400">
            Level: {interview.level} • Format: {interview.type} • Duration: ~{interview.durationMinutes || 15} mins
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all"
          >
            <Printer className="w-3.5 h-3.5" /> Print / Save PDF
          </button>

          <button
            onClick={onRetake}
            className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 rounded-xl shadow-lg shadow-teal-500/20 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Practice Again
          </button>
        </div>
      </div>

      {/* Main Scorecard Hero Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Circular overall score badge (4 cols) */}
          <div className="md:col-span-4 flex flex-col items-center justify-center text-center p-6 bg-slate-900/80 rounded-2xl border border-slate-800">
            <div className="relative w-32 h-32 flex items-center justify-center rounded-full bg-gradient-to-tr from-teal-500/20 to-emerald-500/20 border-2 border-teal-500/40 glow-teal mb-3">
              <div className="text-center">
                <span className="text-4xl font-extrabold text-white">{overallScore}</span>
                <span className="text-xs text-slate-400 block font-semibold">/ 100</span>
              </div>
            </div>

            <div className={`px-3.5 py-1 rounded-full text-xs font-bold border ${getVerdictStyle(feedback.hiringVerdict)}`}>
              Verdict: {feedback.hiringVerdict || 'Hire'}
            </div>
          </div>

          {/* Metric breakdowns (8 cols) */}
          <div className="md:col-span-8 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              Competency Breakdown
            </h3>
            <div className="space-y-3">
              {metrics.map((m, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-300">{m.label}</span>
                    <span className="text-teal-300">{m.value}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${m.color} rounded-full transition-all duration-1000`}
                      style={{ width: `${m.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        {feedback.summary && (
          <div className="mt-6 pt-6 border-t border-slate-800/80">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Executive Evaluation Summary
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {feedback.summary}
            </p>
          </div>
        )}
      </div>

      {/* Strengths & Improvements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <CheckCircle2 className="w-4 h-4" /> Key Candidate Strengths
          </div>
          <ul className="space-y-2">
            {(feedback.keyStrengths || [
              'Clear articulation of architectural trade-offs',
              'Structured problem-solving process',
              'Solid awareness of web performance bottlenecks'
            ]).map((s, i) => (
              <li key={i} className="text-xs sm:text-sm text-slate-300 flex items-start gap-2">
                <span className="text-emerald-400 mt-1">•</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Areas for Improvement */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <AlertTriangle className="w-4 h-4" /> Areas for Growth & Preparation
          </div>
          <ul className="space-y-2">
            {(feedback.areasForImprovement || [
              'Include specific metrics and error handling cases',
              'Format behavioral responses more strictly using STAR methodology',
              'Elaborate on production observability (metrics, alerting, trace logs)'
            ]).map((item, i) => (
              <li key={i} className="text-xs sm:text-sm text-slate-300 flex items-start gap-2">
                <span className="text-amber-400 mt-1">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Actionable Study Roadmap */}
      {feedback.actionableRoadmap && feedback.actionableRoadmap.length > 0 && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
            <BookOpen className="w-4 h-4" /> Recommended Actionable Study Roadmap
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            {feedback.actionableRoadmap.map((step, idx) => (
              <div key={idx} className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 space-y-1.5">
                <span className="text-[11px] font-bold text-teal-400 uppercase">Step {idx + 1}</span>
                <p className="text-xs text-slate-300 leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Question-by-Question Deep Dive */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-teal-400" /> Question-by-Question Deep Dive ({questions.length})
        </h3>

        <div className="space-y-4">
          {questions.map((q, idx) => {
            const qFeedback = q.feedback || {};
            const qScore = qFeedback.score || 7;

            return (
              <div key={idx} className="glass-panel rounded-2xl border border-slate-800 p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20 text-xs font-bold">
                      Q{idx + 1} • {q.category?.toUpperCase() || 'TECHNICAL'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200">
                    <span>Score:</span>
                    <span className={qScore >= 8 ? 'text-emerald-400' : qScore >= 6 ? 'text-amber-400' : 'text-rose-400'}>
                      {qScore} / 10
                    </span>
                  </div>
                </div>

                {/* The Question */}
                <div>
                  <h4 className="text-sm font-semibold text-white">"{q.questionText}"</h4>
                </div>

                {/* Candidate's Answer */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Your Response
                  </span>
                  <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {q.userAnswer || <span className="italic text-slate-500">No verbal/written transcript recorded.</span>}
                  </div>
                </div>

                {/* Candidate's Code (if any) */}
                {q.userCode && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <Code className="w-3 h-3 text-teal-400" /> Submitted Code
                    </span>
                    <pre className="p-3 bg-[#0a0e1a] rounded-xl border border-slate-800 text-xs font-mono text-teal-200 overflow-x-auto">
                      {q.userCode}
                    </pre>
                  </div>
                )}

                {/* Feedback Critique */}
                {qFeedback.critique && (
                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
                    <span className="text-xs font-bold text-teal-400">Interviewer Critique:</span>
                    <p className="text-xs text-slate-300 leading-relaxed">{qFeedback.critique}</p>
                  </div>
                )}

                {/* Model / Exemplary Answer */}
                {qFeedback.idealAnswer && (
                  <div className="p-4 rounded-xl bg-teal-950/20 border border-teal-500/25 space-y-1.5">
                    <span className="text-xs font-bold text-teal-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> Exemplary Model Answer (Top Candidate Benchmark):
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {qFeedback.idealAnswer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Back / Retake Navigation */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-800 print:hidden">
        <button
          onClick={onBackHome}
          className="px-5 py-2.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          ← Back to Dashboard
        </button>

        <button
          onClick={onRetake}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white bg-teal-600 hover:bg-teal-500 shadow-lg shadow-teal-500/20 text-xs transition-all"
        >
          Start Another Interview <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
