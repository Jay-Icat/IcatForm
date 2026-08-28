"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Volume2, VolumeX, Shield } from "lucide-react";
import { useQuiz } from "@/context/QuizContext";

export function Navbar() {
  const { isMuted, toggleMute } = useQuiz();

  return (
    <header className="fixed top-0 left-0 w-full z-40 px-3 sm:px-8 py-3 sm:py-4 flex items-center justify-between pointer-events-auto">
      {/* Whole ICAT Brand Logo */}
      <Link href="/" className="relative group flex items-center gap-3">
        <div className="absolute -inset-2 bg-gradient-to-r from-red-600/30 to-blue-600/30 blur-xl rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative flex items-center">
          <img
            src="/icat-logo-transparent.png"
            alt="ICAT Design & Media College"
            className="h-8 sm:h-11 w-auto object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.35)] transition-transform group-hover:scale-105"
          />
        </div>
      </Link>

      {/* Action Controls */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Sound Toggle */}
        <button
          onClick={toggleMute}
          className="glass-panel p-2 sm:p-2.5 rounded-full hover:border-red-500/50 transition-all text-slate-300 hover:text-white cursor-pointer active:scale-95 shadow-lg"
          title={isMuted ? "Unmute Audio" : "Mute Audio"}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>

        {/* Admin Link */}
        <Link
          href="/admin"
          className="glass-panel px-3 sm:px-4 py-1.5 sm:py-2 rounded-full flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:border-blue-500/50 transition-all cursor-pointer active:scale-95 shadow-lg"
        >
          <Shield className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden sm:inline">Admin</span>
        </Link>
      </div>
    </header>
  );
}
