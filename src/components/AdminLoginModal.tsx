import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Lock, KeyRound, AlertCircle, ArrowRight } from 'lucide-react';
import { api } from '../utils/api.js';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (token: string) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('กรุณากรอกรหัสผ่านผู้ดูแล');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.adminLogin(password);
      if (res.success && res.token) {
        onSuccess(res.token);
      } else {
        setError(res.error || 'รหัสผ่านไม่ถูกต้อง');
      }
    } catch (err: any) {
      setError(err.message || 'เข้าสู่ระบบไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md rounded-2xl border border-[#333] bg-[#0f0f0f] text-white p-6 sm:p-8 shadow-[0_0_50px_rgba(0,0,0,0.9)] relative"
      >
        <button
          id="btn-close-admin-login"
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-lg border border-[#222] bg-[#141414] text-[#888] hover:text-white flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center">
            <Lock className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              เข้าสู่ระบบผู้ดูแล (Admin)
            </h2>
            <div className="text-[11px] text-[#777] font-mono">
              SYSTEM CONTROL PROTOCOL
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="input-admin-password" className="block text-xs font-semibold text-[#ccc] mb-1.5 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-[#888]" />
              <span>รหัสผ่านความปลอดภัย (Admin Password)</span>
            </label>
            <input
              id="input-admin-password"
              type="password"
              autoFocus
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="กรอกรหัสผ่านเพื่อปลดล็อกระบบ"
              className="w-full px-4 py-3 rounded-xl border border-[#2c2c2c] bg-[#161616] text-white placeholder-[#555] text-sm focus:outline-none focus:border-white font-mono transition-colors"
            />
          </div>

          {error && (
            <div className="text-xs text-red-400 bg-red-950/30 border border-red-800/40 p-2.5 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-2">
            <button
              id="btn-submit-admin-login"
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-xl bg-white text-black font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#eaeaea] transition-all disabled:opacity-50 cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            >
              {loading ? (
                <span>กำลังยืนยันสิทธิ์...</span>
              ) : (
                <>
                  <span>เข้าสู่ระบบ Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
