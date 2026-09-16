import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Trophy, Medal, Clock, ArrowLeft, RefreshCw, Zap, Flame } from 'lucide-react';
import { GameMode, LeaderboardEntry } from '../types.js';
import { api } from '../utils/api.js';

interface LeaderboardViewProps {
  onBack: () => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ onBack }) => {
  const [mode, setMode] = useState<GameMode>('HARD');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = async (selectedMode: GameMode) => {
    setLoading(true);
    try {
      const data = await api.getLeaderboard(selectedMode);
      setEntries(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(mode);
  }, [mode]);

  const formatDuration = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000);
    const m = Math.floor(totalSecs / 60).toString().padStart(2, '0');
    const s = (totalSecs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const getRankBadge = (index: number) => {
    if (index === 0) {
      return (
        <span className="w-7 h-7 rounded-lg bg-amber-400 text-black font-bold flex items-center justify-center text-xs shadow-[0_0_12px_rgba(251,191,36,0.6)]">
          1
        </span>
      );
    }
    if (index === 1) {
      return (
        <span className="w-7 h-7 rounded-lg bg-[#d4d4d4] text-black font-bold flex items-center justify-center text-xs shadow-[0_0_12px_rgba(212,212,212,0.4)]">
          2
        </span>
      );
    }
    if (index === 2) {
      return (
        <span className="w-7 h-7 rounded-lg bg-[#b45309] text-white font-bold flex items-center justify-center text-xs">
          3
        </span>
      );
    }
    return (
      <span className="w-7 h-7 rounded-lg bg-[#1a1a1a] text-[#777] font-mono flex items-center justify-center text-xs">
        {index + 1}
      </span>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          id="btn-leaderboard-back"
          onClick={onBack}
          className="px-3.5 py-2 rounded-xl border border-[#262626] bg-[#121212] text-[#aaa] hover:text-white text-xs font-mono flex items-center gap-2 hover:border-[#444] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>กลับหน้าหลัก</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-mono text-[#888]">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>ตารางจัดอันดับเรียลไทม์</span>
        </div>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
          ตารางอันดับเกียรติยศ (Leaderboard)
        </h1>
        <p className="text-xs sm:text-sm text-[#888] font-mono mt-1">
          จัดเรียงตาม: คะแนนสูงสุด &rarr; หากเท่ากันตัดสินด้วยเวลาที่เร็วกว่า
        </p>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="w-full max-w-md mx-auto grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#111] border border-[#222] mb-8">
        <button
          id="tab-leaderboard-hard"
          onClick={() => setMode('HARD')}
          className={`py-2.5 px-4 rounded-lg font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
            mode === 'HARD'
              ? 'bg-white text-black shadow-sm'
              : 'text-[#888] hover:text-white'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>โหมด HARD (10 ข้อ)</span>
        </button>

        <button
          id="tab-leaderboard-extreme"
          onClick={() => setMode('EXTREME')}
          className={`py-2.5 px-4 rounded-lg font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
            mode === 'EXTREME'
              ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]'
              : 'text-[#888] hover:text-white'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>โหมด EXTREME (20 ข้อ)</span>
        </button>
      </div>

      {/* Table Container */}
      <div className="w-full rounded-2xl border border-[#222] bg-[#0c0c0c] overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.6)]">
        {loading ? (
          <div className="py-16 text-center text-[#777] font-mono text-sm flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-white" />
            <span>กำลังซิงค์ข้อมูลจากฐานข้อมูล...</span>
          </div>
        ) : entries.length === 0 ? (
          <div className="py-16 text-center text-[#777] font-mono text-sm">
            ยังไม่มีบันทึกสถิติในโหมด {mode} เป็นคนแรกที่พิชิตบททดสอบ!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-[#222] bg-[#141414] text-[11px] font-mono text-[#888] uppercase">
                  <th className="py-3 px-4 w-16 text-center">อันดับ</th>
                  <th className="py-3 px-4">ผู้เล่น</th>
                  <th className="py-3 px-4 text-center">คะแนน</th>
                  <th className="py-3 px-4 text-center">เวลา</th>
                  <th className="py-3 px-4 text-center">ค่าประเมิน IQ</th>
                  <th className="py-3 px-4 text-right hidden sm:table-cell">วันที่</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#181818]">
                {entries.map((entry, idx) => (
                  <tr
                    key={entry.id}
                    className={`hover:bg-white/[0.02] transition-colors ${
                      idx < 3 ? 'bg-white/[0.01]' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex justify-center">{getRankBadge(idx)}</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-white">
                      <div className="flex items-center gap-2">
                        <span>{entry.playerName}</span>
                        <span className="text-[11px] text-[#666] font-mono font-normal">
                          (อายุ {entry.playerAge})
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-mono font-bold text-white text-base">
                        {entry.score}
                      </span>
                      <span className="text-[10px] text-[#666] font-mono"> / {entry.totalQuestions}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-xs text-[#aaa]">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#666]" />
                        {formatDuration(entry.durationMs)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-xs text-purple-300">
                      {entry.iqEstimate || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-right text-[11px] font-mono text-[#555] hidden sm:table-cell">
                      {new Date(entry.createdAt).toLocaleDateString('th-TH', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
