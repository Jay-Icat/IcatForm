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
  gender?: string;
  birthday?: string;
  email?: string;
  createdAt: string; // ISO string
  answers: Record<string, string[]>; // questionId -> array of selected option texts or IDs
  completedAt?: string;
  teamId?: string;
  teamName?: string;
}

export interface Team {
  id: string; // slug / doc ID
  name: string; // display name e.g. "Animation Team"
  slug: string; // URL friendly slug e.g. "animation"
  createdAt: string; // ISO string
  description?: string;
  webhookUrl?: string; // Optional custom Google Sheet webhook for this team
}

export type ExperienceStage = "intro" | "lead_form" | "quiz" | "finale";
