import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Database, Shield, BookOpen, Users, Trophy, Film, LogOut,
  RefreshCw, Plus, Trash2, Edit3, CheckCircle2, AlertTriangle,
  Play, Sparkles, Key, Check, X, Search, Lock
} from 'lucide-react';
import { Question, PlayerSession, LeaderboardEntry, VideoRewardRule, DbStatusInfo, GameMode } from '../types.js';
import { api } from '../utils/api.js';

interface AdminDashboardProps {
  token: string;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ token, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'status' | 'questions' | 'sessions' | 'leaderboard' | 'videos'>('status');

  // DB Status
  const [dbStatus, setDbStatus] = useState<DbStatusInfo | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);

  // Questions
  const [questions, setQuestions] = useState<Question[]>([]);
  const [qFilterMode, setQFilterMode] = useState<'ALL' | 'HARD' | 'EXTREME'>('ALL');
  const [qSearch, setQSearch] = useState('');
  const [qLoading, setQLoading] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [duplicateReport, setDuplicateReport] = useState<{ duplicates: any[]; uniqueCount: number } | null>(null);
  const [generating, setGenerating] = useState(false);

  // Sessions
  const [sessions, setSessions] = useState<PlayerSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);

  // Leaderboard
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [lbLoading, setLbLoading] = useState(false);

  // Video Rewards
  const [videoRewards, setVideoRewards] = useState<VideoRewardRule[]>([]);
  const [editingVideoRule, setEditingVideoRule] = useState<VideoRewardRule | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);

  // Action messages
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Load Status
  const loadDbStatus = async () => {
    setStatusLoading(true);
    try {
      const data = await api.getAdminDbStatus(token);
      setDbStatus(data);
    } catch (err: any) {
      showToast(err.message || 'ไม่สามารถโหลดสถานะ DB ได้', 'error');
    } finally {
      setStatusLoading(false);
    }
  };

  // Load Questions
  const loadQuestions = async () => {
    setQLoading(true);
    try {
      const modeParam = qFilterMode === 'ALL' ? undefined : qFilterMode;
      const data = await api.getAdminQuestions(token, modeParam);
      setQuestions(data);
    } catch (err: any) {
      showToast(err.message || 'โหลดคำถามไม่สำเร็จ', 'error');
    } finally {
      setQLoading(false);
    }
  };

  // Load Sessions
  const loadSessions = async () => {
    setSessionsLoading(true);
    try {
      const data = await api.getAdminSessions(token);
      setSessions(data);
    } catch (err: any) {
      showToast(err.message || 'โหลดเซสชันไม่สำเร็จ', 'error');
    } finally {
      setSessionsLoading(false);
    }
  };

  // Load Leaderboard
  const loadLeaderboard = async () => {
    setLbLoading(true);
    try {
      const data = await api.getLeaderboard();
      setLeaderboard(data);
    } catch (err: any) {
      showToast(err.message || 'โหลดตารางคะแนนไม่สำเร็จ', 'error');
    } finally {
      setLbLoading(false);
    }
  };

  // Load Video Rewards
  const loadVideoRewards = async () => {
    try {
      const data = await api.getAdminVideoRewards(token);
      setVideoRewards(data);
    } catch (err: any) {
      showToast(err.message || 'โหลดกฎวิดีโอไม่สำเร็จ', 'error');
    }
  };

  useEffect(() => {
    loadDbStatus();
  }, []);

  useEffect(() => {
    if (activeTab === 'questions') loadQuestions();
    if (activeTab === 'sessions') loadSessions();
    if (activeTab === 'leaderboard') loadLeaderboard();
    if (activeTab === 'videos') loadVideoRewards();
    if (activeTab === 'status') loadDbStatus();
  }, [activeTab, qFilterMode]);

  // Duplicate Check
  const handleCheckDuplicates = async () => {
    try {
      const report = await api.checkAdminDuplicates(token);
      setDuplicateReport(report);
      if (report.duplicates.length === 0) {
        showToast(`ตรวจสอบเสร็จสิ้น: ปลอดภัย ไม่พบข้อสอบซ้ำ (${report.uniqueCount} ข้อที่ไม่ซ้ำกัน)`, 'success');
      } else {
        showToast(`พบข้อสอบซ้ำกัน ${report.duplicates.length} คู่!`, 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Generate Questions via AI
  const handleGenerateQuestions = async (mode: GameMode) => {
    setGenerating(true);
    try {
      const res = await api.generateAdminQuestions(token, mode, 10);
      showToast(`สร้างและตรวจสอบคำถามใหม่สำเร็จ +${res.added} ข้อในโหมด ${mode}`, 'success');
      loadQuestions();
      loadDbStatus();
    } catch (err: any) {
      showToast(err.message || 'สร้างคำถามไม่สำเร็จ', 'error');
    } finally {
      setGenerating(false);
    }
  };

  // Delete Question
  const handleDeleteQuestion = async (id: string) => {
    if (!confirm(`ยืนยันการลบคำถามรหัส ${id} หรือไม่?`)) return;
    try {
      await api.deleteAdminQuestion(token, id);
      showToast(`ลบคำถาม ${id} แล้ว`, 'success');
      loadQuestions();
      loadDbStatus();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Reset Device Replay Lock
  const handleResetDevice = async (deviceId: string) => {
    if (!confirm(`ต้องการรีเซ็ตและปลดล็อกการเล่นซ้ำสำหรับอุปกรณ์ ${deviceId} หรือไม่?`)) return;
    try {
      await api.resetAdminDevice(token, deviceId);
      showToast(`ปลดล็อก Replay สำหรับอุปกรณ์ ${deviceId} เรียบร้อยแล้ว`, 'success');
      loadSessions();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Delete Session
  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm(`ยืนยันการลบเซสชัน ${sessionId}?`)) return;
    try {
      await api.deleteAdminSession(token, sessionId);
      showToast(`ลบเซสชันแล้ว`, 'success');
      loadSessions();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Save Video Rule
  const handleSaveVideoRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVideoRule) return;
    try {
      const res = await api.saveAdminVideoReward(token, editingVideoRule);
      if (!res.success) {
        showToast(res.error || 'บันทึกไม่สำเร็จ', 'error');
      } else {
        showToast('บันทึกกฎวิดีโอของรางวัลสำเร็จ', 'success');
        setShowVideoModal(false);
        setEditingVideoRule(null);
        loadVideoRewards();
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Delete Video Rule
  const handleDeleteVideoRule = async (id: string) => {
    if (!confirm('ยืนยันลบกฎวิดีโอนี้หรือไม่?')) return;
    try {
      await api.deleteAdminVideoReward(token, id);
      showToast('ลบกฎวิดีโอแล้ว', 'success');
      loadVideoRewards();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Save Question
  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion) return;
    try {
      const res = await api.saveAdminQuestion(token, editingQuestion);
      if (!res.success) {
        showToast(res.error || 'บันทึกคำถามไม่สำเร็จ', 'error');
      } else {
        showToast('บันทึกคำถามสำเร็จ และตรวจสอบความซ้ำซ้อนเรียบร้อย', 'success');
        setShowQuestionModal(false);
        setEditingQuestion(null);
        loadQuestions();
        loadDbStatus();
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const filteredQuestions = questions.filter(q => {
    if (!qSearch) return true;
    const term = qSearch.toLowerCase();
    return (
      q.question.toLowerCase().includes(term) ||
      q.category.toLowerCase().includes(term) ||
      q.id.toLowerCase().includes(term) ||
      q.trapType.toLowerCase().includes(term)
    );
  });

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 sm:py-10">
      {/* Toast */}
      {toastMessage && (
        <div className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-xl border shadow-xl text-xs font-semibold flex items-center gap-2 ${
          toastMessage.type === 'success'
            ? 'bg-emerald-950 border-emerald-500/40 text-emerald-200'
            : 'bg-red-950 border-red-500/40 text-red-200'
        }`}>
          {toastMessage.type === 'success' ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Admin Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl border border-[#2a2a2a] bg-[#0c0c0c] mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center font-bold">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span>Admin Control Dashboard</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                ACTIVE
              </span>
            </h1>
            <div className="text-xs text-[#777] font-mono">
              สิทธิ์ผู้ดูแลระบบ • รหัสยืนยัน plmokn098!?
            </div>
          </div>
        </div>

        <button
          id="btn-admin-logout"
          onClick={onLogout}
          className="px-4 py-2 rounded-xl border border-red-500/30 bg-red-950/20 hover:bg-red-950/40 text-red-300 text-xs font-mono flex items-center gap-2 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>ออกจากระบบ (Logout)</span>
        </button>
      </div>

      {/* 🛑 CRITICAL PROMPT REQUIREMENT: "และมีที่ดูว่าเชื่อมฐานข้อมูลยังด้วย ในหน้าของ แอดมิน" */}
      <div className="w-full p-4 sm:p-5 rounded-2xl border border-[#242424] bg-[#101010] mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-[#1c1c1c]">
          <div className="flex items-center gap-2.5">
            <div className={`w-3.5 h-3.5 rounded-full ${dbStatus?.connected ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]' : 'bg-red-400 animate-ping'}`} />
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span>สถานะการเชื่อมต่อฐานข้อมูล (Database Connection):</span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                  dbStatus?.type === 'firebase'
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {dbStatus?.type === 'firebase' ? 'FIREBASE CLOUD FIRESTORE' : 'LOCAL PERSISTENT ENGINE'}
                </span>
              </div>
              <div className="text-xs text-[#aaa] font-mono mt-0.5">
                {dbStatus?.message}
              </div>
            </div>
          </div>

          <button
            id="btn-admin-refresh-db"
            onClick={loadDbStatus}
            disabled={statusLoading}
            className="px-3 py-1.5 rounded-lg border border-[#2a2a2a] bg-[#161616] hover:bg-[#202020] text-xs font-mono text-[#bbb] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${statusLoading ? 'animate-spin' : ''}`} />
            <span>ทดสอบการเชื่อมต่อ</span>
          </button>
        </div>

        {/* Database Metric Badges */}
        {dbStatus && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            <div className="p-3 rounded-xl border border-[#1e1e1e] bg-[#141414]">
              <div className="text-[10px] font-mono text-[#777] uppercase">คลังคำถามทั้งหมด</div>
              <div className="text-lg font-bold font-mono text-white mt-0.5">{dbStatus.totalQuestions} ข้อ</div>
              <div className="text-[10px] text-[#555] font-mono">เป้าหมาย &gt;= 200 ข้อ</div>
            </div>

            <div className="p-3 rounded-xl border border-[#1e1e1e] bg-[#141414]">
              <div className="text-[10px] font-mono text-[#777] uppercase">คำถาม HARD</div>
              <div className="text-lg font-bold font-mono text-white mt-0.5">{dbStatus.hardQuestions} ข้อ</div>
              <div className="text-[10px] text-[#555] font-mono">10 ข้อต่อรอบ</div>
            </div>

            <div className="p-3 rounded-xl border border-[#1e1e1e] bg-[#141414]">
              <div className="text-[10px] font-mono text-[#777] uppercase">คำถาม EXTREME</div>
              <div className="text-lg font-bold font-mono text-white mt-0.5">{dbStatus.extremeQuestions} ข้อ</div>
              <div className="text-[10px] text-[#555] font-mono">20 ข้อต่อรอบ</div>
            </div>

            <div className="p-3 rounded-xl border border-[#1e1e1e] bg-[#141414]">
              <div className="text-[10px] font-mono text-[#777] uppercase">แจกแล้ว (No-Repeat)</div>
              <div className="text-lg font-bold font-mono text-amber-400 mt-0.5">{dbStatus.allocatedQuestions} ข้อ</div>
              <div className="text-[10px] text-amber-400/60 font-mono">ตัดออกจากคลังถาวร</div>
            </div>

            <div className="p-3 rounded-xl border border-[#1e1e1e] bg-[#141414]">
              <div className="text-[10px] font-mono text-[#777] uppercase">คงเหลือใน Pool</div>
              <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5">{dbStatus.availableQuestions} ข้อ</div>
              <div className="text-[10px] text-emerald-400/60 font-mono">พร้อมแจกจ่าย</div>
            </div>

            <div className="p-3 rounded-xl border border-[#1e1e1e] bg-[#141414]">
              <div className="text-[10px] font-mono text-[#777] uppercase">เซสชันผู้เล่น</div>
              <div className="text-lg font-bold font-mono text-white mt-0.5">{dbStatus.totalSessions} เซสชัน</div>
              <div className="text-[10px] text-[#555] font-mono">จัดอันดับ {dbStatus.totalLeaderboard} ราย</div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#222] pb-3 mb-6">
        <button
          id="tab-admin-questions"
          onClick={() => setActiveTab('questions')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'questions' ? 'bg-white text-black' : 'text-[#888] hover:text-white bg-[#121212]'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>จัดการคำถาม ({questions.length})</span>
        </button>

        <button
          id="tab-admin-sessions"
          onClick={() => setActiveTab('sessions')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'sessions' ? 'bg-white text-black' : 'text-[#888] hover:text-white bg-[#121212]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>เซสชัน &amp; Replay Lock</span>
        </button>

        <button
          id="tab-admin-leaderboard"
          onClick={() => setActiveTab('leaderboard')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'leaderboard' ? 'bg-white text-black' : 'text-[#888] hover:text-white bg-[#121212]'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>ตารางคะแนน (Leaderboard)</span>
        </button>

        <button
          id="tab-admin-videos"
          onClick={() => setActiveTab('videos')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'videos' ? 'bg-white text-black' : 'text-[#888] hover:text-white bg-[#121212]'
          }`}
        >
          <Film className="w-4 h-4" />
          <span>จัดการวิดีโอของรางวัล (Video Rewards)</span>
        </button>
      </div>

      {/* --- TAB 1: QUESTIONS --- */}
      {activeTab === 'questions' && (
        <div className="flex flex-col gap-4">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl border border-[#222] bg-[#0d0d0d]">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[#666]" />
                <input
                  type="text"
                  placeholder="ค้นหาโจทย์ หรือ หมวดหมู่..."
                  value={qSearch}
                  onChange={e => setQSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-lg border border-[#262626] bg-[#141414] text-white text-xs placeholder-[#555] focus:outline-none focus:border-white"
                />
              </div>

              <select
                value={qFilterMode}
                onChange={e => setQFilterMode(e.target.value as any)}
                className="px-3 py-1.5 rounded-lg border border-[#262626] bg-[#141414] text-xs text-white"
              >
                <option value="ALL">ทุกลักษณะโหมด (ALL)</option>
                <option value="HARD">เฉพาะ HARD</option>
                <option value="EXTREME">เฉพาะ EXTREME</option>
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                id="btn-admin-check-duplicates"
                onClick={handleCheckDuplicates}
                className="px-3 py-1.5 rounded-lg border border-[#333] bg-[#181818] hover:border-[#555] text-white text-xs font-mono flex items-center gap-1.5 cursor-pointer"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>ตรวจข้อซ้ำ (Duplicate Check)</span>
              </button>

              <button
                id="btn-admin-generate-ai"
                onClick={() => handleGenerateQuestions('HARD')}
                disabled={generating}
                className="px-3 py-1.5 rounded-lg border border-purple-500/30 bg-purple-950/20 hover:bg-purple-950/40 text-purple-300 text-xs font-mono flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>{generating ? 'กำลังสร้าง...' : '+ สุ่มสร้างโจทย์เพิ่ม (AI)'}</span>
              </button>

              <button
                id="btn-admin-add-question"
                onClick={() => {
                  setEditingQuestion({
                    id: `q_${Date.now()}`,
                    mode: 'HARD',
                    category: 'Logic',
                    question: '',
                    options: ['', '', '', ''],
                    correctIndex: 0,
                    explanation: '',
                    trapType: 'Hidden Condition',
                    trapExplanation: '',
                    createdAt: new Date().toISOString()
                  });
                  setShowQuestionModal(true);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-white text-black font-bold text-xs flex items-center gap-1.5 hover:bg-[#eaeaea] cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>เพิ่มคำถามใหม่</span>
              </button>
            </div>
          </div>

          {/* Question List Table */}
          <div className="rounded-2xl border border-[#222] bg-[#0c0c0c] overflow-hidden">
            {qLoading ? (
              <div className="py-12 text-center text-[#777] font-mono text-xs">กำลังโหลดข้อสอบ...</div>
            ) : filteredQuestions.length === 0 ? (
              <div className="py-12 text-center text-[#777] font-mono text-xs">ไม่พบคำถามที่ตรงกับเงื่อนไข</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#222] bg-[#141414] text-[11px] font-mono text-[#888]">
                      <th className="py-3 px-3 w-16">ID</th>
                      <th className="py-3 px-2 w-20">โหมด</th>
                      <th className="py-3 px-2 w-28">หมวดหมู่</th>
                      <th className="py-3 px-4">โจทย์คำถาม</th>
                      <th className="py-3 px-3 text-center">เฉลย</th>
                      <th className="py-3 px-3">กับดักความคิด</th>
                      <th className="py-3 px-3 text-right">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#181818]">
                    {filteredQuestions.map(q => (
                      <tr key={q.id} className="hover:bg-white/[0.02]">
                        <td className="py-2.5 px-3 font-mono text-[#777]">{q.id}</td>
                        <td className="py-2.5 px-2">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                            q.mode === 'HARD' ? 'bg-white/10 text-white' : 'bg-red-500/20 text-red-300'
                          }`}>
                            {q.mode}
                          </span>
                        </td>
                        <td className="py-2.5 px-2 font-mono text-[#aaa]">{q.category}</td>
                        <td className="py-2.5 px-4 max-w-md truncate text-white" title={q.question}>
                          {q.question}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-emerald-400">
                          {['A', 'B', 'C', 'D'][q.correctIndex]}
                        </td>
                        <td className="py-2.5 px-3 text-[#bbb]">{q.trapType}</td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setEditingQuestion({ ...q });
                                setShowQuestionModal(true);
                              }}
                              className="p-1 rounded hover:bg-[#222] text-[#888] hover:text-white"
                              title="แก้ไขคำถาม"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteQuestion(q.id)}
                              className="p-1 rounded hover:bg-red-950/30 text-[#888] hover:text-red-400"
                              title="ลบคำถาม"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- TAB 2: SESSIONS & REPLAY LOCK --- */}
      {activeTab === 'sessions' && (
        <div className="flex flex-col gap-4">
          <div className="p-4 rounded-xl border border-[#222] bg-[#0d0d0d] flex items-center justify-between">
            <div className="text-xs text-[#aaa]">
              ตรวจสอบสถานะ Replay Lock ของผู้เล่น และปลดล็อกอุปกรณ์รายบุคคลเพื่อการทดสอบ
            </div>
            <button
              onClick={loadSessions}
              className="px-3 py-1.5 rounded-lg border border-[#262626] text-xs font-mono text-[#888] hover:text-white flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>รีเฟรช</span>
            </button>
          </div>

          <div className="rounded-2xl border border-[#222] bg-[#0c0c0c] overflow-hidden">
            {sessionsLoading ? (
              <div className="py-12 text-center text-[#777] font-mono text-xs">กำลังโหลดเซสชัน...</div>
            ) : sessions.length === 0 ? (
              <div className="py-12 text-center text-[#777] font-mono text-xs">ยังไม่มีเซสชันผู้เล่น</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#222] bg-[#141414] text-[11px] font-mono text-[#888]">
                      <th className="py-3 px-3">Session ID</th>
                      <th className="py-3 px-3">ผู้เล่น</th>
                      <th className="py-3 px-3">โหมด</th>
                      <th className="py-3 px-3">สถานะ</th>
                      <th className="py-3 px-3 text-center">คะแนน</th>
                      <th className="py-3 px-3">Device ID</th>
                      <th className="py-3 px-3 text-right">การจัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#181818]">
                    {sessions.map(s => (
                      <tr key={s.id} className="hover:bg-white/[0.02]">
                        <td className="py-2.5 px-3 font-mono text-[#777]">{s.id.substring(0, 14)}...</td>
                        <td className="py-2.5 px-3 font-semibold text-white">
                          {s.playerName} <span className="text-[#666] font-normal">({s.playerAge} ปี)</span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                            s.mode === 'HARD' ? 'bg-white/10 text-white' : 'bg-red-500/20 text-red-300'
                          }`}>
                            {s.mode}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          {s.status === 'completed' ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-red-950/40 text-red-300 border border-red-800/40 flex items-center gap-1 w-max">
                              <Lock className="w-2.5 h-2.5" />
                              REPLAY LOCKED
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-950/40 text-amber-300 border border-amber-800/40 flex items-center gap-1 w-max">
                              IN PROGRESS ({s.currentQuestionIndex}/{s.totalQuestions})
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-white">
                          {s.score} / {s.totalQuestions}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[#666] text-[10px] max-w-xs truncate" title={s.deviceId}>
                          {s.deviceId}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleResetDevice(s.deviceId)}
                              className="px-2 py-1 rounded bg-[#1e1e1e] hover:bg-white hover:text-black text-[#bbb] font-mono text-[10px] transition-colors"
                              title="ปลดล็อก Replay ให้อุปกรณ์นี้เล่นใหม่ได้"
                            >
                              ปลดล็อก Replay
                            </button>
                            <button
                              onClick={() => handleDeleteSession(s.id)}
                              className="p-1 rounded text-[#666] hover:text-red-400"
                              title="ลบเซสชันนี้"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- TAB 3: LEADERBOARD --- */}
      {activeTab === 'leaderboard' && (
        <div className="flex flex-col gap-4">
          <div className="p-4 rounded-xl border border-[#222] bg-[#0d0d0d] flex items-center justify-between">
            <div className="text-xs text-[#aaa]">
              ตารางคะแนนรวมทั้งหมด {leaderboard.length} รายการ
            </div>
            <button
              onClick={async () => {
                if (!confirm('ต้องการล้างตารางคะแนนทั้งหมดหรือไม่?')) return;
                await api.clearAdminLeaderboard(token);
                showToast('ล้างตารางคะแนนสำเร็จ', 'success');
                loadLeaderboard();
              }}
              className="px-3 py-1.5 rounded-lg border border-red-500/30 bg-red-950/20 text-red-300 text-xs font-mono hover:bg-red-950/40"
            >
              ล้างคะแนนทั้งหมด
            </button>
          </div>

          <div className="rounded-2xl border border-[#222] bg-[#0c0c0c] overflow-hidden">
            {lbLoading ? (
              <div className="py-12 text-center text-[#777] font-mono text-xs">กำลังโหลดคะแนน...</div>
            ) : leaderboard.length === 0 ? (
              <div className="py-12 text-center text-[#777] font-mono text-xs">ไม่มีรายการใน Leaderboard</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#222] bg-[#141414] text-[11px] font-mono text-[#888]">
                      <th className="py-3 px-3">ผู้เล่น</th>
                      <th className="py-3 px-3">โหมด</th>
                      <th className="py-3 px-3 text-center">คะแนน</th>
                      <th className="py-3 px-3 text-center">เวลา (วินาที)</th>
                      <th className="py-3 px-3 text-center">IQ Estimate</th>
                      <th className="py-3 px-3 text-right">วันที่</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#181818]">
                    {leaderboard.map(lb => (
                      <tr key={lb.id} className="hover:bg-white/[0.02]">
                        <td className="py-2.5 px-3 font-semibold text-white">{lb.playerName}</td>
                        <td className="py-2.5 px-3">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                            lb.mode === 'HARD' ? 'bg-white/10 text-white' : 'bg-red-500/20 text-red-300'
                          }`}>
                            {lb.mode}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-white">
                          {lb.score} / {lb.totalQuestions}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono text-[#aaa]">
                          {(lb.durationMs / 1000).toFixed(1)}s
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono text-purple-300">{lb.iqEstimate}</td>
                        <td className="py-2.5 px-3 text-right text-[11px] font-mono text-[#666]">
                          {new Date(lb.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- TAB 4: VIDEO REWARDS --- */}
      {activeTab === 'videos' && (
        <div className="flex flex-col gap-4">
          <div className="p-4 rounded-xl border border-[#222] bg-[#0d0d0d] flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-[#aaa]">
              กำหนดวิดีโอของรางวัลตาม Mode และช่วงคะแนน (ห้ามช่วงคะแนนซ้อนทับกันตามกฎ)
            </div>
            <button
              onClick={() => {
                setEditingVideoRule({
                  id: `vid_${Date.now()}`,
                  title: '',
                  mode: 'HARD',
                  minScore: 1,
                  maxScore: 5,
                  videoUrl: '',
                  description: '',
                  createdAt: new Date().toISOString()
                });
                setShowVideoModal(true);
              }}
              className="px-3.5 py-1.5 rounded-lg bg-white text-black font-bold text-xs flex items-center gap-1.5 hover:bg-[#eaeaea] cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>เพิ่มกฎวิดีโอใหม่</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {videoRewards.map(rule => (
              <div key={rule.id} className="p-5 rounded-2xl border border-[#262626] bg-[#0f0f0f] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                      rule.mode === 'HARD' ? 'bg-white/10 text-white' : 'bg-red-500/20 text-red-300'
                    }`}>
                      {rule.mode}
                    </span>
                    <span className="text-xs font-mono text-amber-400 font-bold">
                      คะแนน {rule.minScore} - {rule.maxScore}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mb-1">{rule.title}</h3>
                  <p className="text-xs text-[#888] mb-3 leading-relaxed">{rule.description}</p>
                  <div className="text-[11px] font-mono text-[#555] truncate mb-3" title={rule.videoUrl}>
                    URL: {rule.videoUrl}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#1e1e1e]">
                  <button
                    onClick={() => setPreviewVideoUrl(rule.videoUrl)}
                    className="px-3 py-1.5 rounded-lg border border-[#333] bg-[#161616] text-xs font-mono text-white flex items-center gap-1.5 hover:border-white transition-colors"
                  >
                    <Play className="w-3 h-3" />
                    <span>ดูตัวอย่างวิดีโอ</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setEditingVideoRule({ ...rule });
                        setShowVideoModal(true);
                      }}
                      className="p-1.5 rounded hover:bg-[#222] text-[#888] hover:text-white"
                      title="แก้ไข"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteVideoRule(rule.id)}
                      className="p-1.5 rounded hover:bg-red-950/30 text-[#888] hover:text-red-400"
                      title="ลบ"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Video Preview Modal */}
      {previewVideoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="w-full max-w-2xl bg-[#111] border border-[#333] rounded-2xl p-4 text-white relative">
            <button
              onClick={() => setPreviewVideoUrl(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-[#222] flex items-center justify-center text-[#888] hover:text-white z-10"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="text-xs font-mono text-[#888] mb-2 uppercase">วิดีโอพรีวิว (Admin Preview)</div>
            <div className="w-full aspect-video rounded-xl overflow-hidden bg-black border border-[#222]">
              <video src={previewVideoUrl} controls autoPlay loop className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      )}

      {/* Edit Video Rule Modal */}
      {showVideoModal && editingVideoRule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-lg bg-[#111] border border-[#333] rounded-2xl p-6 text-white relative">
            <button
              onClick={() => {
                setShowVideoModal(false);
                setEditingVideoRule(null);
              }}
              className="absolute top-5 right-5 w-8 h-8 rounded-lg bg-[#1c1c1c] flex items-center justify-center text-[#888] hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
            <h2 className="text-lg font-bold mb-4">ตั้งค่ากฎวิดีโอของรางวัล</h2>
            <form onSubmit={handleSaveVideoRule} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="block text-[#aaa] mb-1">ชื่อรางวัล (Title)</label>
                <input
                  type="text"
                  required
                  value={editingVideoRule.title}
                  onChange={e => setEditingVideoRule({ ...editingVideoRule, title: e.target.value })}
                  className="w-full p-2.5 rounded-lg bg-[#181818] border border-[#2a2a2a] text-white"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[#aaa] mb-1">Mode</label>
                  <select
                    value={editingVideoRule.mode}
                    onChange={e => setEditingVideoRule({ ...editingVideoRule, mode: e.target.value as any })}
                    className="w-full p-2.5 rounded-lg bg-[#181818] border border-[#2a2a2a] text-white"
                  >
                    <option value="HARD">HARD</option>
                    <option value="EXTREME">EXTREME</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#aaa] mb-1">คะแนนขั้นต่ำ (Min)</label>
                  <input
                    type="number"
                    min={0}
                    max={20}
                    required
                    value={editingVideoRule.minScore}
                    onChange={e => setEditingVideoRule({ ...editingVideoRule, minScore: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-lg bg-[#181818] border border-[#2a2a2a] text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[#aaa] mb-1">คะแนนสูงสุด (Max)</label>
                  <input
                    type="number"
                    min={0}
                    max={20}
                    required
                    value={editingVideoRule.maxScore}
                    onChange={e => setEditingVideoRule({ ...editingVideoRule, maxScore: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-lg bg-[#181818] border border-[#2a2a2a] text-white font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[#aaa] mb-1">Video MP4 URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://.../video.mp4"
                  value={editingVideoRule.videoUrl}
                  onChange={e => setEditingVideoRule({ ...editingVideoRule, videoUrl: e.target.value })}
                  className="w-full p-2.5 rounded-lg bg-[#181818] border border-[#2a2a2a] text-white font-mono text-[11px]"
                />
              </div>
              <div>
                <label className="block text-[#aaa] mb-1">คำอธิบาย (Description)</label>
                <textarea
                  rows={2}
                  value={editingVideoRule.description || ''}
                  onChange={e => setEditingVideoRule({ ...editingVideoRule, description: e.target.value })}
                  className="w-full p-2.5 rounded-lg bg-[#181818] border border-[#2a2a2a] text-white"
                />
              </div>
              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-white text-black font-bold text-xs hover:bg-[#eaeaea]"
                >
                  บันทึกกฎวิดีโอ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Question Modal */}
      {showQuestionModal && editingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-xl bg-[#111] border border-[#333] rounded-2xl p-6 text-white my-8 relative">
            <button
              onClick={() => {
                setShowQuestionModal(false);
                setEditingQuestion(null);
              }}
              className="absolute top-5 right-5 w-8 h-8 rounded-lg bg-[#1c1c1c] flex items-center justify-center text-[#888] hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <h2 className="text-lg font-bold mb-4">เพิ่ม / แก้ไขคำถามตรรกะ</h2>

            <form onSubmit={handleSaveQuestion} className="flex flex-col gap-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#aaa] mb-1">Mode</label>
                  <select
                    value={editingQuestion.mode}
                    onChange={e => setEditingQuestion({ ...editingQuestion, mode: e.target.value as any })}
                    className="w-full p-2.5 rounded-lg bg-[#181818] border border-[#2a2a2a] text-white"
                  >
                    <option value="HARD">HARD</option>
                    <option value="EXTREME">EXTREME</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#aaa] mb-1">หมวดหมู่ (Category)</label>
                  <input
                    type="text"
                    required
                    value={editingQuestion.category}
                    onChange={e => setEditingQuestion({ ...editingQuestion, category: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-[#181818] border border-[#2a2a2a] text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#aaa] mb-1">โจทย์คำถาม *</label>
                <textarea
                  rows={3}
                  required
                  value={editingQuestion.question}
                  onChange={e => setEditingQuestion({ ...editingQuestion, question: e.target.value })}
                  className="w-full p-2.5 rounded-lg bg-[#181818] border border-[#2a2a2a] text-white"
                />
              </div>

              {/* 4 Choices */}
              <div className="space-y-2">
                <label className="block text-[#aaa]">4 ตัวเลือก &amp; เลือกว่าข้อใดคือข้อที่ถูก</label>
                {editingQuestion.options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correctIdx"
                      checked={editingQuestion.correctIndex === i}
                      onChange={() => setEditingQuestion({ ...editingQuestion, correctIndex: i })}
                      className="cursor-pointer"
                    />
                    <span className="font-mono font-bold text-white w-5">{['A', 'B', 'C', 'D'][i]}</span>
                    <input
                      type="text"
                      required
                      value={opt}
                      onChange={e => {
                        const newOpts = [...editingQuestion.options] as [string, string, string, string];
                        newOpts[i] = e.target.value;
                        setEditingQuestion({ ...editingQuestion, options: newOpts });
                      }}
                      className="flex-1 p-2 rounded-lg bg-[#181818] border border-[#2a2a2a] text-white"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-[#aaa] mb-1">คำอธิบายเชิงตรรกะ (Explanation)</label>
                <textarea
                  rows={2}
                  required
                  value={editingQuestion.explanation}
                  onChange={e => setEditingQuestion({ ...editingQuestion, explanation: e.target.value })}
                  className="w-full p-2.5 rounded-lg bg-[#181818] border border-[#2a2a2a] text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#aaa] mb-1">ประเภทกับดัก (Trap Type)</label>
                  <input
                    type="text"
                    required
                    value={editingQuestion.trapType}
                    onChange={e => setEditingQuestion({ ...editingQuestion, trapType: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-[#181818] border border-[#2a2a2a] text-white"
                  />
                </div>
                <div>
                  <label className="block text-[#aaa] mb-1">เหตุผลที่คนโดนหลอก (Trap Reason)</label>
                  <input
                    type="text"
                    required
                    value={editingQuestion.trapExplanation}
                    onChange={e => setEditingQuestion({ ...editingQuestion, trapExplanation: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-[#181818] border border-[#2a2a2a] text-white"
                  />
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-white text-black font-bold text-xs hover:bg-[#eaeaea] cursor-pointer"
                >
                  บันทึกคำถามลงระบบ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
