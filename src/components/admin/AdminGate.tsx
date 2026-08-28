"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Lock, ShieldAlert, KeyRound, ArrowRight, Home, Unlock, Sparkles, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { sound } from "@/lib/sound";

interface AdminGateProps {
  onSuccess: () => void;
}

export function AdminGate({ onSuccess }: AdminGateProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "ZxAlpha98007!") {
      setError(false);
      setIsUnlocking(true);
      sound.playPortalUnlock();
      setTimeout(() => {
        onSuccess();
      }, 700);
    } else {
      setError(true);
      sound.playClick();
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#050814] flex flex-col items-center justify-center p-3 sm:p-6 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 sm:w-96 h-80 sm:h-96 bg-red-600/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-72 sm:w-80 h-72 sm:h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md glass-panel rounded-3xl p-6 sm:p-8 border border-white/15 relative z-10 shadow-2xl backdrop-blur-xl"
      >
        {/* Unlocking Laser Sweep Effect */}
        {isUnlocking && (
          <motion.div
            initial={{ left: "-100%" }}
            animate={{ left: "150%" }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
            className="absolute top-0 bottom-0 w-32 bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent skew-x-12 pointer-events-none z-20"
          />
        )}

        {/* Header Badge */}
        <div className="text-center space-y-2.5 mb-6">
          <motion.div
            animate={isUnlocking ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] } : {}}
            className={`inline-flex items-center justify-center p-3.5 sm:p-4 rounded-2xl border transition-colors ${
              isUnlocking
                ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                : "bg-red-500/10 border-red-500/30 text-red-400"
            }`}
          >
            {isUnlocking ? <Unlock className="w-7 h-7" /> : <Lock className="w-7 h-7" />}
          </motion.div>
          
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            ICAT Admin Portal
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-400 max-w-xs mx-auto">
            Restricted access. Please authenticate to manage questions, export leads, and sync Google Sheets.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-red-400" />
              <span>Master Admin Password</span>
            </label>
            <input
              type="password"
              placeholder="Enter admin password"
              value={password}
              disabled={isUnlocking}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(false);
              }}
              className="w-full px-4 py-3 rounded-xl glass-input text-white placeholder-slate-500 text-xs sm:text-sm focus:border-red-500 transition-all font-mono"
              autoFocus
              required
            />
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 rounded-xl bg-red-950/70 border border-red-500/40 text-red-300 text-xs font-medium"
            >
              <ShieldAlert className="w-4 h-4 flex-shrink-0 text-red-400" />
              <span>Incorrect password. Please verify your master key.</span>
            </motion.div>
          )}

          {isUnlocking && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center gap-2 p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs font-medium"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Access Granted. Launching Management Console...</span>
            </motion.div>
          )}

          <button
            type="submit"
            disabled={isUnlocking}
            className={`w-full mt-2 py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 text-xs sm:text-sm font-bold text-white shadow-xl transition-all ${
              isUnlocking
                ? "btn-3d-emerald opacity-90 cursor-wait"
                : "btn-3d-red cursor-pointer"
            }`}
          >
            <span>{isUnlocking ? "Unlocking Portal..." : "Unlock Admin Panel"}</span>
            {!isUnlocking && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return to 3D Site</span>
          </Link>
          <span className="text-[10px] text-slate-500 font-mono">Secure Gate v3.0</span>
        </div>
      </motion.div>
    </div>
  );
}
