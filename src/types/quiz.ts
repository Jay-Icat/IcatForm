export type QuestionType = "single" | "multiple";

export interface QuizOption {
  id: string;
  text: string;
  isCorrect?: boolean;
}

export interface Question {
  id: string;
  questionText: string;
  type: QuestionType;
  options: QuizOption[]; // 4 options
  category?: string;
  order: number;
}

export interface StudentLead {
  id?: string;
  fullName: string;
  phoneNumber: string;
  email?: string;
  createdAt: string; // ISO string
  answers: Record<string, string[]>; // questionId -> array of selected option texts or IDs
  completedAt?: string;
}

export type ExperienceStage = "intro" | "lead_form" | "quiz" | "finale";
