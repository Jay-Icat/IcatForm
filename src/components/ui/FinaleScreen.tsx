"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { RotateCcw, Award, CheckCircle, MapPin, ShieldCheck } from "lucide-react";
import { useQuiz } from "@/context/QuizContext";

export function FinaleScreen() {
  const { studentInfo, answers, questions, restartExperience } = useQuiz();

  useEffect(() => {
    // Launch celebratory confetti bursts
    const end = Date.now() + 2.5 * 1000;
    const colors = ["#dc2626", "#2563eb", "#fbbf24", "#ffffff"];

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }, []);

  return (
    <div className="relative z-10 flex flex-col items-center justify-center h-full max-h-[100dvh] px-3 sm:px-4 py-8 pointer-events-auto max-w-4xl mx-auto w-full overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full glass-panel glass-panel-glow-red rounded-3xl p-5 sm:p-8 border border-white/15 text-center relative overflow-y-auto max-h-[88dvh] bg-slate-950/85 shadow-2xl"
      >
        {/* Top Glowing Core */}
        <div className="inline-flex items-center justify-center p-3 sm:p-4 rounded-3xl bg-gradient-to-tr from-red-600 to-amber-500 text-white shadow-xl shadow-red-600/40 mb-4">
          <Award className="w-8 sm:w-10 h-8 sm:h-10" />
        </div>

        {/* Cinematic Heading */}
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-2">
          The Journey Begins
        </h1>
        <p className="text-xs sm:text-base text-slate-300 max-w-xl mx-auto mb-4">
          Congratulations <strong className="text-red-400">{studentInfo.fullName || "Creative Pioneer"}</strong>! 
          Your creative assessment has been transmitted to the <strong className="text-white">ICAT Admissions Team</strong>.
        </p>

        {/* Campuses & Contact Quick Ribbon */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 my-4 text-left">
          <div className="p-3 rounded-2xl bg-slate-900/70 border border-white/10 flex items-center gap-3">
            <MapPin className="w-4 h-4 text-red-400 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-white">Chennai Campus</p>
              <p className="text-[10px] text-slate-400">Mylapore / Santhome</p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/70 border border-white/10 flex items-center gap-3">
            <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-white">Bangalore Campus</p>
              <p className="text-[10px] text-slate-400">Hosur Main Road</p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/70 border border-white/10 flex items-center gap-3">
            <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-white">Hyderabad Campus</p>
              <p className="text-[10px] text-slate-400">Kothapet / Dilsukhnagar</p>
            </div>
          </div>
        </div>

        {/* Answers Summary Breakdown */}
        <div className="my-4 p-3.5 rounded-2xl bg-slate-950/60 border border-white/10 text-left max-h-48 overflow-y-auto space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Summary of Your Creative Choices</span>
          </div>

          {questions.map((q, idx) => {
            const selected = answers[q.id];
            if (!selected || selected.length === 0) return null;
            return (
              <div key={q.id} className="text-xs border-b border-white/5 pb-1.5 last:border-b-0">
                <p className="text-slate-400 font-medium">Q{idx + 1}: {q.questionText}</p>
                <p className="text-white font-semibold mt-0.5 flex items-center gap-1.5 text-red-300">
                  <span>▸</span>
                  <span>{Array.isArray(selected) ? selected.join(", ") : selected}</span>
                </p>
              </div>
            );
          })}
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <button
            onClick={restartExperience}
            className="btn-3d-red px-7 py-3 rounded-2xl flex items-center justify-center gap-2 text-xs sm:text-sm font-bold text-white shadow-xl cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Explore Again (Restart)</span>
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 mt-4 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Our counseling mentors will connect with you on {studentInfo.phoneNumber || "your phone"}</span>
        </div>
      </motion.div>
    </div>
  );
}
