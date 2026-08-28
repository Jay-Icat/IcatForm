"use client";

import React from "react";
import Link from "next/link";
import { Volume2, VolumeX, Shield, Sparkles } from "lucide-react";
import { useQuiz } from "@/context/QuizContext";

export function Navbar() {
  const { isMuted, toggleMute, stage } = useQuiz();

  return (
    <header className="fixed top-0 left-0 w-full z-40 px-4 sm:px-8 py-4 flex items-center justify-between pointer-events-auto">
      {/* Prominent Non-Overlapping ICAT Brand Name */}
      <div className="flex items-center gap-4">
        <div className="relative group cursor-pointer">
          <div className="absolute inset-0 bg-red-600/30 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
            ICAT
          </h1>
        </div>
        <div className="hidden sm:flex flex-col border-l border-white/20 pl-4">
          <span className="text-xs font-semibold tracking-[0.2em] text-red-400 uppercase">Design & Media</span>
          <span className="text-[10px] text-slate-500 uppercase tracking-widest">Interactive Experience</span>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-3">
        {/* Sound Toggle */}
        <button
          onClick={toggleMute}
          className="glass-panel p-2.5 rounded-full hover:border-red-500/50 transition-all text-slate-300 hover:text-white"
          title={isMuted ? "Unmute Audio" : "Mute Audio"}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>

        {/* Admin Link */}
        <Link
          href="/admin"
          className="glass-panel px-3.5 py-2 rounded-full flex items-center gap-2 text-xs font-medium text-slate-300 hover:text-white hover:border-blue-500/50 transition-all"
        >
          <Shield className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden md:inline">Admin</span>
        </Link>
      </div>
    </header>
  );
}
