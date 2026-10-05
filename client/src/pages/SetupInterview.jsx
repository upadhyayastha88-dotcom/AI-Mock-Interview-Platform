import React, { useState } from 'react';
import { Sparkles, Briefcase, Layers, Sliders, FileText, ArrowRight, Loader2, Check } from 'lucide-react';
import { api } from '../services/api';

export default function SetupInterview({ initialRole, onInterviewStarted, onCancel }) {
  const [role, setRole] = useState(initialRole || 'Full Stack Developer');
  const [level, setLevel] = useState('Mid-Level');
  const [type, setType] = useState('Technical');
  const [techStack, setTechStack] = useState(['React', 'Node.js', 'Express', 'MongoDB']);
  const [newSkill, setNewSkill] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [count, setCount] = useState(3);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const commonRoles = [
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'DevOps / Cloud Engineer',
    'System Design Architect',
    'Data Scientist / AI Engineer',
    'Behavioral & Culture Fit'
  ];

  const levels = ['Junior', 'Mid-Level', 'Senior', 'Lead'];
  const types = ['Technical', 'Behavioral', 'System Design', 'Mixed'];

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (newSkill.trim() && !techStack.includes(newSkill.trim())) {
      setTechStack([...techStack, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill) => {
    setTechStack(techStack.filter((s) => s !== skill));
  };

  const handleStart = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await api.createInterview({
        role,
        level,
        type,
        techStack,
        jobDescription,
        count
      });

      if (response.success && response.interview) {
        onInterviewStarted(response.interview);
      } else {
        throw new Error(response.error || 'Failed to initialize session');
      }
    } catch (err) {
      console.error('Setup error:', err);
      setError(err.message || 'Failed to start interview. Please check your network or configuration.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="glass-panel p-6 sm:p-10 rounded-3xl shadow-2xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-teal-500/10 text-teal-400 border border-teal-500/20 rounded-2xl">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Configure Your Mock Interview</h1>
            <p className="text-xs sm:text-sm text-slate-400">Tailor the questions to match your upcoming technical screening</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs sm:text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleStart} className="space-y-7">
          {/* Target Role */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Target Role / Position
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-3">
              {commonRoles.map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setRole(r)}
                  className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-all text-left truncate ${
                    role === r
                      ? 'bg-teal-500/15 border-teal-500 text-teal-300 shadow-sm shadow-teal-500/20'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Or type custom role title (e.g. iOS Staff Engineer)"
              className="w-full px-4 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-teal-500"
              required
            />
          </div>

          {/* Seniority & Interview Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Experience Level */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Experience Level
              </label>
              <div className="grid grid-cols-2 gap-2">
                {levels.map((lvl) => (
                  <button
                    type="button"
                    key={lvl}
                    onClick={() => setLevel(lvl)}
                    className={`px-4 py-2.5 text-xs font-semibold rounded-xl border text-center transition-all ${
                      level === lvl
                        ? 'bg-teal-500/15 border-teal-500 text-teal-300 shadow-sm shadow-teal-500/20'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Interview Format */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Interview Format
              </label>
              <div className="grid grid-cols-2 gap-2">
                {types.map((t) => (
                  <button
                    type="button"
                    key={t}
                    onClick={() => setType(t)}
                    className={`px-4 py-2.5 text-xs font-semibold rounded-xl border text-center transition-all ${
                      type === t
                        ? 'bg-teal-500/15 border-teal-500 text-teal-300 shadow-sm shadow-teal-500/20'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tech Stack Chips */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Key Technologies & Skills
            </label>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {techStack.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-medium text-slate-200"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="hover:text-red-400 text-slate-400 text-xs ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add tech (e.g. Next.js, Redis, Kafka, AWS)"
                className="flex-1 px-4 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-none focus:border-teal-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill(e);
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all"
              >
                + Add
              </button>
            </div>
          </div>

          {/* Job Description (Optional) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-teal-400" /> Target Job Description (Optional)
              </label>
              <span className="text-[11px] text-slate-500">For hyper-tailored scenarios</span>
            </div>
            <textarea
              rows={3}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste job posting snippet, company requirements, or specific topics you want to practice..."
              className="w-full px-4 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-white placeholder-slate-600 text-xs leading-relaxed focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Number of Questions */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Session Length
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { val: 1, label: 'Quick Warm-up (1 Q)' },
                { val: 3, label: 'Standard Round (3 Qs)' },
                { val: 5, label: 'Full Onsite (5 Qs)' }
              ].map((item) => (
                <button
                  type="button"
                  key={item.val}
                  onClick={() => setCount(item.val)}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-all ${
                    count === item.val
                      ? 'bg-teal-500/15 border-teal-500 text-teal-300 shadow-sm shadow-teal-500/20'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Submit / Cancel Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-7 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 shadow-xl shadow-teal-500/25 disabled:opacity-50 transition-all hover:scale-[1.02] text-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Preparing AI Interview...
                </>
              ) : (
                <>
                  Enter Interview Room <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
