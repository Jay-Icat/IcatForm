"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ArrowRight, ArrowLeft, HelpCircle, Layers, CheckCircle2 } from "lucide-react";
import { useQuiz } from "@/context/QuizContext";
import { sound } from "@/lib/sound";

export function QuizCard() {
  const {
    questions,
    currentQuestionIndex,
    answers,
    selectOption,
    nextQuestion,
    prevQuestion,
    isSubmitting,
  } = useQuiz();

  const currentQ = questions[currentQuestionIndex];
  if (!currentQ) return null;

  const totalQ = questions.length;
  const progressPercent = ((currentQuestionIndex + 1) / totalQ) * 100;
  const currentSelected = answers[currentQ.id] || [];
  const hasSelection = currentSelected.length > 0;
  const isLastQuestion = currentQuestionIndex === totalQ - 1;
  const isMulti = currentQ.type === "multiple";

  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-20 pointer-events-auto max-w-3xl mx-auto">
      {/* Top Floating Progress & Info Bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full mb-6 glass-panel rounded-2xl p-4 border border-white/10 flex flex-col gap-2.5 shadow-xl"
      >
        <div className="flex items-center justify-between text-xs sm:text-sm font-semibold">
          <span className="flex items-center gap-2 text-slate-300">
            <Layers className="w-4 h-4 text-blue-400" />
            <span>Question {currentQuestionIndex + 1} of {totalQ}</span>
          </span>

          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-500/10 border border-red-500/30 text-red-400">
            {currentQ.category || (isMulti ? "Multi-Select" : "Single-Select")}
          </span>
        </div>

        {/* Progress Bar Track */}
        <div className="w-full h-2 bg-slate-800/80 rounded-full overflow-hidden relative">
          <motion.div
            className="h-full bg-gradient-to-r from-red-600 via-amber-400 to-blue-500 rounded-full"
            initial={{ width: `${((currentQuestionIndex) / totalQ) * 100}%` }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
      </motion.div>

      {/* Main Question & Options Glass Container */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQ.id}
          initial={{ opacity: 0, scale: 0.95, x: 20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.95, x: -20 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="w-full glass-panel glass-panel-glow-red rounded-3xl p-6 sm:p-8 border border-white/15 relative overflow-hidden"
        >
          {/* Question Header */}
          <div className="space-y-2 mb-6">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span>{isMulti ? "Multiple Choice (Select all that apply)" : "Single Choice (Select 1 option)"}</span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white leading-snug">
              {currentQ.questionText}
            </h2>
          </div>

          {/* 4 Interactive 3D Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-8">
            {currentQ.options.map((opt, optIdx) => {
              const isSelected = currentSelected.includes(opt.text);
              const optionLetters = ["A", "B", "C", "D"];

              return (
                <motion.button
                  key={opt.id || optIdx}
                  type="button"
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.985 }}
                  onMouseEnter={() => sound.playHover()}
                  onClick={() => selectOption(currentQ.id, opt.text, isMulti)}
                  className={`group relative text-left p-4 rounded-2xl border transition-all duration-200 flex items-start gap-3.5 option-card ${
                    isSelected
                      ? "option-card-selected"
                      : "bg-slate-900/60 border-white/10 hover:border-white/25 hover:bg-slate-800/60"
                  }`}
                >
                  {/* Option Badge A / B / C / D */}
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-colors ${
                      isSelected
                        ? "bg-red-600 text-white shadow-lg shadow-red-600/40"
                        : "bg-slate-800 text-slate-400 group-hover:text-white group-hover:bg-slate-700"
                    }`}
                  >
                    {isSelected ? <Check className="w-4 h-4 stroke-[3]" /> : optionLetters[optIdx]}
                  </div>

                  {/* Option Text */}
                  <span className="text-sm sm:text-base font-medium text-slate-200 group-hover:text-white pt-1 leading-snug">
                    {opt.text}
                  </span>
                </motion.button>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between gap-4 pt-4 border-t border-white/10">
            {/* Previous Button */}
            <button
              type="button"
              onClick={prevQuestion}
              disabled={currentQuestionIndex === 0}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all ${
                currentQuestionIndex === 0
                  ? "opacity-30 cursor-not-allowed text-slate-500"
                  : "glass-panel text-slate-300 hover:text-white hover:border-white/25"
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            {/* Next / Submit Button */}
            <button
              type="button"
              onClick={nextQuestion}
              disabled={!hasSelection || isSubmitting}
              className={`group relative overflow-hidden rounded-xl p-[1px] transition-all ${
                hasSelection && !isSubmitting
                  ? "bg-gradient-to-r from-red-600 via-red-500 to-blue-600 hover:scale-105 active:scale-95 shadow-lg shadow-red-600/30"
                  : "opacity-40 cursor-not-allowed bg-slate-800"
              }`}
            >
              <div className="flex items-center justify-center gap-2 rounded-[11px] bg-slate-950/80 px-6 py-3 text-sm sm:text-base font-bold text-white transition-colors group-hover:bg-transparent">
                {isSubmitting ? (
                  <span>Processing...</span>
                ) : isLastQuestion ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Complete Assessment</span>
                  </>
                ) : (
                  <>
                    <span>Next Question</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </div>
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
