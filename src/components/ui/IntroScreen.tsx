"use client";

import React, { useState, MouseEvent } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Sparkles, ArrowRight, Compass, Palette, Gamepad2, Film, Layers } from "lucide-react";
import { useQuiz } from "@/context/QuizContext";
import { useAudio } from "@/context/AudioContext";

export function IntroScreen() {
  const { startLeadForm } = useQuiz();
  const { playHover, playTransition } = useAudio();

  const specialties = [
    { label: "Game Design", icon: Gamepad2, color: "text-red-400" },
    { label: "VFX & Animation", icon: Film, color: "text-blue-400" },
    { label: "UI / UX Design", icon: Layers, color: "text-emerald-400" },
    { label: "Graphic Arts", icon: Palette, color: "text-amber-400" },
  ];

  // Magnetic Button Logic
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 15 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 15 });

  const handleMouseMove = (e: MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(e.clientX - centerX);
    y.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const handleStart = () => {
    playTransition();
    startLeadForm();
  };

  return (
    <div className="relative z-10 flex flex-col items-center justify-between min-h-screen pt-28 pb-12 px-4 max-w-5xl mx-auto pointer-events-none">
      {/* Top Banner Tag */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex items-center gap-2 glass-panel px-4 py-1.5 rounded-full border border-red-500/20 text-xs sm:text-sm text-red-400 font-medium tracking-wide uppercase shadow-lg shadow-red-500/10 pointer-events-auto"
      >
        <Sparkles className="w-4 h-4 text-red-400 animate-spin" style={{ animationDuration: "6s" }} />
        <span>Pioneering Digital Media & Design Education</span>
      </motion.div>

      {/* Main Hero Typography */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="text-center my-auto space-y-6 max-w-3xl pointer-events-auto"
      >
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-tight">
          Shape Your <br />
          <span className="bg-gradient-to-r from-red-500 via-amber-400 to-blue-500 bg-clip-text text-transparent animate-gradient">
            Creative Destiny
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
          Welcome to the immersive 3D world of <strong className="text-white">ICAT Design & Media College</strong>. 
          Discover which creative field matches your talent through our interactive 3D assessment.
        </p>

        {/* Dynamic Category Badges */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {specialties.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.label}
                onMouseEnter={playHover}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 + idx * 0.1 }}
                className="flex items-center gap-2 glass-panel px-3.5 py-2 rounded-xl text-xs sm:text-sm text-slate-200 border border-white/10 hover:border-white/30 hover:scale-105 transition-all cursor-pointer"
              >
                <Icon className={`w-4 h-4 ${item.color}`} />
                <span>{item.label}</span>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Call To Action Button */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="w-full max-w-md flex flex-col items-center gap-3 pt-6 pointer-events-auto"
      >
        <motion.button
          onClick={handleStart}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onMouseEnter={playHover}
          style={{ x: mouseXSpring, y: mouseYSpring }}
          className="hover-target group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-red-600 via-red-500 to-blue-600 p-[2px] shadow-xl shadow-red-600/25 active:scale-95 transition-transform"
        >
          <div className="relative flex items-center justify-center gap-3 rounded-[14px] bg-slate-950/90 px-8 py-4 text-base sm:text-lg font-bold text-white transition-colors duration-300 group-hover:bg-transparent pointer-events-none">
            <span>Begin 3D Experience</span>
            <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
          </div>
        </motion.button>

        <p className="text-xs text-slate-400 text-center flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-blue-400" />
          Interactive Assessment • Instant Creative Profiling
        </p>
      </motion.div>
    </div>
  );
}
