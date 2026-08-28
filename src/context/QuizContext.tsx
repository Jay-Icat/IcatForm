"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Question, StudentLead, ExperienceStage } from "@/types/quiz";
import { DEFAULT_QUESTIONS } from "@/lib/defaultQuestions";
import { fetchQuestions, submitStudentLead } from "@/lib/firebase";
import { sound } from "@/lib/sound";

interface QuizContextType {
  stage: ExperienceStage;
  setStage: (stage: ExperienceStage) => void;
  questions: Question[];
  currentQuestionIndex: number;
  studentInfo: { fullName: string; phoneNumber: string };
  setStudentInfo: React.Dispatch<React.SetStateAction<{ fullName: string; phoneNumber: string }>>;
  answers: Record<string, string[]>;
  isMuted: boolean;
  isLoading: boolean;
  isSubmitting: boolean;
  toggleMute: () => void;
  startLeadForm: () => void;
  submitLeadAndStartQuiz: (name: string, phone: string) => void;
  selectOption: (questionId: string, optionText: string, isMulti: boolean) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  finishQuiz: () => Promise<void>;
  restartExperience: () => void;
  refreshQuestions: () => Promise<void>;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export function QuizProvider({ children }: { children: React.ReactNode }) {
  const [stage, setStage] = useState<ExperienceStage>("intro");
  const [questions, setQuestions] = useState<Question[]>(DEFAULT_QUESTIONS);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [studentInfo, setStudentInfo] = useState<{ fullName: string; phoneNumber: string }>({
    fullName: "",
    phoneNumber: "",
  });
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const loadQuestions = async () => {
    setIsLoading(true);
    try {
      const qList = await fetchQuestions();
      setQuestions(qList.sort((a, b) => a.order - b.order));
    } catch (e) {
      console.error("Failed to load questions", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  const toggleMute = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  const startLeadForm = () => {
    sound.playClick();
    sound.playTransition();
    setStage("lead_form");
  };

  const submitLeadAndStartQuiz = (fullName: string, phoneNumber: string) => {
    sound.playSuccess();
    setStudentInfo({ fullName, phoneNumber });
    setCurrentQuestionIndex(0);
    setAnswers({});
    setStage("quiz");
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
    sound.playTransition();
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const finishQuiz = async () => {
    setIsSubmitting(true);
    sound.playSuccess();

    try {
      const leadPayload: StudentLead = {
        fullName: studentInfo.fullName,
        phoneNumber: studentInfo.phoneNumber,
        createdAt: new Date().toISOString(),
        answers: answers,
        completedAt: new Date().toISOString(),
      };
      await submitStudentLead(leadPayload);
    } catch (err) {
      console.error("Submission failed", err);
    } finally {
      setIsSubmitting(false);
      setStage("finale");
    }
  };

  const restartExperience = () => {
    sound.playTransition();
    setStage("intro");
    setCurrentQuestionIndex(0);
    setAnswers({});
    setStudentInfo({ fullName: "", phoneNumber: "" });
  };

  return (
    <QuizContext.Provider
      value={{
        stage,
        setStage,
        questions,
        currentQuestionIndex,
        studentInfo,
        setStudentInfo,
        answers,
        isMuted,
        isLoading,
        isSubmitting,
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
