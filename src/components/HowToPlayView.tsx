import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, CheckCircle, ShieldAlert, Sparkles, Lock, Trophy, Brain, Flame } from 'lucide-react';

interface HowToPlayViewProps {
  onBack: () => void;
}

export const HowToPlayView: React.FC<HowToPlayViewProps> = ({ onBack }) => {
  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          id="btn-howtoplay-back"
          onClick={onBack}
          className="px-3.5 py-2 rounded-xl border border-[#262626] bg-[#121212] text-[#aaa] hover:text-white text-xs font-mono flex items-center gap-2 hover:border-[#444] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>กลับหน้าหลัก</span>
        </button>

        <span className="text-xs font-mono text-[#777]">PROTOCOL GUIDELINES</span>
      </div>

      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
          วิธีเล่นและกติกาการจัดอันดับ
        </h1>
        <p className="text-xs sm:text-sm text-[#888] font-mono mt-1">
          ระบบประเมินตรรกะและการคิดวิเคราะห์ขั้นสูง No-Repeat System
        </p>
      </div>

      {/* Rules Cards */}
      <div className="flex flex-col gap-4 mb-8">
        {/* Rule 1 */}
        <div className="p-5 rounded-2xl border border-[#222] bg-[#0d0d0d] flex items-start gap-4">
          <div className="w-9 h-9 rounded-xl bg-white/10 text-white flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
            1
          </div>
          <div>
            <h3 className="font-bold text-white text-base mb-1">
              รูปแบบคำถาม 4 ตัวเลือก คำตอบถูกต้องเพียง 1 ข้อ
            </h3>
            <p className="text-xs sm:text-sm text-[#aaa] leading-relaxed">
              คำถามจะประเมินด้าน Logic, Critical Thinking, Probability, Pattern, Deduction, และ Conditional Reasoning คำถามส่วนใหญ่มี &quot;กับดักความคิด&quot; (Hidden Traps, Assumptions, Negation) ที่ล่อลวงสัญชาตญาณ โปรดใช้เหตุผลเชิงตรรกะอย่างรอบคอบ
            </p>
          </div>
        </div>

        {/* Rule 2 */}
        <div className="p-5 rounded-2xl border border-[#222] bg-[#0d0d0d] flex items-start gap-4">
          <div className="w-9 h-9 rounded-xl bg-white/10 text-white flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
            2
          </div>
          <div>
            <h3 className="font-bold text-white text-base mb-1">
              ระบบ No-Repeat (ห้ามแจกคำถามซ้ำตลอดไป)
            </h3>
            <p className="text-xs sm:text-sm text-[#aaa] leading-relaxed">
              คำถามทุกข้อที่ถูกจัดสรรให้ผู้เล่นคนใดแล้ว จะถูกบันทึกในฐานข้อมูล <span className="text-white font-mono">questionAllocations</span> และจะไม่ถูกนำกลับมาใช้ซ้ำกับผู้เล่นคนใดอีกตลอดไป แม้จะเปลี่ยนเครื่องหรือผู้เล่นใหม่ คลังคำถามจะได้รับการตรวจสอบความซ้ำซ้อนอย่างเข้มงวด
            </p>
          </div>
        </div>

        {/* Rule 3 */}
        <div className="p-5 rounded-2xl border border-[#222] bg-[#0d0d0d] flex items-start gap-4">
          <div className="w-9 h-9 rounded-xl bg-white/10 text-white flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
            3
          </div>
          <div>
            <h3 className="font-bold text-white text-base mb-1">
              ระบบ Replay Lock & Resume
            </h3>
            <p className="text-xs sm:text-sm text-[#aaa] leading-relaxed">
              ผู้เล่นและอุปกรณ์แต่ละเครื่องมีสิทธิ์ทำบททดสอบเพียง <span className="text-white font-semibold">1 ครั้งเท่านั้น</span> เพื่อความเที่ยงตรงของตารางคะแนนอันดับ เมื่อเล่นจบแล้วจะไม่สามารถเล่นซ้ำได้ (Replay Lock) หากรีเฟรชหน้าจอระหว่างทำแบบทดสอบ ระบบจะ <span className="text-white font-semibold">Resume</span> ให้เล่นต่อจากข้อเดิมอัตโนมัติ
            </p>
          </div>
        </div>

        {/* Rule 4 */}
        <div className="p-5 rounded-2xl border border-[#222] bg-[#0d0d0d] flex items-start gap-4">
          <div className="w-9 h-9 rounded-xl bg-white/10 text-white flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
            4
          </div>
          <div>
            <h3 className="font-bold text-white text-base mb-1">
              ระบบคะแนนและการประเมินค่า IQ
            </h3>
            <p className="text-xs sm:text-sm text-[#aaa] leading-relaxed">
              • โหมด HARD: 10 ข้อ (ข้อละ 1 คะแนน เต็ม 10 คะแนน) มีความลึกและซับซ้อนมาก<br />
              • โหมด EXTREME: 20 ข้อ (ข้อละ 1 คะแนน เต็ม 20 คะแนน) วัดความคงเส้นคงวาและสมาธิระยะยาว<br />
              ระบบ Backend จะตรวจคำตอบและคำนวณคะแนนเอง พร้อมเฉลยละเอียดและวิเคราะห์กับดักทางความคิด และแสดงค่าประเมิน IQ จากเกม (เพื่อความสนุกเท่านั้น)
            </p>
          </div>
        </div>

        {/* Rule 5 */}
        <div className="p-5 rounded-2xl border border-[#222] bg-[#0d0d0d] flex items-start gap-4">
          <div className="w-9 h-9 rounded-xl bg-white/10 text-white flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
            5
          </div>
          <div>
            <h3 className="font-bold text-white text-base mb-1">
              รางวัลวิดีโอ (Video Reward)
            </h3>
            <p className="text-xs sm:text-sm text-[#aaa] leading-relaxed">
              เมื่อทำคะแนนถึงเกณฑ์ที่ระบบกำหนด ผู้เล่นจะปลดล็อกวิดีโอของรางวัลระดับพิเศษ ซึ่งจะเล่นอัตโนมัติพร้อมเสียงแบบ Loop ตลอดเวลาเพื่อเฉลิมฉลองผลลัพธ์
            </p>
          </div>
        </div>
      </div>

      <div className="text-center">
        <button
          id="btn-howtoplay-start"
          onClick={onBack}
          className="py-3 px-8 rounded-xl bg-white text-black font-bold text-sm hover:bg-[#eaeaea] transition-all cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.2)]"
        >
          เข้าใจแล้ว กลับหน้าหลัก
        </button>
      </div>
    </div>
  );
};
