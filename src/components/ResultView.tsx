import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { Trophy, Award, Lock, Sparkles, Volume2, VolumeX, ArrowRight, Home, Brain, Film } from 'lucide-react';
import { PlayerSession, VideoRewardRule } from '../types.js';

interface ResultViewProps {
  session: PlayerSession;
  onGoHome: () => void;
  onOpenLeaderboard: () => void;
}

export const ResultView: React.FC<ResultViewProps> = ({
  session,
  onGoHome,
  onOpenLeaderboard
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoAudioMuted, setVideoAudioMuted] = useState<boolean>(true);
  const [autoplayBlocked, setAutoplayBlocked] = useState<boolean>(false);

  // Confetti on load
  useEffect(() => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ffffff', '#aaaaaa', '#444444', '#f59e0b']
    });
  }, []);

  // Handle video autoplay following browser autoplay policy safely
  useEffect(() => {
    if (session.videoReward && videoRef.current) {
      const vid = videoRef.current;
      vid.muted = true; // start muted for safe autoplay compliance
      vid.play().then(() => {
        // Autoplay succeeded
        // Attempt to unmute after a tiny delay
        vid.muted = false;
        vid.play().catch(() => {
          // If browser policy blocked unmuted sound, revert to muted and show unmute prompt
          vid.muted = true;
          setAutoplayBlocked(true);
        });
      }).catch(err => {
        console.warn('Video autoplay policy notice:', err);
        setAutoplayBlocked(true);
      });
    }
  }, [session.videoReward]);

  const handleUnmuteClick = () => {
    if (videoRef.current) {
      videoRef.current.muted = false;
      videoRef.current.play();
      setVideoAudioMuted(false);
      setAutoplayBlocked(false);
    }
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return '00:00';
    const totalSecs = Math.floor(ms / 1000);
    const m = Math.floor(totalSecs / 60).toString().padStart(2, '0');
    const s = (totalSecs % 60).toString().padStart(2, '0');
    return `${m}:${s} นาที`;
  };

  const scorePercent = Math.round((session.score / session.totalQuestions) * 100);

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 sm:py-12 flex flex-col items-center">
      {/* Top Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/20 bg-white/5 text-white/90 text-xs font-mono mb-3">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>EVALUATION COMPLETED</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
          ผลการประเมินตรรกะและการจัดอันดับ
        </h1>
        <p className="text-xs sm:text-sm text-[#888] font-mono mt-1">
          ผู้เล่น: <span className="text-white font-semibold">{session.playerName}</span> (อายุ {session.playerAge} ปี) • โหมด {session.mode}
        </p>
      </motion.div>

      {/* Main Score & IQ Grid */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {/* Score Card */}
        <motion.div
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          className="p-6 rounded-2xl border border-[#2a2a2a] bg-[#0e0e0e] flex flex-col items-center justify-center text-center shadow-[0_0_30px_rgba(0,0,0,0.6)]"
        >
          <div className="w-12 h-12 rounded-xl bg-white/10 text-white flex items-center justify-center mb-3">
            <Trophy className="w-6 h-6 text-amber-400" />
          </div>
          <div className="text-xs font-mono text-[#888] uppercase tracking-wider mb-1">
            คะแนนที่ทำได้ (Score)
          </div>
          <div className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight">
            {session.score} <span className="text-xl text-[#666] font-normal">/ {session.totalQuestions}</span>
          </div>
          <div className="mt-2 text-xs font-mono text-emerald-400 bg-emerald-950/30 px-2.5 py-1 rounded-full border border-emerald-800/40">
            ความแม่นยำ {scorePercent}% • เวลา {formatDuration(session.durationMs)}
          </div>
        </motion.div>

        {/* IQ Estimate Card */}
        <motion.div
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          className="p-6 rounded-2xl border border-white/20 bg-gradient-to-br from-[#141414] to-[#0a0a0a] flex flex-col items-center justify-center text-center shadow-[0_0_30px_rgba(255,255,255,0.05)] relative overflow-hidden"
        >
          <div className="w-12 h-12 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 flex items-center justify-center mb-3">
            <Brain className="w-6 h-6 text-purple-300" />
          </div>
          <div className="text-xs font-mono text-[#aaa] uppercase tracking-wider mb-1">
            ค่าประเมิน IQ จากเกม
          </div>
          <div className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight mb-2">
            {session.iqEstimate || '100 – 120+'}
          </div>

          {/* Mandatory Disclaimer as strictly ordered in prompt */}
          <blockquote className="text-[11px] text-[#999] leading-tight px-2 py-1.5 rounded bg-black/40 border border-[#262626] italic">
            “เป็นค่าประเมินเพื่อความสนุก ไม่ใช่ IQ จริงหรือการทดสอบมาตรฐาน”
          </blockquote>
        </motion.div>
      </div>

      {/* Video Reward Section (If matching score range) */}
      {session.videoReward && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full mb-8 rounded-2xl border border-[#333] bg-[#090909] p-4 sm:p-6 shadow-[0_0_40px_rgba(255,255,255,0.08)] relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Film className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-mono font-bold tracking-wider text-white uppercase">
                🎬 วิดีโอของรางวัล: {session.videoReward.title}
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#888]">
              เกณฑ์คะแนน: {session.videoReward.minScore} - {session.videoReward.maxScore}
            </span>
          </div>

          {/* Custom Video Container - Strictly NO Pause / Stop / Seek / Skip UI */}
          <div className="w-full aspect-video rounded-xl overflow-hidden bg-black relative border border-[#222]">
            <video
              ref={videoRef}
              src={session.videoReward.videoUrl}
              autoPlay
              playsInline
              loop
              controls={false} // Strictly forbid user from pausing, seeking or skipping
              className="w-full h-full object-cover pointer-events-none"
            />

            {/* Browser Autoplay Sound Enabler (Adheres strictly to Browser Autoplay Policies) */}
            {autoplayBlocked && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex flex-col items-center justify-center p-4">
                <button
                  id="btn-unmute-video-reward"
                  onClick={handleUnmuteClick}
                  className="px-5 py-2.5 rounded-xl bg-white text-black font-bold text-xs sm:text-sm flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.4)] hover:scale-105 transition-all cursor-pointer"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>แตะเพื่อเปิดเสียงวิดีโอ (Unmute Audio)</span>
                </button>
                <p className="text-[10px] text-white/70 font-mono mt-2 text-center">
                  ตามมาตรฐานความปลอดภัยเบราว์เซอร์ กรุณาสัมผัสเพื่อเริ่มเล่นเสียง
                </p>
              </div>
            )}
          </div>

          <p className="text-xs text-[#888] font-mono mt-3 text-center">
            {session.videoReward.description || 'รางวัลเกียรติยศสำหรับผู้ผ่านการทดสอบตามเกณฑ์ความแม่นยำขั้นสูง'}
          </p>
        </motion.div>
      )}

      {/* Replay Lock Badge Notice */}
      <div className="w-full max-w-md p-3.5 mb-8 rounded-xl border border-[#262626] bg-[#0e0e0e] text-[#aaa] text-xs flex items-center gap-3">
        <Lock className="w-5 h-5 text-[#888] shrink-0" />
        <div>
          <div className="font-semibold text-white">บันทึกผลและล็อกการเล่นซ้ำ (Replay Lock)</div>
          <div className="text-[11px] text-[#777]">
            อุปกรณ์นี้ถูกบันทึกอันดับแล้ว และคำถามถูกตัดออกจากคลังถาวรเพื่อความยุติธรรม
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="w-full max-w-md flex flex-col sm:flex-row gap-3">
        <button
          id="btn-result-leaderboard"
          onClick={onOpenLeaderboard}
          className="flex-1 py-3.5 px-5 rounded-xl bg-white text-black font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#eaeaea] transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] cursor-pointer"
        >
          <Trophy className="w-4 h-4 text-amber-600" />
          <span>ดูตารางอันดับ</span>
        </button>

        <button
          id="btn-result-home"
          onClick={onGoHome}
          className="flex-1 py-3.5 px-5 rounded-xl border border-[#2a2a2a] bg-[#141414] text-white font-medium text-sm flex items-center justify-center gap-2 hover:border-[#444] transition-all cursor-pointer"
        >
          <Home className="w-4 h-4 text-[#888]" />
          <span>กลับหน้าแรก</span>
        </button>
      </div>
    </div>
  );
};
