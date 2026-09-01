"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowRight, GraduationCap, User, Phone, ShieldCheck, Calendar, Users2 } from "lucide-react";
import { useQuiz } from "@/context/QuizContext";
import { useAudio } from "@/context/AudioContext";

export function LeadFormCard() {
  const { studentInfo, submitLeadAndStartQuiz } = useQuiz();
  const { playHover, playSelect, playSuccess } = useAudio();

  const [name, setName] = useState(studentInfo.fullName || "");
  const [phone, setPhone] = useState(studentInfo.phoneNumber || "");
  const [gender, setGender] = useState(studentInfo.gender || "Male");
  const [birthday, setBirthday] = useState(studentInfo.birthday || "");
  const [error, setError] = useState("");

  // 3D Card Interactive Tilt
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setRotateX(-(y / rect.height) * 8);
    setRotateY((x / rect.width) * 8);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please provide your full name");
      return;
    }

    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }

    if (!birthday) {
      setError("Please enter your date of birth");
      return;
    }

    playSuccess();
    submitLeadAndStartQuiz(
      name.trim(),
      cleanPhone,
      gender,
      birthday
    );
  };

  return (
    <div className="relative z-10 flex items-center justify-center h-full max-h-[100dvh] px-3 sm:px-4 py-2 max-w-lg mx-auto w-full [perspective:1200px] overflow-hidden">
      
      {/* 3D Floating Amoeba Form Container (Zero Scrollbars) */}
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        initial={{ opacity: 0, scale: 0.88, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full rounded-3xl transition-transform duration-200 ease-out overflow-hidden"
      >
        {/* Animated Amoeba Fluid Liquid Border Aura */}
        <div className="absolute -inset-[2.5px] rounded-3xl bg-gradient-to-r from-red-600 via-amber-500 to-blue-600 amoeba-aura opacity-80 blur-md pointer-events-none" />
        
        {/* Main Amoeba Glassmorphism Body */}
        <div className="relative w-full glass-panel rounded-3xl p-5 sm:p-7 border border-white/20 shadow-2xl backdrop-blur-2xl amoeba-border overflow-hidden bg-slate-950/80">
          
          {/* Subtle Ambient Background Light */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

          {/* Form Header */}
          <div className="text-center space-y-1 pb-3 sm:pb-4 border-b border-white/10 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-red-500/10 border border-red-500/30 text-[10px] sm:text-[11px] font-bold text-red-400 uppercase tracking-widest">
              <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
              <span>Step 01 / Registration</span>
            </div>
            
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight pt-1 drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
              Start Your Creative Journey
            </h2>
            <p className="text-xs text-slate-300">
              Enter your details to begin the 3D aptitude assessment.
            </p>
          </div>

          {/* Registration Inputs */}
          <form onSubmit={handleSubmit} className="space-y-3 pt-3 relative z-10">
            
            {/* Full Name */}
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
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-white placeholder-slate-500 text-xs sm:text-sm focus:border-red-500 transition-all cursor-text"
                required
              />
            </div>

            {/* Mobile Number */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-blue-400" />
                <span>WhatsApp / Mobile Number</span>
              </label>
              <input
                type="tel"
                placeholder="10-digit mobile number"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-white placeholder-slate-500 text-xs sm:text-sm font-mono focus:border-blue-500 transition-all cursor-text"
                required
              />
            </div>

            {/* Gender & Birthday Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
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
                  className="w-full px-3 py-2.5 rounded-xl glass-input text-white text-xs sm:text-sm bg-slate-900/90 border border-white/15 focus:border-amber-400 transition-all cursor-pointer"
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
                  className="w-full px-3 py-2 rounded-xl glass-input text-white text-xs sm:text-sm bg-slate-900/90 border border-white/15 focus:border-emerald-400 transition-all cursor-pointer [color-scheme:dark]"
                  required
                />
              </div>
            </div>

            {/* Validation error alert */}
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[11px] text-red-400 text-center font-medium bg-red-950/50 py-1 px-3 rounded-lg border border-red-500/30"
              >
                {error}
              </motion.p>
            )}

            {/* Tactile 3D Submit Button */}
            <button
              type="submit"
              onMouseEnter={playHover}
              className="w-full mt-1.5 btn-3d-red py-3 px-6 rounded-2xl flex items-center justify-center gap-2 text-xs sm:text-sm font-bold text-white shadow-xl cursor-pointer"
            >
              <span>Start 3D Assessment</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-1.5 pt-0.5 text-[10px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Your contact information is 100% secure & private</span>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
