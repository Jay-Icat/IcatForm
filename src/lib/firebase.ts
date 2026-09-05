import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  getDoc,
  doc, 
  setDoc, 
  deleteDoc, 
  query, 
  orderBy,
  onSnapshot,
  writeBatch,
  Firestore 
} from "firebase/firestore";
import { Question, StudentLead, Team } from "@/types/quiz";
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

// Default team definition
export const DEFAULT_TEAM: Team = {
  id: "default",
  name: "Campus Admissions (Default)",
  slug: "default",
  createdAt: "2026-01-01T00:00:00.000Z",
  description: "Primary college admission experience",
};

// Local Storage Helper Keys
const LS_TEAMS_KEY = "icat_teams_v1";
const LS_QUESTIONS_PREFIX = "icat_quiz_questions_";
const LS_LEADS_PREFIX = "icat_student_leads_";
const LS_LEGACY_QUESTIONS_KEY = "icat_quiz_questions_v1";
const LS_LEGACY_LEADS_KEY = "icat_student_leads_v1";

// Helper to remove any undefined fields before writing to Firestore
function sanitizeForFirestore<T extends Record<string, any>>(obj: T): Record<string, any> {
  const clean: Record<string, any> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val !== undefined) {
      clean[key] = val;
    }
  }
  return clean;
}

/* =========================================================================
   TEAM MANAGEMENT FUNCTIONS
   ========================================================================= */

export async function fetchTeams(): Promise<Team[]> {
  if (db) {
    try {
      const q = query(collection(db, "teams"), orderBy("createdAt", "asc"));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const teams = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Team[];

        // Make sure default team exists in array
        if (!teams.some((t) => t.id === "default")) {
          teams.unshift(DEFAULT_TEAM);
          // Seed default team doc asynchronously
          setDoc(doc(db, "teams", "default"), DEFAULT_TEAM).catch(() => {});
        }
        return teams;
      } else {
        // Seed default team in Firestore
        try {
          await setDoc(doc(db, "teams", "default"), DEFAULT_TEAM);
          return [DEFAULT_TEAM];
        } catch (e) {
          console.warn("Failed to seed default team:", e);
        }
      }
    } catch (e) {
      console.warn("Error reading teams from Firestore, falling back to local storage", e);
    }
  }

  // Fallback to LocalStorage
  if (typeof window !== "undefined") {
    const local = localStorage.getItem(LS_TEAMS_KEY);
    if (local) {
      try {
        const parsed = JSON.parse(local) as Team[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          if (!parsed.some((t) => t.id === "default")) {
            parsed.unshift(DEFAULT_TEAM);
          }
          return parsed;
        }
      } catch (err) {
        console.error("Failed to parse local teams", err);
      }
    }
    localStorage.setItem(LS_TEAMS_KEY, JSON.stringify([DEFAULT_TEAM]));
  }

  return [DEFAULT_TEAM];
}

export async function fetchTeam(teamId: string): Promise<Team | null> {
  if (!teamId || teamId === "default") {
    return DEFAULT_TEAM;
  }

  if (db) {
    try {
      const docSnap = await getDoc(doc(db, "teams", teamId));
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
        } as Team;
      }
    } catch (e) {
      console.warn(`Error fetching team ${teamId} from Firestore`, e);
    }
  }

  // Check local storage
  if (typeof window !== "undefined") {
    const teams = await fetchTeams();
    const found = teams.find((t) => t.id === teamId || t.slug === teamId);
    if (found) return found;
  }

  return null;
}

export async function createTeam(team: Team, cloneDefaultQuestions: boolean = true): Promise<void> {
  const cleanSlug = team.slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, "-").replace(/^-+|-+$/g, "");
  const payload: Team = {
    ...team,
    id: cleanSlug,
    slug: cleanSlug,
    createdAt: new Date().toISOString(),
  };

  if (db) {
    try {
      await setDoc(doc(db, "teams", cleanSlug), sanitizeForFirestore(payload));

      if (cloneDefaultQuestions) {
        const defaultQuestions = await fetchQuestions("default");
        const batch = writeBatch(db);
        defaultQuestions.forEach((q) => {
          const qRef = doc(db, "teams", cleanSlug, "questions", q.id);
          batch.set(qRef, sanitizeForFirestore(q));
        });
        await batch.commit();
      }
    } catch (e) {
      console.warn("Failed to write team to Firestore, saving locally", e);
    }
  }

  if (typeof window !== "undefined") {
    const teams = await fetchTeams();
    const existingIdx = teams.findIndex((t) => t.id === cleanSlug);
    if (existingIdx >= 0) {
      teams[existingIdx] = payload;
    } else {
      teams.push(payload);
    }
    localStorage.setItem(LS_TEAMS_KEY, JSON.stringify(teams));

    if (cloneDefaultQuestions) {
      const defaultQuestions = await fetchQuestions("default");
      localStorage.setItem(`${LS_QUESTIONS_PREFIX}${cleanSlug}_v1`, JSON.stringify(defaultQuestions));
    }
  }
}

export async function updateTeam(team: Team): Promise<void> {
  if (db) {
    try {
      await setDoc(doc(db, "teams", team.id), sanitizeForFirestore(team), { merge: true });
    } catch (e) {
      console.warn("Failed to update team in Firestore", e);
    }
  }

  if (typeof window !== "undefined") {
    const teams = await fetchTeams();
    const updated = teams.map((t) => (t.id === team.id ? { ...t, ...team } : t));
    localStorage.setItem(LS_TEAMS_KEY, JSON.stringify(updated));
  }
}

export async function deleteTeam(teamId: string): Promise<void> {
  if (teamId === "default") {
    alert("Cannot delete the default campus team.");
    return;
  }

  if (db) {
    try {
      // 1. Delete questions subcollection
      const qSnap = await getDocs(collection(db, "teams", teamId, "questions"));
      const qDeletes = qSnap.docs.map((d) => deleteDoc(doc(db, "teams", teamId, "questions", d.id)));
      await Promise.all(qDeletes);

      // 2. Delete submissions subcollection
      const subSnap = await getDocs(collection(db, "teams", teamId, "submissions"));
      const subDeletes = subSnap.docs.map((d) => deleteDoc(doc(db, "teams", teamId, "submissions", d.id)));
      await Promise.all(subDeletes);

      // 3. Delete team document
      await deleteDoc(doc(db, "teams", teamId));
    } catch (e) {
      console.warn("Failed to delete team from Firestore", e);
    }
  }

  if (typeof window !== "undefined") {
    const teams = await fetchTeams();
    const filtered = teams.filter((t) => t.id !== teamId);
    localStorage.setItem(LS_TEAMS_KEY, JSON.stringify(filtered));
    localStorage.removeItem(`${LS_QUESTIONS_PREFIX}${teamId}_v1`);
    localStorage.removeItem(`${LS_LEADS_PREFIX}${teamId}_v1`);
  }
}

/* =========================================================================
   QUESTION MANAGEMENT FUNCTIONS (TEAM-SCOPED)
   ========================================================================= */

export async function fetchQuestions(teamId: string = "default"): Promise<Question[]> {
  const effectiveTeamId = teamId || "default";

  if (db) {
    try {
      // 1. Try fetching from teams/{effectiveTeamId}/questions
      const teamQuestionsQuery = query(
        collection(db, "teams", effectiveTeamId, "questions"), 
        orderBy("order", "asc")
      );
      const snapshot = await getDocs(teamQuestionsQuery);
      
      if (!snapshot.empty) {
        return snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as Question[];
      }

      // 2. If it's the default team and empty, check the legacy root 'questions' collection
      if (effectiveTeamId === "default") {
        const legacyQuery = query(collection(db, "questions"), orderBy("order", "asc"));
        const legacySnap = await getDocs(legacyQuery);
        if (!legacySnap.empty) {
          const legacyQuestions = legacySnap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          })) as Question[];

          // Migrate/Copy to teams/default/questions
          try {
            const batch = writeBatch(db);
            legacyQuestions.forEach((q) => {
              batch.set(doc(db, "teams", "default", "questions", q.id), q);
            });
            await batch.commit();
          } catch {}

          return legacyQuestions;
        }

        // 3. Both are empty: seed default questions
        try {
          const batch = writeBatch(db);
          DEFAULT_QUESTIONS.forEach((q) => {
            batch.set(doc(db, "teams", "default", "questions", q.id), q);
            batch.set(doc(db, "questions", q.id), q); // backwards compatibility
          });
          await batch.commit();
          return DEFAULT_QUESTIONS;
        } catch (seedErr) {
          console.warn("Failed to seed default questions", seedErr);
        }
      }
    } catch (e) {
      console.warn(`Error reading questions for team ${effectiveTeamId} from Firestore`, e);
    }
  }

  // Fallback to LocalStorage
  if (typeof window !== "undefined") {
    const teamKey = `${LS_QUESTIONS_PREFIX}${effectiveTeamId}_v1`;
    let localData = localStorage.getItem(teamKey);

    if (!localData && effectiveTeamId === "default") {
      // Fallback to legacy key
      localData = localStorage.getItem(LS_LEGACY_QUESTIONS_KEY);
    }

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

    if (effectiveTeamId === "default") {
      localStorage.setItem(teamKey, JSON.stringify(DEFAULT_QUESTIONS));
      return DEFAULT_QUESTIONS;
    }
  }

  return effectiveTeamId === "default" ? DEFAULT_QUESTIONS : [];
}

export async function saveQuestion(question: Question, teamId: string = "default"): Promise<void> {
  const effectiveTeamId = teamId || "default";

  if (db) {
    try {
      await setDoc(doc(db, "teams", effectiveTeamId, "questions", question.id), sanitizeForFirestore(question));
      if (effectiveTeamId === "default") {
        setDoc(doc(db, "questions", question.id), sanitizeForFirestore(question)).catch(() => {});
      }
      return;
    } catch (e) {
      console.warn("Failed to write question to Firestore, saving locally", e);
    }
  }

  if (typeof window !== "undefined") {
    const questions = await fetchQuestions(effectiveTeamId);
    const existingIndex = questions.findIndex((q) => q.id === question.id);
    if (existingIndex >= 0) {
      questions[existingIndex] = question;
    } else {
      questions.push(question);
    }
    const teamKey = `${LS_QUESTIONS_PREFIX}${effectiveTeamId}_v1`;
    localStorage.setItem(teamKey, JSON.stringify(questions));
  }
}

export async function deleteQuestion(questionId: string, teamId: string = "default"): Promise<void> {
  const effectiveTeamId = teamId || "default";

  if (db) {
    try {
      await deleteDoc(doc(db, "teams", effectiveTeamId, "questions", questionId));
      if (effectiveTeamId === "default") {
        deleteDoc(doc(db, "questions", questionId)).catch(() => {});
      }
      return;
    } catch (e) {
      console.warn("Failed to delete question from Firestore", e);
    }
  }

  if (typeof window !== "undefined") {
    const questions = await fetchQuestions(effectiveTeamId);
    const filtered = questions.filter((q) => q.id !== questionId);
    const teamKey = `${LS_QUESTIONS_PREFIX}${effectiveTeamId}_v1`;
    localStorage.setItem(teamKey, JSON.stringify(filtered));
  }
}

/* =========================================================================
   STUDENT LEAD SUBMISSION FUNCTIONS (TEAM-SCOPED)
   ========================================================================= */

export async function submitStudentLead(lead: StudentLead, teamId: string = "default"): Promise<string> {
  const effectiveTeamId = teamId || "default";
  const payload: StudentLead = {
    ...lead,
    teamId: effectiveTeamId,
    createdAt: new Date().toISOString(),
  };

  const cleanName = lead.fullName.trim().replace(/[^a-zA-Z0-9 ]/g, "").replace(/\s+/g, "_");
  const phoneSuffix = lead.phoneNumber ? lead.phoneNumber.slice(-4) : Math.floor(Math.random() * 1000).toString();
  const customId = `${cleanName}_${phoneSuffix}`;

  let submissionId = "offline_lead";

  if (db) {
    try {
      await setDoc(doc(db, "teams", effectiveTeamId, "submissions", customId), sanitizeForFirestore(payload));
      // For default team, also mirror in root submissions
      if (effectiveTeamId === "default") {
        setDoc(doc(db, "submissions", customId), sanitizeForFirestore(payload)).catch(() => {});
      }
      submissionId = customId;
    } catch (e) {
      console.warn("Failed to submit lead to Firestore, saving locally", e);
    }
  }

  // Local storage backup
  if (typeof window !== "undefined") {
    const teamLeadsKey = `${LS_LEADS_PREFIX}${effectiveTeamId}_v1`;
    const localLeads = await fetchStudentLeads(effectiveTeamId);
    if (submissionId === "offline_lead") {
      submissionId = "lead_" + Date.now();
    }
    localLeads.unshift({ ...payload, id: submissionId });
    localStorage.setItem(teamLeadsKey, JSON.stringify(localLeads));

    // Trigger Google Sheet Live Sync asynchronously
    try {
      const storedWebhook = localStorage.getItem("icat_gsheet_webhook") || "";
      const currentQuestions = await fetchQuestions(effectiveTeamId);
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

export async function updateStudentLead(
  leadId: string, 
  answers: Record<string, string[]>, 
  teamId: string = "default"
): Promise<void> {
  const effectiveTeamId = teamId || "default";

  if (db && leadId && !leadId.startsWith("offline_lead") && !leadId.startsWith("lead_")) {
    try {
      await setDoc(
        doc(db, "teams", effectiveTeamId, "submissions", leadId), 
        { answers, completedAt: new Date().toISOString() }, 
        { merge: true }
      );
      if (effectiveTeamId === "default") {
        setDoc(
          doc(db, "submissions", leadId), 
          { answers, completedAt: new Date().toISOString() }, 
          { merge: true }
        ).catch(() => {});
      }
    } catch (e) {
      console.warn("Failed to update lead in Firestore", e);
    }
  }

  if (typeof window !== "undefined") {
    const teamLeadsKey = `${LS_LEADS_PREFIX}${effectiveTeamId}_v1`;
    const leads = await fetchStudentLeads(effectiveTeamId);
    const updated = leads.map((l) => (l.id === leadId ? { ...l, answers, completedAt: new Date().toISOString() } : l));
    localStorage.setItem(teamLeadsKey, JSON.stringify(updated));

    // Re-sync with Google Sheet if needed
    try {
      const storedWebhook = localStorage.getItem("icat_gsheet_webhook") || "";
      const currentQuestions = await fetchQuestions(effectiveTeamId);
      const updatedLead = updated.find((l) => l.id === leadId);
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

export async function deleteStudentLead(leadId: string, teamId: string = "default"): Promise<void> {
  const effectiveTeamId = teamId || "default";

  if (db && leadId && !leadId.startsWith("lead_")) {
    try {
      await deleteDoc(doc(db, "teams", effectiveTeamId, "submissions", leadId));
      if (effectiveTeamId === "default") {
        deleteDoc(doc(db, "submissions", leadId)).catch(() => {});
      }
    } catch (e) {
      console.warn("Failed to delete lead from Firestore", e);
    }
  }

  if (typeof window !== "undefined") {
    const teamLeadsKey = `${LS_LEADS_PREFIX}${effectiveTeamId}_v1`;
    const leads = await fetchStudentLeads(effectiveTeamId);
    const filtered = leads.filter((l) => l.id !== leadId);
    localStorage.setItem(teamLeadsKey, JSON.stringify(filtered));
  }
}

export async function clearAllStudentLeads(teamId: string = "default"): Promise<void> {
  const effectiveTeamId = teamId || "default";

  if (db) {
    try {
      const q = query(collection(db, "teams", effectiveTeamId, "submissions"));
      const snapshot = await getDocs(q);
      const deletePromises = snapshot.docs.map((docSnap) => 
        deleteDoc(doc(db, "teams", effectiveTeamId, "submissions", docSnap.id))
      );
      await Promise.all(deletePromises);

      if (effectiveTeamId === "default") {
        const legacyQ = query(collection(db, "submissions"));
        const legacySnap = await getDocs(legacyQ);
        await Promise.all(legacySnap.docs.map((d) => deleteDoc(doc(db, "submissions", d.id))));
      }
    } catch (e) {
      console.warn(`Failed to clear submissions for team ${effectiveTeamId} from Firestore`, e);
    }
  }

  if (typeof window !== "undefined") {
    localStorage.removeItem(`${LS_LEADS_PREFIX}${effectiveTeamId}_v1`);
    if (effectiveTeamId === "default") {
      localStorage.removeItem(LS_LEGACY_LEADS_KEY);
    }
  }
}

export async function fetchStudentLeads(teamId: string = "default"): Promise<StudentLead[]> {
  const effectiveTeamId = teamId || "default";

  if (db) {
    try {
      const q = query(
        collection(db, "teams", effectiveTeamId, "submissions"), 
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as StudentLead[];
      }

      // If default team has no submissions in subcollection yet, check root submissions
      if (effectiveTeamId === "default") {
        const legacyQ = query(collection(db, "submissions"), orderBy("createdAt", "desc"));
        const legacySnap = await getDocs(legacyQ);
        if (!legacySnap.empty) {
          return legacySnap.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          })) as StudentLead[];
        }
      }
    } catch (e) {
      console.warn(`Error fetching leads for team ${effectiveTeamId} from Firestore`, e);
    }
  }

  if (typeof window !== "undefined") {
    const teamKey = `${LS_LEADS_PREFIX}${effectiveTeamId}_v1`;
    let local = localStorage.getItem(teamKey);
    if (!local && effectiveTeamId === "default") {
      local = localStorage.getItem(LS_LEGACY_LEADS_KEY);
    }
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

export function subscribeToStudentLeads(
  callback: (leads: StudentLead[]) => void, 
  teamId: string = "default"
): () => void {
  const effectiveTeamId = teamId || "default";

  if (db) {
    try {
      const q = query(
        collection(db, "teams", effectiveTeamId, "submissions"), 
        orderBy("createdAt", "desc")
      );
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const leads = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          })) as StudentLead[];
          if (typeof window !== "undefined") {
            localStorage.setItem(`${LS_LEADS_PREFIX}${effectiveTeamId}_v1`, JSON.stringify(leads));
          }
          callback(leads);
        },
        (error) => {
          console.warn(`Real-time Firestore sync error for team ${effectiveTeamId}:`, error);
          fetchStudentLeads(effectiveTeamId).then(callback);
        }
      );
      return unsubscribe;
    } catch (e) {
      console.warn("Error establishing Firestore listener:", e);
    }
  }

  // Fallback
  fetchStudentLeads(effectiveTeamId).then(callback);
  return () => {};
}

export { isFirebaseConfigured };
