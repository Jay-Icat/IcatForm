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
  onSnapshot,
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

export async function updateStudentLead(leadId: string, answers: Record<string, string[]>): Promise<void> {
  if (db && leadId && !leadId.startsWith("offline_lead") && !leadId.startsWith("lead_")) {
    try {
      await setDoc(doc(db, "submissions", leadId), { answers }, { merge: true });
    } catch (e) {
      console.warn("Failed to update lead in Firestore", e);
    }
  }

  if (typeof window !== "undefined") {
    const leads = await fetchStudentLeads();
    const updated = leads.map(l => l.id === leadId ? { ...l, answers } : l);
    localStorage.setItem(LS_LEADS_KEY, JSON.stringify(updated));
    
    // Attempt re-sync with Google Sheet if needed
    try {
      const storedWebhook = localStorage.getItem("icat_gsheet_webhook") || "";
      const currentQuestions = await fetchQuestions();
      const updatedLead = updated.find(l => l.id === leadId);
      if (updatedLead) {
        fetch("/api/sync-sheet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lead: updatedLead,
            questions: currentQuestions,
            webhookUrl: storedWebhook,
          }),
        }).catch(() => {});
      }
    } catch (e) {}
  }
}


export async function deleteStudentLead(leadId: string): Promise<void> {
  if (db && leadId && !leadId.startsWith("lead_")) {
    try {
      await deleteDoc(doc(db, "submissions", leadId));
    } catch (e) {
      console.warn("Failed to delete lead from Firestore", e);
    }
  }

  if (typeof window !== "undefined") {
    const leads = await fetchStudentLeads();
    const filtered = leads.filter((l) => l.id !== leadId);
    localStorage.setItem(LS_LEADS_KEY, JSON.stringify(filtered));
  }
}

export async function clearAllStudentLeads(): Promise<void> {
  if (db) {
    try {
      const q = query(collection(db, "submissions"));
      const snapshot = await getDocs(q);
      const deletePromises = snapshot.docs.map((docSnap) => deleteDoc(doc(db, "submissions", docSnap.id)));
      await Promise.all(deletePromises);
    } catch (e) {
      console.warn("Failed to clear submissions from Firestore", e);
    }
  }

  if (typeof window !== "undefined") {
    localStorage.removeItem(LS_LEADS_KEY);
  }
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

export function subscribeToStudentLeads(callback: (leads: StudentLead[]) => void): () => void {
  if (db) {
    try {
      const q = query(collection(db, "submissions"), orderBy("createdAt", "desc"));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const leads = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          })) as StudentLead[];
          if (typeof window !== "undefined") {
            localStorage.setItem(LS_LEADS_KEY, JSON.stringify(leads));
          }
          callback(leads);
        },
        (error) => {
          console.warn("Real-time Firestore sync error:", error);
          // Fallback to fetch
          fetchStudentLeads().then(callback);
        }
      );
      return unsubscribe;
    } catch (e) {
      console.warn("Error establishing Firestore listener:", e);
    }
  }

  // Fallback
  fetchStudentLeads().then(callback);
  return () => {};
}

export { isFirebaseConfigured };
