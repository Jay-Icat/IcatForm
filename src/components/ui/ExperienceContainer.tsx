"use client";

import React from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { QuizProvider, useQuiz } from "@/context/QuizContext";
import { Navbar } from "@/components/ui/Navbar";
import { IntroScreen } from "@/components/ui/IntroScreen";
import { LeadFormCard } from "@/components/ui/LeadFormCard";
import { QuizCard } from "@/components/ui/QuizCard";
import { FinaleScreen } from "@/components/ui/FinaleScreen";
import { AudioProvider, useAudio } from "@/context/AudioContext";
import { CustomCursor } from "@/components/ui/CustomCursor";

// Dynamically import 3D Canvas with ssr disabled to guarantee clean WebGL GPU mounting
const SceneContainer = dynamic(
  () => import("@/components/3d/SceneContainer").then((mod) => mod.SceneContainer),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 bg-[#050814] flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-red-500 border-t-transparent animate-spin" />
      </div>
    ),
  }
);

function ExperienceContent() {
  const { stage } = useQuiz();
  const { initAudio } = useAudio();

  return (
    <div 
      className="fixed inset-0 w-full h-full overflow-hidden bg-[#050814] select-none"
      onClick={initAudio}
    >
      <CustomCursor />
      
      {/* 3D WebGL Scene in the Background */}
      <SceneContainer />

      {/* Top Floating Glass Navigation */}
      <Navbar />

      {/* Main Viewport Locked Dynamic Overlay with Smooth Transition */}
      <main className="relative z-10 w-full h-[100dvh] flex flex-col justify-center items-center pointer-events-none overflow-hidden">
        <div className="pointer-events-auto w-full h-full flex flex-col items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            {stage === "intro" && (
              <motion.div
                key="intro-stage"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 1.04 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="w-full h-full flex flex-col items-center justify-center"
              >
                <IntroScreen />
              </motion.div>
            )}

            {stage === "lead_form" && (
              <motion.div
                key="lead_form-stage"
                initial={{ opacity: 0, scale: 0.94, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -20 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full h-full flex flex-col items-center justify-center p-2 sm:p-4"
              >
                <LeadFormCard />
              </motion.div>
            )}

            {stage === "quiz" && (
              <motion.div
                key="quiz-stage"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.03 }}
                transition={{ duration: 0.45, ease: "easeInOut" }}
                className="w-full h-full flex flex-col items-center justify-center p-2 sm:p-4"
              >
                <QuizCard />
              </motion.div>
            )}

            {stage === "finale" && (
              <motion.div
                key="finale-stage"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full h-full flex flex-col items-center justify-center p-2 sm:p-4"
              >
                <FinaleScreen />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

export function ExperienceContainer({ teamId = "default" }: { teamId?: string }) {
  return (
    <AudioProvider>
      <QuizProvider teamId={teamId}>
        <ExperienceContent />
      </QuizProvider>
    </AudioProvider>
  );
}
