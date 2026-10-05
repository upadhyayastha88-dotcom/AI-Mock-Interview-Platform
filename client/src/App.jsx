import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import SetupInterview from './pages/SetupInterview';
import ActiveInterview from './pages/ActiveInterview';
import FeedbackReport from './pages/FeedbackReport';
import History from './pages/History';

export default function App() {
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'setup' | 'active' | 'report' | 'history'
  const [selectedRole, setSelectedRole] = useState('Full Stack Developer');
  const [activeInterview, setActiveInterview] = useState(null);

  const handleStartInterview = (role) => {
    if (role) setSelectedRole(role);
    setCurrentView('setup');
  };

  const handleInterviewStarted = (interviewData) => {
    setActiveInterview(interviewData);
    setCurrentView('active');
  };

  const handleInterviewCompleted = (interviewData) => {
    setActiveInterview(interviewData);
    setCurrentView('report');
  };

  const handleViewReport = (interviewData) => {
    setActiveInterview(interviewData);
    setCurrentView('report');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100 selection:bg-teal-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar currentView={currentView} setCurrentView={setCurrentView} />

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'home' && (
          <Home
            onStartInterview={handleStartInterview}
            onViewHistory={() => setCurrentView('history')}
          />
        )}

        {currentView === 'setup' && (
          <SetupInterview
            initialRole={selectedRole}
            onInterviewStarted={handleInterviewStarted}
            onCancel={() => setCurrentView('home')}
          />
        )}

        {currentView === 'active' && activeInterview && (
          <ActiveInterview
            interview={activeInterview}
            onInterviewCompleted={handleInterviewCompleted}
            onExit={() => {
              if (window.confirm('Are you sure you want to exit the interview room?')) {
                setCurrentView('home');
              }
            }}
          />
        )}

        {currentView === 'report' && activeInterview && (
          <FeedbackReport
            interview={activeInterview}
            onRetake={() => setCurrentView('setup')}
            onBackHome={() => setCurrentView('home')}
          />
        )}

        {currentView === 'history' && (
          <History
            onViewReport={handleViewReport}
            onStartNew={() => setCurrentView('setup')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-6 mt-12 bg-[#060910] text-center text-xs text-slate-500 print:hidden">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} PrepPulse AI • Full-Stack MERN Technical Interview Platform</p>
          <p className="flex items-center gap-1">
            Built with React, Vite, Node.js, Express, MongoDB & Google Gemini AI
          </p>
        </div>
      </footer>
    </div>
  );
}
