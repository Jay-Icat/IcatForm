"use client";

import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Award, ArrowRight, Play, Gamepad2, Film, Layers, Palette } from "lucide-react";
import { useQuiz } from "@/context/QuizContext";
import { useAudio } from "@/context/AudioContext";

export function IntroScreen() {
  const { stage, startLeadForm, introPhase, setIntroPhase, introProgress, setIntroProgress } = useQuiz();
  const { playHover, playAnimeRiser, playWarpDrive, playSelect } = useAudio();
  const hasTriggeredWarp = useRef(false);

  const specialties = [
    { label: "Game Design", icon: Gamepad2, color: "text-red-400" },
    { label: "VFX & Animation", icon: Film, color: "text-blue-400" },
    { label: "UI / UX Design", icon: Layers, color: "text-emerald-400" },
    { label: "Graphic Arts", icon: Palette, color: "text-amber-400" },
  ];

  const handleTriggerWarp = () => {
    if (hasTriggeredWarp.current) return;
    hasTriggeredWarp.current = true;
    playWarpDrive();
    startLeadForm();
  };

  useEffect(() => {
    if (stage !== "intro") return;

    playAnimeRiser();
    hasTriggeredWarp.current = false;
    setIntroProgress(0);
    setIntroPhase(1);

    const totalDuration = 8500; // 8.5 seconds
    const intervalMs = 50;
    const step = (intervalMs / totalDuration) * 100;

    const timer = setInterval(() => {
      setIntroProgress((prev) => {
        const nextVal = Math.min(prev + step, 100);

        if (nextVal < 33) {
          setIntroPhase(1);
        } else if (nextVal < 66) {
          setIntroPhase(2);
        } else if (nextVal < 98) {
          setIntroPhase(3);
        } else {
          setIntroPhase(4);
        }

        if (nextVal >= 100) {
          clearInterval(timer);
          handleTriggerWarp();
          return 100;
        }
        return nextVal;
      });
    }, intervalMs);

    return () => {
      clearInterval(timer);
    };
  }, [stage]);

  return (
    <div className="relative z-10 flex flex-col items-center justify-between h-full max-h-[100dvh] pt-16 sm:pt-20 pb-4 sm:pb-6 px-3 sm:px-4 max-w-5xl mx-auto pointer-events-none select-none w-full overflow-hidden">
      
      {/* Top Banner Tag (Visible during Phase 3 & 4) */}
      <AnimatePresence>
        {introPhase >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 glass-panel px-4 py-1.5 rounded-full border border-red-500/30 text-[11px] sm:text-xs text-red-400 font-semibold tracking-wider uppercase shadow-lg shadow-red-500/10 pointer-events-auto"
          >
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>India's Premier Digital Media & 3D Design College</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Screen Content Area */}
      <div className="my-auto w-full flex flex-col items-center justify-center">
        {/* Phase 1 & 2: 3D Scene prominently displays Full Logo & 3D Emblem in center */}
        
        {/* Phase 3: High-Contrast Headlines & 3D Specialization Badges */}
        <AnimatePresence>
          {introPhase === 3 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.05, y: -20, filter: "blur(8px)" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-center space-y-3 sm:space-y-4 max-w-3xl pointer-events-auto w-full px-2 pt-28 sm:pt-36"
            >
              {/* High-Contrast Non-Camouflaging Title */}
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-tight drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)]">
                Unleash Your <br />
                <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-emerald-300 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(251,191,36,0.6)]">
                  Creative Dimension
                </span>
              </h1>

              <p className="text-xs sm:text-sm text-slate-200 max-w-lg mx-auto font-medium leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
                Step inside the 3D interactive world of <strong className="text-white font-bold">ICAT Design & Media College</strong>.
                Discover which creative specialisation matches your natural talent.
              </p>

              {/* 3D Tactile Specialty Badges */}
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 pt-1">
                {specialties.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.label}
                      onMouseEnter={playHover}
                      onClick={playSelect}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: idx * 0.08 }}
                      className="flex items-center gap-2 glass-panel px-3.5 py-2 rounded-xl text-xs sm:text-sm text-slate-100 border border-white/15 hover:border-red-500/50 shadow-lg cursor-pointer active:translate-y-1 backdrop-blur-xl bg-slate-950/70"
                    >
                      <Icon className={`w-4 h-4 ${item.color}`} />
                      <span className="font-semibold">{item.label}</span>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* FOOTER CENTER: 3D Capsule Dock with "Showing Intro..." & "Skip Intro" Button */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm flex items-center justify-center pointer-events-auto px-3 pb-2"
      >
        <div className="w-full glass-panel rounded-2xl p-2.5 sm:p-3 border border-white/15 shadow-2xl backdrop-blur-2xl flex items-center justify-between gap-3 bg-slate-950/80">
          {/* Showing Intro Status */}
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="w-6 h-6 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center flex-shrink-0">
              <Play className="w-3 h-3 text-red-400 fill-red-400 animate-pulse" />
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-200">
                <span>Showing Intro...</span>
                <span className="text-amber-400 font-mono text-[10px]">{Math.round(introProgress)}%</span>
              </div>
              {/* Sleek Progress Line */}
              <div className="w-full h-1.5 bg-slate-950/80 rounded-full overflow-hidden border border-white/10 mt-1">
                <motion.div
                  className="h-full bg-gradient-to-r from-red-600 via-amber-400 to-blue-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.7)]"
                  style={{ width: `${introProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Skip Intro Button */}
          <button
            onClick={handleTriggerWarp}
            onMouseEnter={playHover}
            className="btn-3d-red px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer flex-shrink-0"
          >
            <span>Skip Intro</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
