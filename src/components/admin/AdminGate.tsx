"use client";

import React, { useState } from "react";
import { Lock, ShieldAlert, KeyRound, ArrowRight, Home } from "lucide-react";
import Link from "next/link";

interface AdminGateProps {
  onSuccess: () => void;
}

export function AdminGate({ onSuccess }: AdminGateProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "ZxAlpha98007!") {
      setError(false);
      onSuccess();
    } else {
      setError(true);
      setAttempts((prev) => prev + 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#050814] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md glass-panel rounded-3xl p-8 border border-white/15 relative z-10 shadow-2xl">
        {/* Header Badge */}
        <div className="text-center space-y-3 mb-6">
          <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            ICAT Admin Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Restricted access. Please authenticate to manage questions and download student leads.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-red-400" />
              Master Admin Password
            </label>
            <input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(false);
              }}
              className="w-full px-4 py-3.5 rounded-xl glass-input text-white placeholder-slate-500 text-sm focus:border-red-500"
              autoFocus
              required
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs font-medium animate-shake">
              <ShieldAlert className="w-4 h-4 flex-shrink-0 text-red-400" />
              <span>Incorrect password. Please verify your credentials.</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full mt-2 group relative overflow-hidden rounded-xl bg-gradient-to-r from-red-600 via-red-500 to-blue-600 p-[1px] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-red-600/30"
          >
            <div className="flex items-center justify-center gap-2 rounded-[11px] bg-slate-950/80 px-6 py-3.5 text-sm font-bold text-white transition-colors group-hover:bg-transparent">
              <span>Unlock Admin Panel</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
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
          <span className="text-[11px] text-slate-500">Security Gate v2.4</span>
        </div>
      </div>
    </div>
  );
}
