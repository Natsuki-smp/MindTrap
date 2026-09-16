import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, XCircle, AlertTriangle, ArrowRight, Clock, ShieldAlert, BookOpen } from 'lucide-react';
import { ClientQuestion, QuestionAnswerRecord } from '../types.js';
import { sfx } from '../utils/audio.js';

interface QuizViewProps {
  playerName: string;
  mode: 'HARD' | 'EXTREME';
  currentQuestionIndex: number;
  totalQuestions: number;
  currentQuestion: ClientQuestion | null;
  score: number;
  onSubmitAnswer: (selectedIndex: number) => Promise<any>;
  onNextQuestion: () => void;
  lastAnswerRecord: QuestionAnswerRecord | null;
  soundEnabled: boolean;
  submitting: boolean;
}

export const QuizView: React.FC<QuizViewProps> = ({
  playerName,
  mode,
  currentQuestionIndex,
  totalQuestions,
  currentQuestion,
  score,
  onSubmitAnswer,
  onNextQuestion,
  lastAnswerRecord,
  soundEnabled,
  submitting
}) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState<boolean>(false);
  const [seconds, setSeconds] = useState<number>(0);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // When question changes, reset selection
  useEffect(() => {
    setSelectedOption(null);
    setShowFeedbackModal(false);
  }, [currentQuestionIndex]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleSelect = (idx: number) => {
    if (submitting || showFeedbackModal) return;
    if (soundEnabled) sfx.playSelect();
    setSelectedOption(idx);
  };

  const handleSubmit = async () => {
    if (selectedOption === null || submitting) return;
    if (soundEnabled) sfx.playClick();
    try {
      const res = await onSubmitAnswer(selectedOption);
      if (soundEnabled) {
        if (res.answerRecord.isCorrect) {
          sfx.playCorrect();
        } else {
          sfx.playWrong();
        }
      }
      setShowFeedbackModal(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleProceedNext = () => {
    if (soundEnabled) sfx.playClick();
    setShowFeedbackModal(false);
    onNextQuestion();
  };

  const progressPercent = Math.round(((currentQuestionIndex) / totalQuestions) * 100);

  if (!currentQuestion) {
    return (
      <div className="w-full max-w-xl mx-auto py-20 text-center">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-mono text-[#888]">กำลังโหลดคำถามจากระบบ No-Repeat...</p>
      </div>
    );
  }

  const optionLabels = ['A', 'B', 'C', 'D'];

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-6 sm:py-10">
      {/* Top Status Bar */}
      <div className="mb-6 p-4 rounded-xl border border-[#222] bg-[#0d0d0d] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <div>
            <div className="text-xs font-semibold text-white flex items-center gap-2">
              <span>{playerName}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                mode === 'HARD' ? 'bg-white/10 text-white' : 'bg-red-500/20 text-red-300'
              }`}>
                {mode}
              </span>
            </div>
            <div className="text-[11px] text-[#777] font-mono">
              คะแนนปัจจุบัน: <span className="text-white font-bold">{score}</span> / {totalQuestions}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs font-mono text-[#aaa]">
            <Clock className="w-3.5 h-3.5 text-[#666]" />
            <span>{formatTime(seconds)}</span>
          </div>

          <div className="text-right">
            <span className="text-xs font-mono font-bold text-white">
              ข้อ {currentQuestionIndex + 1}
            </span>
            <span className="text-[11px] font-mono text-[#777]"> / {totalQuestions}</span>
          </div>
        </div>

        {/* Linear Progress Bar */}
        <div className="w-full bg-[#1e1e1e] h-1.5 rounded-full overflow-hidden mt-1">
          <motion.div
            className="h-full bg-white transition-all duration-300 shadow-[0_0_8px_rgba(255,255,255,0.8)]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Question Card */}
      <motion.div
        key={currentQuestion.id}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="p-6 sm:p-8 rounded-2xl border border-[#262626] bg-[#0e0e0e] shadow-[0_0_40px_rgba(0,0,0,0.6)] mb-6"
      >
        {/* Category Badge */}
        <div className="flex items-center justify-between mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/15 bg-white/5 text-white/90 text-xs font-mono">
            <BookOpen className="w-3 h-3 text-[#aaa]" />
            <span>{currentQuestion.category}</span>
          </span>
          <span className="text-[10px] font-mono text-[#666]">
            ID: {currentQuestion.id}
          </span>
        </div>

        {/* Question Statement */}
        <h2 className="text-base sm:text-xl font-semibold text-white leading-relaxed mb-8">
          {currentQuestion.question}
        </h2>

        {/* 4 Choices */}
        <div className="flex flex-col gap-3">
          {currentQuestion.options.map((optionText, idx) => {
            const isSelected = selectedOption === idx;
            return (
              <button
                key={idx}
                id={`btn-option-${idx}`}
                onClick={() => handleSelect(idx)}
                disabled={submitting || showFeedbackModal}
                className={`w-full p-4 rounded-xl border text-left transition-all flex items-start gap-3.5 cursor-pointer ${
                  isSelected
                    ? 'border-white bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.15)]'
                    : 'border-[#242424] bg-[#141414] text-[#ccc] hover:border-[#383838] hover:bg-[#181818]'
                }`}
              >
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 transition-colors ${
                  isSelected ? 'bg-white text-black' : 'bg-[#222] text-[#888]'
                }`}>
                  {optionLabels[idx]}
                </span>
                <span className="text-sm sm:text-base leading-relaxed pt-0.5">
                  {optionText}
                </span>
              </button>
            );
          })}
        </div>

        {/* Submit Button */}
        <div className="mt-8 flex justify-end">
          <button
            id="btn-submit-answer"
            onClick={handleSubmit}
            disabled={selectedOption === null || submitting || showFeedbackModal}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white text-black font-bold text-sm sm:text-base flex items-center justify-center gap-2 hover:bg-[#eaeaea] transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(255,255,255,0.2)] cursor-pointer"
          >
            {submitting ? (
              <span>กำลังตรวจสอบผลทางตรรกะ...</span>
            ) : (
              <>
                <span>ยืนยันคำตอบ</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </motion.div>

      {/* Answer Feedback Modal / Overlay */}
      <AnimatePresence>
        {showFeedbackModal && lastAnswerRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-lg rounded-2xl border border-[#2a2a2a] bg-[#101010] p-6 sm:p-8 text-white shadow-[0_0_60px_rgba(0,0,0,0.9)]"
            >
              {/* Header: Correct / Wrong */}
              <div className="flex items-center gap-3 mb-5">
                {lastAnswerRecord.isCorrect ? (
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 flex items-center justify-center">
                    <XCircle className="w-7 h-7" />
                  </div>
                )}
                <div>
                  <h3 className={`text-xl font-black uppercase tracking-tight ${
                    lastAnswerRecord.isCorrect ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {lastAnswerRecord.isCorrect ? 'ถูกต้อง (+1 คะแนน)' : 'ไม่ถูกต้อง (0 คะแนน)'}
                  </h3>
                  <div className="text-xs text-[#888] font-mono mt-0.5">
                    คำตอบที่ถูกต้องคือ: <span className="text-white font-bold">{optionLabels[lastAnswerRecord.correctIndex]}</span>
                  </div>
                </div>
              </div>

              {/* Explanation */}
              <div className="p-4 rounded-xl border border-[#222] bg-[#141414] mb-4">
                <div className="text-xs font-mono text-[#aaa] uppercase mb-1.5 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-white" />
                  <span>คำอธิบายเชิงตรรกะ (Explanation):</span>
                </div>
                <p className="text-sm text-[#ddd] leading-relaxed">
                  {lastAnswerRecord.explanation}
                </p>
              </div>

              {/* Trap / Insight Breakdown */}
              <div className="p-4 rounded-xl border border-amber-500/25 bg-amber-950/20 mb-6">
                <div className="text-xs font-mono text-amber-300 uppercase mb-1 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>กับดักทางความคิด: {lastAnswerRecord.trapType}</span>
                </div>
                <p className="text-xs text-amber-200/90 leading-relaxed">
                  {lastAnswerRecord.trapExplanation}
                </p>
              </div>

              {/* Next Button */}
              <button
                id="btn-feedback-next"
                onClick={handleProceedNext}
                className="w-full py-3.5 px-6 rounded-xl bg-white text-black font-bold text-sm sm:text-base flex items-center justify-center gap-2 hover:bg-[#eaeaea] transition-all cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.2)]"
              >
                <span>{currentQuestionIndex + 1 >= totalQuestions ? 'ดูผลการประเมินและจัดอันดับ' : 'ไปยังข้อถัดไป'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
