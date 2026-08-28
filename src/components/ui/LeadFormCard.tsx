"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { User, Phone, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import { useQuiz } from "@/context/QuizContext";

export function LeadFormCard() {
  const { submitLeadAndStartQuiz } = useQuiz();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter your full name");
      return;
    }
    const cleanPhone = phone.trim().replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length < 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }
    setError("");
    submitLeadAndStartQuiz(name.trim(), phone.trim());
  };

  return (
    <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-20 pointer-events-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -30 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md glass-panel glass-panel-glow-red rounded-3xl p-6 sm:p-8 border border-white/15 relative overflow-hidden"
      >
        {/* Decorative Top Glow Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-amber-400 to-blue-600" />

        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 mb-2">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Student Registration
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Enter your details to unlock your personalized 3D creative assessment
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-red-400" />
              Full Name
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. Rahul Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl glass-input text-white placeholder-slate-500 text-sm"
                required
              />
            </div>
          </div>

          {/* Phone Number Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-blue-400" />
              WhatsApp / Mobile Number
            </label>
            <div className="relative">
              <input
                type="tel"
                placeholder="e.g. 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl glass-input text-white placeholder-slate-500 text-sm"
                required
              />
            </div>
          </div>

          {/* Validation error message */}
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-red-400 text-center font-medium bg-red-950/40 py-1.5 px-3 rounded-lg border border-red-500/30"
            >
              {error}
            </motion.p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full mt-4 group relative overflow-hidden rounded-xl bg-gradient-to-r from-red-600 via-red-500 to-blue-600 p-[1px] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-red-600/30"
          >
            <div className="flex items-center justify-center gap-2 rounded-[11px] bg-slate-950/80 px-6 py-3.5 text-sm sm:text-base font-bold text-white transition-colors group-hover:bg-transparent">
              <span>Start 3D Quiz</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </button>

          <div className="flex items-center justify-center gap-2 pt-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Your information is secured with ICAT Admissions</span>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
