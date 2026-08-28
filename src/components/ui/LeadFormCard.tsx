"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { User, Phone, Sparkles, ArrowRight, ShieldCheck, Calendar, Users2 } from "lucide-react";
import { useQuiz } from "@/context/QuizContext";
import { useAudio } from "@/context/AudioContext";

export function LeadFormCard() {
  const { submitLeadAndStartQuiz } = useQuiz();
  const { playHover, playSelect } = useAudio();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("Male");
  const [birthday, setBirthday] = useState("");
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
    if (!birthday) {
      setError("Please select your date of birth");
      return;
    }
    setError("");
    submitLeadAndStartQuiz(name.trim(), phone.trim(), gender, birthday);
  };

  return (
    <div className="relative z-10 flex items-center justify-center min-h-[100dvh] px-3 sm:px-4 py-16 sm:py-20 pointer-events-auto w-full">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -30 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md glass-panel glass-panel-glow-red rounded-3xl p-5 sm:p-7 border border-white/15 relative overflow-hidden shadow-2xl backdrop-blur-2xl"
      >
        {/* Top Decorative Glow Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-amber-400 to-blue-600" />

        {/* Card Header */}
        <div className="text-center space-y-1.5 mb-5">
          <div className="inline-flex items-center justify-center p-2.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 mb-1">
            <Sparkles className="w-5 h-5" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Student Registration
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-300">
            Enter your details to unlock your personalized 3D creative assessment
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Full Name Input */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-red-400" />
              <span>Full Name</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Rahul Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-3 rounded-xl glass-input text-white placeholder-slate-500 text-xs sm:text-sm focus:border-red-500 transition-all"
              required
            />
          </div>

          {/* Phone Number Input */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-blue-400" />
              <span>WhatsApp / Mobile Number</span>
            </label>
            <input
              type="tel"
              placeholder="e.g. 9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3.5 py-3 rounded-xl glass-input text-white placeholder-slate-500 text-xs sm:text-sm font-mono focus:border-blue-500 transition-all"
              required
            />
          </div>

          {/* Gender & Birthday Row (Mobile-Friendly 2-Col on larger, stacked on narrow) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Gender Select */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Users2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Gender</span>
              </label>
              <select
                value={gender}
                onChange={(e) => {
                  playSelect();
                  setGender(e.target.value);
                }}
                className="w-full px-3 py-3 rounded-xl glass-input text-white text-xs sm:text-sm bg-slate-900/90 border border-white/15 focus:border-amber-400 transition-all cursor-pointer"
              >
                <option value="Male" className="bg-slate-950 text-white">Male</option>
                <option value="Female" className="bg-slate-950 text-white">Female</option>
                <option value="Other" className="bg-slate-950 text-white">Other</option>
                <option value="Prefer not to say" className="bg-slate-950 text-white">Prefer not to say</option>
              </select>
            </div>

            {/* Birthday / Date of Birth */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                <span>Date of Birth</span>
              </label>
              <input
                type="date"
                value={birthday}
                onChange={(e) => {
                  playSelect();
                  setBirthday(e.target.value);
                }}
                className="w-full px-3 py-2.5 rounded-xl glass-input text-white text-xs sm:text-sm bg-slate-900/90 border border-white/15 focus:border-emerald-400 transition-all cursor-pointer [color-scheme:dark]"
                required
              />
            </div>
          </div>

          {/* Validation error alert */}
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[11px] text-red-400 text-center font-medium bg-red-950/50 py-1.5 px-3 rounded-lg border border-red-500/30"
            >
              {error}
            </motion.p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            onMouseEnter={playHover}
            className="w-full mt-2 btn-3d-red py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 text-sm sm:text-base font-bold text-white shadow-xl"
          >
            <span>Start 3D Assessment</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="flex items-center justify-center gap-1.5 pt-1 text-[10px] sm:text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Secured & encrypted with ICAT Admissions</span>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
