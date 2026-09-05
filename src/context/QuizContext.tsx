"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Question, StudentLead, ExperienceStage, Team } from "@/types/quiz";
import { DEFAULT_QUESTIONS } from "@/lib/defaultQuestions";
import { fetchQuestions, submitStudentLead, updateStudentLead, fetchTeam, DEFAULT_TEAM } from "@/lib/firebase";
import { sound } from "@/lib/sound";

interface StudentInfoState {
  fullName: string;
  phoneNumber: string;
  gender?: string;
  birthday?: string;
}

interface QuizContextType {
  teamId: string;
  team: Team | null;
  stage: ExperienceStage;
  setStage: (stage: ExperienceStage) => void;
  introPhase: 1 | 2 | 3 | 4;
  setIntroPhase: (phase: 1 | 2 | 3 | 4) => void;
  introProgress: number;
  setIntroProgress: React.Dispatch<React.SetStateAction<number>>;
  questions: Question[];
  currentQuestionIndex: number;
  studentInfo: StudentInfoState;
  setStudentInfo: React.Dispatch<React.SetStateAction<StudentInfoState>>;
  answers: Record<string, string[]>;
  isMuted: boolean;
  isLoading: boolean;
  isSubmitting: boolean;
  currentLeadId: string | null;
  toggleMute: () => void;
  startLeadForm: () => void;
  submitLeadAndStartQuiz: (name: string, phone: string, gender?: string, birthday?: string) => Promise<void>;
  selectOption: (questionId: string, optionText: string, isMulti: boolean) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  finishQuiz: () => Promise<void>;
  restartExperience: () => void;
  refreshQuestions: () => Promise<void>;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

interface QuizProviderProps {
  children: React.ReactNode;
  teamId?: string;
}

export function QuizProvider({ children, teamId = "default" }: QuizProviderProps) {
  const effectiveTeamId = teamId || "default";

  const [team, setTeam] = useState<Team | null>(effectiveTeamId === "default" ? DEFAULT_TEAM : null);
  const [stage, setStage] = useState<ExperienceStage>("intro");
  const [introPhase, setIntroPhase] = useState<1 | 2 | 3 | 4>(1);
  const [introProgress, setIntroProgress] = useState<number>(0);

  const [questions, setQuestions] = useState<Question[]>(DEFAULT_QUESTIONS);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [studentInfo, setStudentInfo] = useState<StudentInfoState>({
    fullName: "",
    phoneNumber: "",
    gender: "Male",
    birthday: "",
  });
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [currentLeadId, setCurrentLeadId] = useState<string | null>(null);

  const loadQuestions = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch team details and questions in parallel
      const [tData, qData] = await Promise.all([
        fetchTeam(effectiveTeamId),
        fetchQuestions(effectiveTeamId),
      ]);
      if (tData) {
        setTeam(tData);
      }
      if (qData && qData.length > 0) {
        setQuestions(qData.sort((a, b) => a.order - b.order));
      } else {
        setQuestions(DEFAULT_QUESTIONS);
      }
    } catch (e) {
      console.warn(`Failed to load team ${effectiveTeamId} or questions`, e);
    } finally {
      setIsLoading(false);
    }
  }, [effectiveTeamId]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const toggleMute = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  const startLeadForm = () => {
    sound.playWarpDrive();
    setStage("lead_form");
  };

  const submitLeadAndStartQuiz = async (fullName: string, phoneNumber: string, gender?: string, birthday?: string) => {
    sound.playSuccess();
    setStudentInfo({ fullName, phoneNumber, gender, birthday });
    setCurrentQuestionIndex(0);
    setAnswers({});
    
    setIsSubmitting(true);
    try {
      const leadData: StudentLead = {
        fullName,
        phoneNumber,
        gender,
        birthday,
        answers: {},
        teamId: effectiveTeamId,
        teamName: team?.name || effectiveTeamId,
        createdAt: new Date().toISOString(),
      };
      const leadId = await submitStudentLead(leadData, effectiveTeamId);
      setCurrentLeadId(leadId);
    } catch (e) {
      console.error("Failed to submit initial lead", e);
    } finally {
      setIsSubmitting(false);
      setStage("quiz");
    }
  };

  const selectOption = (questionId: string, optionText: string, isMulti: boolean) => {
    sound.playSelect();
    setAnswers((prev) => {
      const currentSelected = prev[questionId] || [];
      if (isMulti) {
        if (currentSelected.includes(optionText)) {
          return {
            ...prev,
            [questionId]: currentSelected.filter((item) => item !== optionText),
          };
        } else {
          return {
            ...prev,
            [questionId]: [...currentSelected, optionText],
          };
        }
      } else {
        return {
          ...prev,
          [questionId]: [optionText],
        };
      }
    });
  };

  const nextQuestion = () => {
    sound.playTransition();
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      finishQuiz();
    }
  };

  const prevQuestion = () => {
    sound.playClick();
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const finishQuiz = async () => {
    setIsSubmitting(true);
    sound.playSuccess();

    try {
      if (currentLeadId) {
        await updateStudentLead(currentLeadId, answers, effectiveTeamId);
      } else {
        const leadData: StudentLead = {
          fullName: studentInfo.fullName,
          phoneNumber: studentInfo.phoneNumber,
          gender: studentInfo.gender,
          birthday: studentInfo.birthday,
          answers: answers,
          teamId: effectiveTeamId,
          teamName: team?.name || effectiveTeamId,
          createdAt: new Date().toISOString(),
        };
        await submitStudentLead(leadData, effectiveTeamId);
      }
      setStage("finale");
    } catch (e) {
      console.error("Failed to submit finished lead", e);
      setStage("finale");
    } finally {
      setIsSubmitting(false);
    }
  };

  const restartExperience = () => {
    sound.playClick();
    setCurrentQuestionIndex(0);
    setAnswers({});
    setStudentInfo({ fullName: "", phoneNumber: "", gender: "Male", birthday: "" });
    setIntroPhase(1);
    setIntroProgress(0);
    setStage("intro");
  };

  return (
    <QuizContext.Provider
      value={{
        teamId: effectiveTeamId,
        team,
        stage,
        setStage,
        introPhase,
        setIntroPhase,
        introProgress,
        setIntroProgress,
        questions,
        currentQuestionIndex,
        studentInfo,
        setStudentInfo,
        answers,
        isMuted,
        isLoading,
        isSubmitting,
        currentLeadId,
        toggleMute,
        startLeadForm,
        submitLeadAndStartQuiz,
        selectOption,
        nextQuestion,
        prevQuestion,
        finishQuiz,
        restartExperience,
        refreshQuestions: loadQuestions,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz() {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error("useQuiz must be used within a QuizProvider");
  }
  return context;
}
