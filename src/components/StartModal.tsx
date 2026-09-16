import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowRight, Zap, Flame, User, Calendar } from 'lucide-react';
import { GameMode } from '../types.js';

interface StartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (playerName: string, playerAge: number, mode: GameMode) => void;
  loading: boolean;
}

export const StartModal: React.FC<StartModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  loading
}) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState<string>('24');
  const [mode, setMode] = useState<GameMode>('HARD');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('กรุณาระบุชื่อผู้เล่น');
      return;
    }
    const ageNum = parseInt(age, 10);
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
      setError('กรุณาระบุอายุที่ถูกต้อง (1-120 ปี)');
      return;
    }
    setError('');
    onConfirm(name.trim(), ageNum, mode);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-lg rounded-2xl border border-[#262626] bg-[#0c0c0c] text-white p-6 sm:p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative"
        >
          {/* Close button */}
          <button
            id="btn-close-start-modal"
            onClick={onClose}
            disabled={loading}
            className="absolute top-5 right-5 w-8 h-8 rounded-lg border border-[#222] bg-[#141414] text-[#888] hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="mb-6">
            <span className="text-[10px] font-mono tracking-widest text-[#777] uppercase">
              PLAYER REGISTRATION
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-white mt-1">
              ลงทะเบียนเข้าสู่บททดสอบ
            </h2>
            <p className="text-xs text-[#999] mt-1">
              คำถามชุดนี้ถูกจัดสรรแบบ No-Repeat และมีผลต่อการจัดอันดับสถิติ
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Player Name */}
            <div>
              <label htmlFor="input-player-name" className="block text-xs font-semibold text-[#ccc] mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#888]" />
                <span>ชื่อผู้เล่น (Player Name) *</span>
              </label>
              <input
                id="input-player-name"
                type="text"
                maxLength={30}
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="เช่น Neo, Cipher, Alex"
                className="w-full px-4 py-3 rounded-xl border border-[#2a2a2a] bg-[#141414] text-white placeholder-[#555] text-sm focus:outline-none focus:border-white transition-colors"
              />
            </div>

            {/* Age (For fun only as specified) */}
            <div>
              <label htmlFor="input-player-age" className="block text-xs font-semibold text-[#ccc] mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#888]" />
                  <span>อายุ (Age) *</span>
                </span>
                <span className="text-[10px] text-[#777] font-normal font-mono">
                  (อายุใช้เพื่อความสนุกเท่านั้น)
                </span>
              </label>
              <input
                id="input-player-age"
                type="number"
                min={5}
                max={120}
                required
                value={age}
                onChange={e => setAge(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#2a2a2a] bg-[#141414] text-white placeholder-[#555] text-sm focus:outline-none focus:border-white transition-colors"
              />
            </div>

            {/* Mode Selection */}
            <div>
              <label className="block text-xs font-semibold text-[#ccc] mb-2 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#888]" />
                <span>เลือกระดับความยาก (Difficulty Mode)</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* HARD option */}
                <button
                  id="btn-select-mode-hard"
                  type="button"
                  onClick={() => setMode('HARD')}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    mode === 'HARD'
                      ? 'border-white bg-white/10 shadow-[0_0_15px_rgba(255,255,255,0.15)]'
                      : 'border-[#262626] bg-[#121212] hover:border-[#3a3a3a]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-white">HARD</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-white">
                      10 ข้อ
                    </span>
                  </div>
                  <p className="text-[11px] text-[#aaa] leading-snug">
                    ยากมาก และซับซ้อนกว่า EXTREME เน้นตรรกะแบบลึกซึ้งหลายชั้น
                  </p>
                </button>

                {/* EXTREME option */}
                <button
                  id="btn-select-mode-extreme"
                  type="button"
                  onClick={() => setMode('EXTREME')}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    mode === 'EXTREME'
                      ? 'border-red-500 bg-red-950/25 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                      : 'border-[#262626] bg-[#121212] hover:border-[#3a3a3a]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-red-400 flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-red-400" />
                      EXTREME
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-500/20 text-red-300">
                      20 ข้อ
                    </span>
                  </div>
                  <p className="text-[11px] text-[#aaa] leading-snug">
                    ยากมาก บททดสอบมาราธอน 20 ข้อ ประเมินความเร็วและสมาธิ
                  </p>
                </button>
              </div>
            </div>

            {error && (
              <div className="text-xs text-red-400 bg-red-950/30 border border-red-800/40 p-2.5 rounded-lg">
                {error}
              </div>
            )}

            <div className="pt-3">
              <button
                id="btn-submit-start-game"
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-xl bg-white text-black font-bold text-sm sm:text-base flex items-center justify-center gap-2 hover:bg-[#eaeaea] transition-all disabled:opacity-50 cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.2)]"
              >
                {loading ? (
                  <span>กำลังจัดสรรคำถาม No-Repeat...</span>
                ) : (
                  <>
                    <span>เข้าสู่บททดสอบ ({mode})</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
