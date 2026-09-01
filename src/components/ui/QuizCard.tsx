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
    <div className="relative z-10 flex flex-col items-center justify-center h-full px-3 sm:px-4 py-14 pointer-events-auto max-w-3xl mx-auto w-full">
      {/* Top Floating Progress & Info Bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full mb-3 sm:mb-4 glass-panel rounded-2xl p-3 sm:p-4 border border-white/10 flex flex-col gap-2 shadow-xl bg-slate-950/80 flex-shrink-0"
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
          className="w-full glass-panel glass-panel-glow-red rounded-3xl p-5 sm:p-7 border border-white/15 relative overflow-y-auto max-h-[72dvh] bg-slate-950/85 shadow-2xl"
        >
          {/* Question Header */}
          <div className="space-y-1.5 pb-4 border-b border-white/10">
            <div className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase tracking-wider">
              <HelpCircle className="w-4 h-4" />
              <span>{isMulti ? "Select All That Apply" : "Choose Your Preferred Option"}</span>
            </div>
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white leading-snug">
              {currentQ.questionText}
            </h3>
          </div>

          {/* Options Grid (4 Tactile Option Cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-4">
            {currentQ.options.map((option, idx) => {
              const isSelected = currentSelected.includes(option.text);
              const letter = ["A", "B", "C", "D"][idx] || `${idx + 1}`;

              return (
                <div
                  key={option.id || idx}
                  onClick={() => selectOption(currentQ.id, option.text, isMulti)}
                  onMouseEnter={sound.playHover}
                  className={`option-card p-4 rounded-2xl border flex items-start gap-3.5 cursor-pointer select-none transition-all ${
                    isSelected
                      ? "option-card-selected"
                      : "bg-slate-900/70 border-white/10 hover:border-red-500/40 text-slate-300 hover:text-white"
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs flex-shrink-0 transition-all ${
                      isSelected
                        ? "bg-red-500 text-white shadow-lg shadow-red-500/50"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {isSelected ? <Check className="w-4 h-4" /> : letter}
                  </div>

                  <div className="flex-1">
                    <p className={`text-xs sm:text-sm font-semibold leading-relaxed ${isSelected ? "text-white" : ""}`}>
                      {option.text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between gap-4 pt-3 border-t border-white/10">
            {/* Previous Button */}
            <button
              type="button"
              onClick={prevQuestion}
              disabled={currentQuestionIndex === 0}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
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
              className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold text-white transition-all ${
                hasSelection && !isSubmitting
                  ? "btn-3d-red shadow-xl cursor-pointer"
                  : "opacity-40 cursor-not-allowed bg-slate-800 border border-white/10"
              }`}
            >
              {isSubmitting ? (
                <span>Processing...</span>
              ) : isLastQuestion ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Complete Assessment</span>
                </>
              ) : (
                <>
                  <span>Next Question</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
