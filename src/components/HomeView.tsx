import React from 'react';
import { motion } from 'motion/react';
import { Play, Trophy, HelpCircle, Lock, RefreshCw, Sparkles, AlertTriangle, ShieldCheck } from 'lucide-react';
import { GameMode } from '../types.js';

interface HomeViewProps {
  onStartPlay: () => void;
  onOpenLeaderboard: () => void;
  onOpenHowToPlay: () => void;
  onOpenAdmin: () => void;
  onResumeSession?: () => void;
  isDeviceLocked: boolean;
  canResume: boolean;
  lockedMessage?: string;
  activeSessionMode?: GameMode;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onStartPlay,
  onOpenLeaderboard,
  onOpenHowToPlay,
  onOpenAdmin,
  onResumeSession,
  isDeviceLocked,
  canResume,
  lockedMessage,
  activeSessionMode
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 sm:py-14 flex flex-col items-center">
      {/* Futuristic Hero Emblem */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center text-center mb-8 sm:mb-12"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/15 bg-white/5 text-white/80 text-xs font-mono mb-4 tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />
          <span>ELITE COGNITIVE RANKING PROTOCOL</span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white mb-4 uppercase">
          ตอบคำถามแบบจัดอันดับ <span className="inline-block transform hover:rotate-12 transition-transform">😎</span>
        </h1>

        <p className="max-w-xl text-sm sm:text-base text-[#999] leading-relaxed font-light">
          ประเมินสมรรถนะตรรกะ การคิดวิเคราะห์ขั้นสูง และการแก้ปัญหาเชิงอนุมาน
          คำถามทุกข้อมีระบบ <span className="text-white font-medium">No-Repeat</span> ไม่ซ้ำตลอดไป และมีเพียงโอกาสเดียวต่อเครื่องเท่านั้น
        </p>
      </motion.div>

      {/* Replay Lock or Resume Notification Banner */}
      {isDeviceLocked && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md p-4 mb-6 rounded-xl border border-red-500/30 bg-red-950/20 text-red-200 text-sm flex items-start gap-3 shadow-[0_0_20px_rgba(239,68,68,0.1)]"
        >
          <Lock className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-red-300">Replay Locked (เล่นจบแล้ว)</div>
            <div className="text-xs text-red-400/90 mt-0.5">
              {lockedMessage || 'อุปกรณ์นี้ทำแบบทดสอบเสร็จสมบูรณ์แล้ว ไม่สามารถเริ่มเล่นใหม่ได้ตามนโยบายความเป็นกลางในการจัดอันดับ'}
            </div>
          </div>
        </motion.div>
      )}

      {canResume && onResumeSession && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md p-4 mb-6 rounded-xl border border-amber-500/30 bg-amber-950/20 text-amber-200 text-sm flex items-center justify-between shadow-[0_0_20px_rgba(245,158,11,0.1)]"
        >
          <div className="flex items-center gap-3">
            <RefreshCw className="w-5 h-5 text-amber-400 animate-spin" />
            <div>
              <div className="font-semibold text-amber-300">พบการทดสอบที่ค้างอยู่ ({activeSessionMode})</div>
              <div className="text-xs text-amber-400/80">คุณสามารถเล่นต่อจากข้อเดิมได้ทันที</div>
            </div>
          </div>
          <button
            id="btn-resume-session"
            onClick={onResumeSession}
            className="px-4 py-2 rounded-lg bg-amber-400 text-black font-semibold text-xs hover:bg-amber-300 transition-colors shadow-sm"
          >
            เล่นต่อ
          </button>
        </motion.div>
      )}

      {/* Main Action Grid */}
      <div className="w-full max-w-md flex flex-col gap-3.5 mb-14">
        {/* Start Game Button */}
        {!isDeviceLocked ? (
          <motion.button
            id="btn-home-start"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onStartPlay}
            className="w-full py-4 px-6 rounded-xl bg-white text-black font-bold text-base sm:text-lg flex items-center justify-between shadow-[0_0_25px_rgba(255,255,255,0.25)] hover:bg-[#eaeaea] transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center">
                <Play className="w-4 h-4 fill-white ml-0.5" />
              </div>
              <span className="tracking-wide">เริ่มเล่น (Start Play)</span>
            </div>
            <span className="text-xs font-mono uppercase text-black/60 group-hover:translate-x-1 transition-transform">
              เข้าสู่บททดสอบ &rarr;
            </span>
          </motion.button>
        ) : (
          <div className="w-full py-4 px-6 rounded-xl border border-[#262626] bg-[#111] text-[#777] font-semibold text-base flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-[#555]" />
              <span>เริ่มเล่น (ล็อกการเล่นซ้ำแล้ว)</span>
            </div>
            <span className="text-xs font-mono text-[#555]">COMPLETED</span>
          </div>
        )}

        {/* Leaderboard Button */}
        <motion.button
          id="btn-home-leaderboard"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={onOpenLeaderboard}
          className="w-full py-3.5 px-6 rounded-xl border border-[#2a2a2a] bg-[#121212] hover:bg-[#181818] hover:border-[#444] text-white font-medium text-sm sm:text-base flex items-center justify-between transition-all group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#222] text-amber-400 flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </div>
            <span>ตารางอันดับ (Leaderboard)</span>
          </div>
          <span className="text-xs font-mono text-[#666] group-hover:text-[#aaa] transition-colors">
            ดูสถิติ &rarr;
          </span>
        </motion.button>

        {/* How to Play Button */}
        <motion.button
          id="btn-home-howtoplay"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={onOpenHowToPlay}
          className="w-full py-3.5 px-6 rounded-xl border border-[#2a2a2a] bg-[#121212] hover:bg-[#181818] hover:border-[#444] text-white font-medium text-sm sm:text-base flex items-center justify-between transition-all group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#222] text-blue-400 flex items-center justify-center">
              <HelpCircle className="w-4 h-4" />
            </div>
            <span>วิธีเล่น (How to Play)</span>
          </div>
          <span className="text-xs font-mono text-[#666] group-hover:text-[#aaa] transition-colors">
            อ่านกฎ &rarr;
          </span>
        </motion.button>
      </div>

      {/* Mode Brief Preview */}
      <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-4 mb-16">
        <div className="p-4 rounded-xl border border-[#222] bg-[#0c0c0c] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-white/10 text-white">
                MODE: HARD
              </span>
              <span className="text-xs text-[#888] font-mono">10 ข้อ • 10 คะแนน</span>
            </div>
            <p className="text-xs text-[#aaa] leading-relaxed">
              โจทย์ตรรกะหลายมิติ มีความซับซ้อนและกับดักความคิดลึกซึ้ง เหมาะสำหรับผู้ที่ต้องการทดสอบการตัดสินใจเชิงวิเคราะห์
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-[#222] bg-[#0c0c0c] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                MODE: EXTREME
              </span>
              <span className="text-xs text-[#888] font-mono">20 ข้อ • 20 คะแนน</span>
            </div>
            <p className="text-xs text-[#aaa] leading-relaxed">
              บททดสอบมาราธอนตรรกะขั้นยากมาก ประเมินความคงเส้นคงวาและสมาธิการใช้เหตุผลเชิงสถิติและแบบแผน
            </p>
          </div>
        </div>
      </div>

      {/* Mandatory Bottom Admin Link (Prompt: Admin อยู่ล่างสุด) */}
      <div className="w-full pt-8 border-t border-[#1a1a1a] flex flex-col items-center text-center">
        <button
          id="btn-home-admin-bottom"
          onClick={onOpenAdmin}
          className="text-xs text-[#666] hover:text-[#bbb] flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-[#141414] transition-all cursor-pointer font-mono"
        >
          <Lock className="w-3.5 h-3.5 text-[#555]" />
          <span>🔐 ผู้ดูแลระบบ (Admin)</span>
        </button>
        <p className="text-[11px] text-[#444] font-mono mt-2">
          Secure Cloud Backend • Zero-Trust Rules • Anti-Cheat Verification
        </p>
      </div>
    </div>
  );
};
