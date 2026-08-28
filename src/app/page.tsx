"use client";

import React from "react";
import dynamic from "next/dynamic";
import { QuizProvider, useQuiz } from "@/context/QuizContext";
import { Navbar } from "@/components/ui/Navbar";
import { IntroScreen } from "@/components/ui/IntroScreen";
import { LeadFormCard } from "@/components/ui/LeadFormCard";
import { QuizCard } from "@/components/ui/QuizCard";
import { FinaleScreen } from "@/components/ui/FinaleScreen";

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

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#050814]">
      {/* 3D WebGL Scene in the Background */}
      <SceneContainer />

      {/* Top Floating Glass Navigation */}
      <Navbar />

      {/* Dynamic Overlay per Experience Stage */}
      <div className="relative z-10 w-full min-h-screen flex flex-col justify-center">
        {stage === "intro" && <IntroScreen />}
        {stage === "lead_form" && <LeadFormCard />}
        {stage === "quiz" && <QuizCard />}
        {stage === "finale" && <FinaleScreen />}
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <QuizProvider>
      <ExperienceContent />
    </QuizProvider>
  );
}
