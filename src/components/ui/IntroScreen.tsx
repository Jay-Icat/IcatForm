"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, Compass, Palette, Gamepad2, Film, Layers, Zap, Disc3 } from "lucide-react";
import { useQuiz } from "@/context/QuizContext";
import { useAudio } from "@/context/AudioContext";

export function IntroScreen() {
  const { startLeadForm } = useQuiz();
  const { playHover, playAnimeRiser, playWarpDrive, playSelect } = useAudio();

  const [currentPhase, setCurrentPhase] = useState<1 | 2 | 3 | 4>(1);
  const [progress, setProgress] = useState(0);
  const [hasStartedTransition, setHasStartedTransition] = useState(false);

  const specialties = [
    { label: "Game Design", icon: Gamepad2, color: "text-red-400" },
    { label: "VFX & Animation", icon: Film, color: "text-blue-400" },
    { label: "UI / UX Design", icon: Layers, color: "text-emerald-400" },
    { label: "Graphic Arts", icon: Palette, color: "text-amber-400" },
  ];

  const handleTriggerWarp = () => {
    if (hasStartedTransition) return;
    setHasStartedTransition(true);
    playWarpDrive();
    startLeadForm();
  };

  useEffect(() => {
    playAnimeRiser();

    const totalDuration = 9000; // 9 seconds full anime choreography
    const interval = 50;
    const step = (interval / totalDuration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const nextVal = prev + step;
        const elapsedSec = (nextVal / 100) * (totalDuration / 1000);

        if (elapsedSec < 2.5) {
          setCurrentPhase(1);
        } else if (elapsedSec < 5.5) {
          setCurrentPhase(2);
        } else if (elapsedSec < 8.5) {
          setCurrentPhase(3);
        } else {
          setCurrentPhase(4);
        }

        if (nextVal >= 100) {
          clearInterval(timer);
          return 100;
        }
        return nextVal;
      });
    }, interval);

    const autoTimeout = setTimeout(() => {
      handleTriggerWarp();
    }, totalDuration);

    return () => {
      clearInterval(timer);
      clearTimeout(autoTimeout);
    };
  }, []);

  const phaseLabels = {
    1: "PHASE 01: BRAND IDENTITY REVEAL",
    2: "PHASE 02: 3D CORE DIMENSION",
    3: "PHASE 03: CREATIVE ASSESSMENT READY",
    4: "INITIATING HYPERSPACE +Z WARP DIVE...",
  };

  return (
    <div className="relative z-10 flex flex-col items-center justify-between min-h-[100dvh] pt-20 pb-6 px-3 sm:px-4 max-w-5xl mx-auto pointer-events-none select-none w-full">
      
      {/* Top Banner Tag (Visible during Phase 3 & 4) */}
      <AnimatePresence>
        {currentPhase >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 glass-panel px-4 py-1.5 rounded-full border border-red-500/30 text-[11px] sm:text-xs text-red-400 font-semibold tracking-wider uppercase shadow-lg shadow-red-500/10 pointer-events-auto"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: "5s" }} />
            <span>India's Premier Digital Media & 3D Design College</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Screen Content Area */}
      <div className="my-auto w-full flex flex-col items-center justify-center">
        {/* Phase 1 & 2: Empty screen to showcase pure 3D Text & 3D Emblem in the background */}
        
        {/* Phase 3: Screen Headlines & 3D Specialization Badges */}
        <AnimatePresence>
          {currentPhase === 3 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 25 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.05, y: -20, filter: "blur(8px)" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-center space-y-4 sm:space-y-6 max-w-3xl pointer-events-auto w-full px-2"
            >
              <h1 className="text-3xl sm:text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-tight">
                Unleash Your <br />
                <span className="bg-gradient-to-r from-red-500 via-amber-400 to-blue-500 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(239,68,68,0.5)]">
                  Creative Dimension
                </span>
              </h1>

              <p className="text-xs sm:text-base text-slate-300 max-w-xl mx-auto font-normal leading-relaxed">
                Step inside the 3D interactive world of <strong className="text-white">ICAT Design & Media College</strong>.
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
                      className="flex items-center gap-2 glass-panel px-3.5 py-2 rounded-xl text-xs sm:text-sm text-slate-100 border border-white/15 hover:border-red-500/50 shadow-md cursor-pointer active:translate-y-1"
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

      {/* FOOTER CENTER: High-Tech 3D Cyber Loading Dock & Controls */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg flex flex-col items-center gap-2.5 pointer-events-auto px-2 pb-2"
      >
        {/* Cyber Progress Tracker */}
        <div className="w-full glass-panel rounded-2xl p-3 sm:p-3.5 border border-white/15 shadow-2xl backdrop-blur-2xl space-y-2">
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-slate-300">
            <span className="flex items-center gap-1.5 text-amber-400 font-bold tracking-wider truncate">
              <Disc3 className="w-3.5 h-3.5 animate-spin text-red-500" style={{ animationDuration: "3s" }} />
              <span>{phaseLabels[currentPhase]}</span>
            </span>
            <span className="text-white font-black">{Math.round(progress)}%</span>
          </div>

          {/* Glowing Animated Progress Bar */}
          <div className="w-full h-2 bg-slate-950/80 rounded-full overflow-hidden border border-white/10 p-[1px] relative">
            <motion.div
              className="h-full bg-gradient-to-r from-red-600 via-amber-400 to-blue-500 rounded-full shadow-[0_0_12px_rgba(239,68,68,0.6)]"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Skip / Enter 3D Button */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <Zap className="w-3 h-3 text-blue-400" />
              <span>Auto-entering form...</span>
            </span>

            <button
              onClick={handleTriggerWarp}
              onMouseEnter={playHover}
              className="btn-3d-red px-4 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold text-white flex items-center gap-1.5"
            >
              <span>Skip to Form</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
