"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { RotateCcw, Award, CheckCircle, Sparkles, MapPin, PhoneCall, ShieldCheck } from "lucide-react";
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
    <div className="relative z-10 flex flex-col items-center justify-center min-h-[100dvh] px-3 sm:px-4 py-16 sm:py-20 pointer-events-auto max-w-4xl mx-auto w-full">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full glass-panel glass-panel-glow-red rounded-3xl p-6 sm:p-10 border border-white/15 text-center relative overflow-hidden"
      >
        {/* Top Glowing Core */}
        <div className="inline-flex items-center justify-center p-4 rounded-3xl bg-gradient-to-tr from-red-600 to-amber-500 text-white shadow-xl shadow-red-600/40 mb-6">
          <Award className="w-10 h-10" />
        </div>

        {/* Cinematic Heading */}
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-3">
          The Journey Begins
        </h1>
        <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto mb-6">
          Congratulations <strong className="text-red-400">{studentInfo.fullName || "Creative Pioneer"}</strong>! 
          Your creative assessment has been transmitted to the <strong className="text-white">ICAT Admissions Team</strong>.
        </p>

        {/* Campuses & Contact Quick Ribbon */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-6 text-left">
          <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-white/10 flex items-center gap-3">
            <MapPin className="w-5 h-5 text-red-400 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-white">Chennai Campus</p>
              <p className="text-[11px] text-slate-400">Mylapore / Santhome</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-white/10 flex items-center gap-3">
            <MapPin className="w-5 h-5 text-blue-400 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-white">Bangalore Campus</p>
              <p className="text-[11px] text-slate-400">Hosur Main Road</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-white/10 flex items-center gap-3">
            <MapPin className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-white">Hyderabad Campus</p>
              <p className="text-[11px] text-slate-400">Kothapet / Dilsukhnagar</p>
            </div>
          </div>
        </div>

        {/* Answers Summary Breakdown Accordion/Grid */}
        <div className="my-6 p-4 rounded-2xl bg-slate-950/60 border border-white/10 text-left max-h-56 overflow-y-auto space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Summary of Your Creative Choices</span>
          </div>

          {questions.map((q, idx) => {
            const selected = answers[q.id];
            if (!selected || selected.length === 0) return null;
            return (
              <div key={q.id} className="text-xs border-b border-white/5 pb-2 last:border-b-0">
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
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          {/* Restart Experience Button */}
          <button
            onClick={restartExperience}
            className="btn-3d-red px-8 py-3.5 rounded-2xl flex items-center justify-center gap-2.5 text-sm sm:text-base font-bold text-white shadow-xl"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Explore Again (Restart)</span>
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 mt-6 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Our counseling mentors will connect with you on {studentInfo.phoneNumber || "your phone"}</span>
        </div>
      </motion.div>
    </div>
  );
}
