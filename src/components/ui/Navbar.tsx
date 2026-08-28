"use client";

import React from "react";
import Link from "next/link";
import { Volume2, VolumeX, Shield, Sparkles } from "lucide-react";
import { useQuiz } from "@/context/QuizContext";

export function Navbar() {
  const { isMuted, toggleMute, stage } = useQuiz();

  return (
    <header className="fixed top-0 left-0 w-full z-40 px-4 sm:px-8 py-4 flex items-center justify-between pointer-events-auto">
      {/* Brand Title Pill */}
      <div className="flex items-center gap-3 glass-panel px-4 py-2 rounded-full border border-white/10 shadow-lg">
        <div className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
        <span className="text-xs sm:text-sm font-semibold tracking-wider text-slate-200">
          ICAT 3D EXPERIENCE
        </span>
        <span className="hidden sm:inline text-xs text-slate-400 border-l border-slate-700 pl-2">
          Design & Media
        </span>
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
