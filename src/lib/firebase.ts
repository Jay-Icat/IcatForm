import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  addDoc, 
  doc, 
  setDoc, 
  deleteDoc, 
  query, 
  orderBy,
  Firestore 
} from "firebase/firestore";
import { Question, StudentLead } from "@/types/quiz";
import { DEFAULT_QUESTIONS } from "./defaultQuestions";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && 
  firebaseConfig.projectId && 
  firebaseConfig.apiKey !== "your-api-key"
);

let db: Firestore | null = null;

if (isFirebaseConfigured) {
  try {
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    db = getFirestore(app);
  } catch (error) {
    console.warn("Firebase initialization failed, falling back to local storage:", error);
  }
}

// Local Storage Helper Keys
const LS_QUESTIONS_KEY = "icat_quiz_questions_v1";
const LS_LEADS_KEY = "icat_student_leads_v1";

export async function fetchQuestions(): Promise<Question[]> {
  if (db) {
    try {
      const q = query(collection(db, "questions"), orderBy("order", "asc"));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as Question[];
      }
    } catch (e) {
      console.warn("Error reading from Firestore, using local fallback", e);
    }
  }

  // Fallback to LocalStorage or Default Questions
  if (typeof window !== "undefined") {
    const localData = localStorage.getItem(LS_QUESTIONS_KEY);
    if (localData) {
      try {
        const parsed = JSON.parse(localData);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error("Failed to parse local questions", e);
      }
    }
    // Seed default questions to localStorage
    localStorage.setItem(LS_QUESTIONS_KEY, JSON.stringify(DEFAULT_QUESTIONS));
  }

  return DEFAULT_QUESTIONS;
}

export async function saveQuestion(question: Question): Promise<void> {
  if (db) {
    try {
      await setDoc(doc(db, "questions", question.id), question);
      return;
    } catch (e) {
      console.warn("Failed to write question to Firestore, saving locally", e);
    }
  }

  if (typeof window !== "undefined") {
    const questions = await fetchQuestions();
    const existingIndex = questions.findIndex((q) => q.id === question.id);
    if (existingIndex >= 0) {
      questions[existingIndex] = question;
    } else {
      questions.push(question);
    }
    localStorage.setItem(LS_QUESTIONS_KEY, JSON.stringify(questions));
  }
}

export async function deleteQuestion(questionId: string): Promise<void> {
  if (db) {
    try {
      await deleteDoc(doc(db, "questions", questionId));
      return;
    } catch (e) {
      console.warn("Failed to delete from Firestore, deleting locally", e);
    }
  }

  if (typeof window !== "undefined") {
    const questions = await fetchQuestions();
    const filtered = questions.filter((q) => q.id !== questionId);
    localStorage.setItem(LS_QUESTIONS_KEY, JSON.stringify(filtered));
  }
}

export async function submitStudentLead(lead: StudentLead): Promise<string> {
  const payload = {
    ...lead,
    createdAt: new Date().toISOString(),
  };

  let submissionId = "offline_lead";

  if (db) {
    try {
      const docRef = await addDoc(collection(db, "submissions"), payload);
      submissionId = docRef.id;
    } catch (e) {
      console.warn("Failed to submit lead to Firestore, saving locally", e);
    }
  }

  // Local storage backup
  if (typeof window !== "undefined") {
    const localLeads = await fetchStudentLeads();
    if (submissionId === "offline_lead") {
      submissionId = "lead_" + Date.now();
    }
    localLeads.unshift({ ...payload, id: submissionId });
    localStorage.setItem(LS_LEADS_KEY, JSON.stringify(localLeads));

    // Trigger Google Sheet Live Sync asynchronously
    try {
      const storedWebhook = localStorage.getItem("icat_gsheet_webhook") || "";
      const currentQuestions = await fetchQuestions();
      fetch("/api/sync-sheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead: payload,
          questions: currentQuestions,
          webhookUrl: storedWebhook,
        }),
      }).catch((err) => console.warn("Google Sheet sync notice:", err));
    } catch (sheetErr) {
      console.warn("Google Sheet dispatch error:", sheetErr);
    }
  }

  return submissionId;
}

export async function fetchStudentLeads(): Promise<StudentLead[]> {
  if (db) {
    try {
      const q = query(collection(db, "submissions"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as StudentLead[];
      }
    } catch (e) {
      console.warn("Error fetching leads from Firestore, using local data", e);
    }
  }

  if (typeof window !== "undefined") {
    const local = localStorage.getItem(LS_LEADS_KEY);
    if (local) {
      try {
        return JSON.parse(local) as StudentLead[];
      } catch (e) {
        console.error("Failed to parse local leads", e);
      }
    }
  }

  return [];
}

export { isFirebaseConfigured };
