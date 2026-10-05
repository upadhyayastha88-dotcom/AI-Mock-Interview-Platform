import React, { useState, useEffect } from 'react';
import { 
  History as HistoryIcon, Award, Trash2, ArrowRight, Calendar, 
  Clock, PlusCircle, CheckCircle, BarChart3, AlertCircle, Loader2 
} from 'lucide-react';
import { api } from '../services/api';

export default function History({ onViewReport, onStartNew }) {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchHistory = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getAllInterviews();
      setInterviews(res.interviews || []);
    } catch (err) {
      console.error('Failed to load history:', err);
      setError('Unable to load past interviews.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this interview session?')) return;
    try {
      await api.deleteInterview(id);
      setInterviews(interviews.filter((i) => String(i._id) !== String(id)));
    } catch (err) {
      alert('Failed to delete session: ' + err.message);
    }
  };

  const completed = interviews.filter((i) => i.status === 'completed');
  const avgScore = completed.length
    ? Math.round(
        completed.reduce((acc, curr) => acc + (curr.overallFeedback?.overallScore || 0), 0) /
          completed.length
      )
    : 0;
  const bestScore = completed.reduce(
    (max, curr) => Math.max(max, curr.overallFeedback?.overallScore || 0),
    0
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Top Title & CTA */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <HistoryIcon className="w-7 h-7 text-teal-400" /> Past Interview Sessions
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Track your performance progress, review transcripts, and study feedback
          </p>
        </div>

        <button
          onClick={onStartNew}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white bg-teal-600 hover:bg-teal-500 shadow-lg shadow-teal-500/20 text-xs sm:text-sm transition-all hover:scale-105"
        >
          <PlusCircle className="w-4 h-4" /> Start New Session
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 bg-teal-500/10 text-teal-400 border border-teal-500/20 rounded-xl">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 block">Total Completed</span>
            <span className="text-2xl font-black text-white">{completed.length}</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 block">Average Score</span>
            <span className="text-2xl font-black text-white">{avgScore}%</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 block">Personal Best</span>
            <span className="text-2xl font-black text-white">{bestScore ? `${bestScore}%` : 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Table / Cards List */}
      {loading ? (
        <div className="glass-panel p-12 rounded-2xl text-center space-y-3">
          <Loader2 className="w-8 h-8 text-teal-400 animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading your interview sessions...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">
          {error}
        </div>
      ) : interviews.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl text-center space-y-4 border border-slate-800">
          <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto text-slate-500">
            <HistoryIcon className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">No interview sessions found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You haven't completed any mock interviews yet. Start your first session to build your scorecard!
          </p>
          <button
            onClick={onStartNew}
            className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 shadow transition-all"
          >
            Start First Interview
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {interviews.map((item) => {
            const score = item.overallFeedback?.overallScore;
            const dateStr = item.createdAt
              ? new Date(item.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })
              : 'Recent';

            return (
              <div
                key={item._id}
                onClick={() => onViewReport(item)}
                className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-teal-500/40 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  {/* Score Pill */}
                  <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center shrink-0">
                    {score ? (
                      <>
                        <span className={`text-sm font-black ${score >= 80 ? 'text-emerald-400' : score >= 65 ? 'text-amber-400' : 'text-rose-400'}`}>
                          {score}
                        </span>
                        <span className="text-[9px] text-slate-500">PTS</span>
                      </>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-bold">WIP</span>
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-teal-300 transition-colors">
                      {item.role}
                    </h4>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-400">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-[11px] text-slate-300">
                        {item.level}
                      </span>
                      <span>•</span>
                      <span>{item.type}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" /> {dateStr}
                      </span>
                      <span>•</span>
                      <span>{item.questions?.length || 0} Questions</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <span className="text-xs font-semibold text-teal-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    View Report <ArrowRight className="w-3.5 h-3.5" />
                  </span>

                  <button
                    onClick={(e) => handleDelete(item._id, e)}
                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-800/80 rounded-lg transition-colors"
                    title="Delete session"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
