import React from 'react';
import { Shield, Database, Volume2, VolumeX } from 'lucide-react';

interface HeaderProps {
  onGoHome: () => void;
  onOpenAdmin: () => void;
  dbStatus?: { connected: boolean; type: string };
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onGoHome,
  onOpenAdmin,
  dbStatus,
  soundEnabled,
  onToggleSound
}) => {
  return (
    <header className="w-full border-b border-[#222] bg-[#080808]/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo / Brand */}
        <button
          id="btn-header-home"
          onClick={onGoHome}
          className="flex items-center gap-3 text-left group transition-all"
        >
          <div className="w-9 h-9 rounded-lg bg-white text-black flex items-center justify-center font-bold text-lg shadow-[0_0_15px_rgba(255,255,255,0.2)] group-hover:scale-105 transition-transform">
            😎
          </div>
          <div>
            <div className="font-bold tracking-wider text-sm sm:text-base text-white flex items-center gap-2">
              <span>ตอบคำถามแบบจัดอันดับ</span>
            </div>
            <div className="text-[10px] text-[#777] font-mono tracking-widest uppercase">
              No-Repeat • Replay Lock
            </div>
          </div>
        </button>

        {/* Right status & controls */}
        <div className="flex items-center gap-3">
          {/* DB Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#222] bg-[#111] text-[11px] font-mono text-[#aaa]">
            <span className={`w-2 h-2 rounded-full ${dbStatus?.connected ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-amber-400 animate-pulse'}`} />
            <Database className="w-3 h-3 text-[#777]" />
            <span>{dbStatus?.type === 'firebase' ? 'FIRESTORE' : 'LOCAL ENGINE'}</span>
          </div>

          {/* Sound Toggle */}
          <button
            id="btn-header-sound"
            onClick={onToggleSound}
            aria-label="Toggle Sound"
            className="w-9 h-9 rounded-lg border border-[#262626] bg-[#121212] flex items-center justify-center text-[#888] hover:text-white hover:border-[#444] transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-white" /> : <VolumeX className="w-4 h-4 text-[#666]" />}
          </button>

          {/* Admin shortcut icon */}
          <button
            id="btn-header-admin"
            onClick={onOpenAdmin}
            title="เข้าสู่ระบบผู้ดูแล"
            className="w-9 h-9 rounded-lg border border-[#262626] bg-[#121212] flex items-center justify-center text-[#888] hover:text-white hover:border-[#444] transition-colors"
          >
            <Shield className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
