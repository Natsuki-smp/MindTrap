import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.js';
import { HomeView } from './components/HomeView.js';
import { StartModal } from './components/StartModal.js';
import { QuizView } from './components/QuizView.js';
import { ResultView } from './components/ResultView.js';
import { LeaderboardView } from './components/LeaderboardView.js';
import { HowToPlayView } from './components/HowToPlayView.js';
import { AdminLoginModal } from './components/AdminLoginModal.js';
import { AdminDashboard } from './components/AdminDashboard.js';
import { GameMode, PlayerSession, DbStatusInfo, QuestionAnswerRecord } from './types.js';
import { api } from './utils/api.js';
import { getOrCreateDeviceId } from './utils/device.js';
import { sfx } from './utils/audio.js';

type ViewMode = 'home' | 'quiz' | 'result' | 'leaderboard' | 'howtoplay' | 'admin';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('home');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Device & Session
  const [deviceId, setDeviceId] = useState<string>('');
  const [isDeviceLocked, setIsDeviceLocked] = useState<boolean>(false);
  const [lockedMessage, setLockedMessage] = useState<string>('');
  const [canResume, setCanResume] = useState<boolean>(false);
  const [activeSession, setActiveSession] = useState<PlayerSession | null>(null);

  // Modals
  const [isStartModalOpen, setIsStartModalOpen] = useState<boolean>(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState<boolean>(false);
  const [adminToken, setAdminToken] = useState<string | null>(null);

  // DB Status
  const [dbStatus, setDbStatus] = useState<DbStatusInfo | null>(null);

  // Quiz progression
  const [submittingAnswer, setSubmittingAnswer] = useState<boolean>(false);
  const [startingSession, setStartingSession] = useState<boolean>(false);
  const [lastAnswerRecord, setLastAnswerRecord] = useState<QuestionAnswerRecord | null>(null);

  // 1. Initial Device & Status check
  useEffect(() => {
    const id = getOrCreateDeviceId();
    setDeviceId(id);

    // Fetch initial DB status
    api.getStatus()
      .then(status => setDbStatus(status))
      .catch(err => console.error('Status check error:', err));

    // Check device state
    api.checkDevice(id)
      .then(res => {
        setIsDeviceLocked(res.locked);
        if (res.locked) {
          setLockedMessage(res.message || 'อุปกรณ์นี้ได้เล่นจบแล้ว');
        }
        setCanResume(res.canResume);
        if (res.session) {
          setActiveSession(res.session);
        }
      })
      .catch(err => console.error('Device check error:', err));
  }, []);

  // 2. Refresh device check helper
  const refreshDeviceState = async () => {
    if (!deviceId) return;
    try {
      const res = await api.checkDevice(deviceId);
      setIsDeviceLocked(res.locked);
      if (res.locked) setLockedMessage(res.message || '');
      setCanResume(res.canResume);
      if (res.session) setActiveSession(res.session);
    } catch (err) {
      console.error(err);
    }
  };

  // 3. Start New Session
  const handleStartGame = async (playerName: string, playerAge: number, mode: GameMode) => {
    setStartingSession(true);
    try {
      if (soundEnabled) sfx.playClick();
      const res = await api.startSession(deviceId, playerName, playerAge, mode);
      setActiveSession(res.session);
      setIsStartModalOpen(false);
      setLastAnswerRecord(null);
      setCurrentView('quiz');
    } catch (err: any) {
      alert(err.message || 'ไม่สามารถเริ่มการทดสอบได้');
    } finally {
      setStartingSession(false);
    }
  };

  // 4. Resume Session
  const handleResumeSession = () => {
    if (soundEnabled) sfx.playClick();
    if (activeSession && activeSession.status === 'active') {
      setCurrentView('quiz');
    }
  };

  // 5. Submit Answer
  const handleSubmitAnswer = async (selectedIndex: number) => {
    if (!activeSession) throw new Error('No active session');
    setSubmittingAnswer(true);
    try {
      const res = await api.submitAnswer(
        activeSession.id,
        activeSession.currentQuestionIndex,
        selectedIndex,
        deviceId
      );
      setLastAnswerRecord(res.answerRecord);
      setActiveSession(res.session);
      return res;
    } finally {
      setSubmittingAnswer(false);
    }
  };

  // 6. Next Question or Finish
  const handleNextQuestion = () => {
    if (!activeSession) return;
    if (activeSession.status === 'completed') {
      setIsDeviceLocked(true);
      setCanResume(false);
      setCurrentView('result');
    }
  };

  // 7. Admin Authentication
  const handleAdminSuccess = (token: string) => {
    setAdminToken(token);
    setIsAdminLoginOpen(false);
    setCurrentView('admin');
  };

  const handleAdminLogout = () => {
    setAdminToken(null);
    setCurrentView('home');
    refreshDeviceState();
  };

  // Current question helper
  const currentQuestion = (activeSession && activeSession.questions && activeSession.questions[activeSession.currentQuestionIndex])
    ? activeSession.questions[activeSession.currentQuestionIndex]
    : null;

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col selection:bg-white selection:text-black">
      {/* Top Bar */}
      <Header
        onGoHome={() => {
          if (currentView !== 'quiz') setCurrentView('home');
        }}
        onOpenAdmin={() => {
          if (adminToken) {
            setCurrentView('admin');
          } else {
            setIsAdminLoginOpen(true);
          }
        }}
        dbStatus={dbStatus ? { connected: dbStatus.connected, type: dbStatus.type } : undefined}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
      />

      {/* Main Content Areas */}
      <main className="flex-1 flex flex-col">
        {currentView === 'home' && (
          <HomeView
            onStartPlay={() => setIsStartModalOpen(true)}
            onOpenLeaderboard={() => setCurrentView('leaderboard')}
            onOpenHowToPlay={() => setCurrentView('howtoplay')}
            onOpenAdmin={() => {
              if (adminToken) {
                setCurrentView('admin');
              } else {
                setIsAdminLoginOpen(true);
              }
            }}
            onResumeSession={canResume ? handleResumeSession : undefined}
            isDeviceLocked={isDeviceLocked}
            canResume={canResume}
            lockedMessage={lockedMessage}
            activeSessionMode={activeSession?.mode}
          />
        )}

        {currentView === 'quiz' && activeSession && (
          <QuizView
            playerName={activeSession.playerName}
            mode={activeSession.mode}
            currentQuestionIndex={activeSession.currentQuestionIndex}
            totalQuestions={activeSession.totalQuestions}
            currentQuestion={currentQuestion}
            score={activeSession.score}
            onSubmitAnswer={handleSubmitAnswer}
            onNextQuestion={handleNextQuestion}
            lastAnswerRecord={lastAnswerRecord}
            soundEnabled={soundEnabled}
            submitting={submittingAnswer}
          />
        )}

        {currentView === 'result' && activeSession && (
          <ResultView
            session={activeSession}
            onGoHome={() => {
              refreshDeviceState();
              setCurrentView('home');
            }}
            onOpenLeaderboard={() => setCurrentView('leaderboard')}
          />
        )}

        {currentView === 'leaderboard' && (
          <LeaderboardView onBack={() => setCurrentView('home')} />
        )}

        {currentView === 'howtoplay' && (
          <HowToPlayView onBack={() => setCurrentView('home')} />
        )}

        {currentView === 'admin' && adminToken && (
          <AdminDashboard token={adminToken} onLogout={handleAdminLogout} />
        )}
      </main>

      {/* Start Game Modal */}
      <StartModal
        isOpen={isStartModalOpen}
        onClose={() => setIsStartModalOpen(false)}
        onConfirm={handleStartGame}
        loading={startingSession}
      />

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={handleAdminSuccess}
      />
    </div>
  );
}
