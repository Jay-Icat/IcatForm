"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileSpreadsheet, 
  Plus, 
  Edit3, 
  Trash2, 
  Users, 
  HelpCircle, 
  Layers, 
  Search, 
  RefreshCw, 
  Database, 
  Home, 
  LogOut,
  Phone,
  Calendar,
  CheckSquare,
  CircleDot,
  Sheet,
  Copy,
  Check,
  SendHorizontal,
  ExternalLink,
  Zap,
  CheckCircle2,
  AlertCircle,
  Users2,
  Flame,
  AlertTriangle,
  ChevronDown
} from "lucide-react";
import { Question, StudentLead, Team } from "@/types/quiz";
import { 
  fetchQuestions, 
  saveQuestion, 
  deleteQuestion, 
  fetchStudentLeads, 
  deleteStudentLead,
  clearAllStudentLeads,
  subscribeToStudentLeads,
  fetchTeams,
  createTeam,
  deleteTeam,
  DEFAULT_TEAM,
  isFirebaseConfigured 
} from "@/lib/firebase";
import { exportLeadsToExcel } from "@/lib/excelExport";
import { QuestionEditorModal } from "./QuestionEditorModal";
import { CreateTeamModal } from "./CreateTeamModal";
import { sound } from "@/lib/sound";

interface AdminDashboardProps {
  onLogout: () => void;
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<"questions" | "leads" | "gsheet">("questions");
  const [teams, setTeams] = useState<Team[]>([DEFAULT_TEAM]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>("default");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [leads, setLeads] = useState<StudentLead[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Team Modals & Link Copy
  const [isCreateTeamModalOpen, setIsCreateTeamModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Google Sheets Webhook Configuration
  const [webhookUrl, setWebhookUrl] = useState("");
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [syncAllStatus, setSyncAllStatus] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  // Active Team Object
  const selectedTeam = teams.find((t) => t.id === selectedTeamId) || DEFAULT_TEAM;
  const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
  const activeTeamUrl = selectedTeamId === "default" 
    ? `${origin}/` 
    : `${origin}/${selectedTeam.slug || selectedTeamId}`;

  const loadAllData = useCallback(async (teamIdToLoad?: string) => {
    setIsLoading(true);
    try {
      const allTeams = await fetchTeams();
      setTeams(allTeams);

      const targetId = teamIdToLoad || selectedTeamId;
      const validId = allTeams.some((t) => t.id === targetId)
        ? targetId
        : allTeams[0]?.id || "default";

      setSelectedTeamId(validId);

      const [qData, lData] = await Promise.all([
        fetchQuestions(validId),
        fetchStudentLeads(validId),
      ]);
      setQuestions(qData.sort((a, b) => a.order - b.order));
      setLeads(lData);
    } catch (e) {
      console.error("Error loading dashboard data:", e);
    } finally {
      setIsLoading(false);
    }
  }, [selectedTeamId]);

  useEffect(() => {
    loadAllData();

    if (typeof window !== "undefined") {
      const savedUrl = localStorage.getItem("icat_gsheet_webhook") || "";
      setWebhookUrl(savedUrl);
    }
  }, [loadAllData]);

  // Real-time Firestore updates for the active team
  useEffect(() => {
    if (!selectedTeamId) return;

    const unsubscribe = subscribeToStudentLeads((liveLeads) => {
      setLeads(liveLeads);
    }, selectedTeamId);

    return () => {
      unsubscribe();
    };
  }, [selectedTeamId]);

  const handleTeamChange = async (newTeamId: string) => {
    setSelectedTeamId(newTeamId);
    sound.playSelect();
    setIsLoading(true);
    try {
      const [qData, lData] = await Promise.all([
        fetchQuestions(newTeamId),
        fetchStudentLeads(newTeamId),
      ]);
      setQuestions(qData.sort((a, b) => a.order - b.order));
      setLeads(lData);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTeam = async (newTeam: Team, cloneQuestions: boolean) => {
    await createTeam(newTeam, cloneQuestions);
    await loadAllData(newTeam.id);
  };

  const handleDeleteActiveTeam = async () => {
    if (selectedTeamId === "default") {
      alert("The default campus team cannot be deleted.");
      return;
    }

    const confirmed = confirm(
      `⚠️ WARNING: Are you sure you want to permanently delete team "${selectedTeam.name}"?\n\nAll questions and ${leads.length} student submissions for this team will be permanently deleted from Firestore!`
    );

    if (confirmed) {
      sound.playClick();
      await deleteTeam(selectedTeamId);
      await loadAllData("default");
      alert(`Team "${selectedTeam.name}" has been deleted.`);
    }
  };

  const handleCopyTeamLink = () => {
    navigator.clipboard.writeText(activeTeamUrl);
    setCopiedLink(true);
    sound.playSuccess();
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleSaveWebhook = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("icat_gsheet_webhook", webhookUrl.trim());
      sound.playSuccess();
      alert("Google Sheet Webhook URL saved successfully!");
    }
  };

  const handleTestWebhook = async () => {
    if (!webhookUrl.trim()) {
      alert("Please enter a Google Sheet Webhook URL first.");
      return;
    }
    setTestStatus("Connecting to Google Apps Script...");
    sound.playSelect();
    try {
      const res = await fetch("/api/sync-sheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ping",
          webhookUrl: webhookUrl.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        sound.playSuccess();
        setTestStatus("🟢 Connection Verified! Google Apps Script is online and responding.");
      } else {
        setTestStatus(`🔴 Failed: ${data.message || data.error || "Could not reach webhook"}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error";
      setTestStatus(`🔴 Error: ${msg}`);
    }
  };

  // Sync All Existing Leads for active team to Google Sheets
  const handleSyncAllLeads = async () => {
    if (!webhookUrl.trim()) {
      alert("Please enter and save a Google Sheet Webhook URL first.");
      return;
    }
    if (leads.length === 0) {
      alert("No student leads for this team to sync.");
      return;
    }

    setIsSyncingAll(true);
    setSyncAllStatus(`Transmitting ${leads.length} leads for team "${selectedTeam.name}" to Google Sheets...`);
    sound.playSelect();

    try {
      const res = await fetch("/api/sync-sheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "bulkAppend",
          leads: leads,
          questions: questions,
          webhookUrl: webhookUrl.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        sound.playSuccess();
        setSyncAllStatus(`✅ Success! ${leads.length} leads have been synced to your live Google Sheet.`);
      } else {
        setSyncAllStatus(`❌ Sync Failed: ${data.message || data.error || "Check your script permissions"}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error";
      setSyncAllStatus(`❌ Error: ${msg}`);
    } finally {
      setIsSyncingAll(false);
    }
  };

  // Delete an individual lead
  const handleDeleteLead = async (leadId: string) => {
    if (confirm("Are you sure you want to delete this candidate submission?")) {
      await deleteStudentLead(leadId, selectedTeamId);
      sound.playClick();
      const updatedLeads = await fetchStudentLeads(selectedTeamId);
      setLeads(updatedLeads);
    }
  };

  // Clear all leads for selected team
  const handleClearAllLeads = async () => {
    if (leads.length === 0) {
      alert("No stored submissions to clear.");
      return;
    }
    const confirmed = confirm(
      `⚠️ WARNING: Are you sure you want to permanently delete all ${leads.length} submissions for team "${selectedTeam.name}" from Firebase Firestore? Make sure you have exported to Excel or synced to Google Sheets first!`
    );
    if (confirmed) {
      await clearAllStudentLeads(selectedTeamId);
      sound.playClick();
      setLeads([]);
      alert(`All submissions for "${selectedTeam.name}" have been successfully cleared.`);
    }
  };

  const handleSaveQuestion = async (q: Question) => {
    await saveQuestion(q, selectedTeamId);
    const updatedQ = await fetchQuestions(selectedTeamId);
    setQuestions(updatedQ.sort((a, b) => a.order - b.order));
    sound.playSuccess();
  };

  const handleDeleteQuestion = async (id: string) => {
    if (confirm("Are you sure you want to delete this question?")) {
      await deleteQuestion(id, selectedTeamId);
      const updatedQ = await fetchQuestions(selectedTeamId);
      setQuestions(updatedQ.sort((a, b) => a.order - b.order));
      sound.playClick();
    }
  };

  const handleExportExcel = () => {
    sound.playSuccess();
    exportLeadsToExcel(leads, questions, selectedTeam.name);
  };

  const filteredLeads = leads.filter((lead) => {
    const term = searchQuery.toLowerCase();
    return (
      lead.fullName.toLowerCase().includes(term) ||
      lead.phoneNumber.includes(term) ||
      (lead.gender && lead.gender.toLowerCase().includes(term))
    );
  });

  const appsScriptCode = `function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var payload;
    
    if (e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    } else if (e.parameter) {
      payload = e.parameter;
    } else {
      payload = {};
    }
    
    var action = payload.action || "appendRow";
    
    if (action === "ping") {
      return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "ICAT Google Sheet Webhook is active!" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Function to ensure header row formatting
    function ensureHeaders(sampleData) {
      if (sheet.getLastRow() === 0) {
        var headers = Object.keys(sampleData);
        sheet.appendRow(headers);
        sheet.getRange(1, 1, 1, headers.length)
          .setFontWeight("bold")
          .setBackground("#dc2626")
          .setFontColor("#ffffff");
        sheet.setFrozenRows(1);
      }
      return sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    }
    
    // Handle Bulk Append of leads
    if (action === "bulkAppend" && payload.rows && payload.rows.length > 0) {
      var headers = ensureHeaders(payload.rows[0]);
      var allRows = [];
      
      for (var r = 0; r < payload.rows.length; r++) {
        var rowData = payload.rows[r];
        var row = [];
        for (var i = 0; i < headers.length; i++) {
          row.push(rowData[headers[i]] || "");
        }
        allRows.push(row);
      }
      
      if (allRows.length > 0) {
        sheet.getRange(sheet.getLastRow() + 1, 1, allRows.length, headers.length).setValues(allRows);
      }
      
      return ContentService.createTextOutput(JSON.stringify({ status: "success", count: allRows.length }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Handle Single Lead Append
    if (payload.data) {
      var data = payload.data;
      var headers = ensureHeaders(data);
      var row = [];
      for (var i = 0; i < headers.length; i++) {
        row.push(data[headers[i]] || "");
      }
      sheet.appendRow(row);
      
      return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: "ignored", message: "No data payload found" }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;

  const copyAppsScript = () => {
    navigator.clipboard.writeText(appsScriptCode);
    setCopiedCode(true);
    sound.playSuccess();
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#050814] text-slate-200 pb-16 cursor-default select-text">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-slate-950/85 backdrop-blur-xl border-b border-white/10 px-3 sm:px-8 py-3.5 sm:py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-3">
              <div className="w-8 sm:w-9 h-8 sm:h-9 rounded-xl bg-gradient-to-tr from-red-600 to-blue-600 flex items-center justify-center font-black text-white text-sm sm:text-base shadow-lg shadow-red-600/30 flex-shrink-0">
                ICAT
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-bold text-white leading-tight">
                  Admin Console
                </h1>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <Database className="w-3 h-3 text-blue-400" />
                  <span>{isFirebaseConfigured ? "Firebase Cloud Multi-Team Sync" : "Local Storage Mode"}</span>
                </div>
              </div>
            </div>

            {/* Mobile-only logout */}
            <div className="flex sm:hidden items-center gap-2">
              <button
                onClick={onLogout}
                className="glass-panel p-2 rounded-xl text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={handleExportExcel}
              className="btn-3d-emerald px-4 py-2 rounded-xl text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 cursor-pointer"
              title={`Export leads for ${selectedTeam.name}`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export ({selectedTeam.name})</span>
            </button>

            <a
              href={activeTeamUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="glass-panel px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 cursor-pointer hover:border-white/30"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Live Team Page</span>
            </a>

            <button
              onClick={onLogout}
              className="hidden sm:flex glass-panel p-2 rounded-xl text-slate-400 hover:text-red-400 transition-colors cursor-pointer hover:border-red-500/40"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-3 sm:px-8 pt-6 space-y-6">

        {/* =========================================================================
            TEAM SWITCHER & SHAREABLE LINK BANNER
            ========================================================================= */}
        <div className="glass-panel p-4 sm:p-5 rounded-3xl border border-white/10 bg-slate-950/70 shadow-2xl space-y-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            
            {/* Team Selector & New Team Button */}
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-red-600/20 to-blue-600/20 text-blue-400 border border-white/10 shadow-inner">
                  <Users2 className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">
                    Active Team Filter
                  </span>
                  <div className="relative mt-1">
                    <select
                      value={selectedTeamId}
                      onChange={(e) => handleTeamChange(e.target.value)}
                      className="bg-slate-900/90 border border-white/20 text-white font-bold text-sm sm:text-base rounded-xl px-3.5 py-2 pr-9 focus:outline-none focus:border-blue-500 cursor-pointer appearance-none shadow-lg transition-colors hover:border-white/30"
                    >
                      {teams.map((t) => (
                        <option key={t.id} value={t.id} className="bg-slate-950 text-white">
                          {t.name} {t.id === "default" ? "★ Default Campus" : `(/${t.slug})`}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end">
                <button
                  onClick={() => setIsCreateTeamModalOpen(true)}
                  className="btn-3d-blue px-3.5 py-2 rounded-xl text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg shadow-blue-600/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Team</span>
                </button>

                {selectedTeamId !== "default" && (
                  <button
                    onClick={handleDeleteActiveTeam}
                    className="glass-panel px-3 py-2 rounded-xl text-red-400 hover:text-red-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer hover:border-red-500/40 transition-colors"
                    title={`Delete team "${selectedTeam.name}"`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Delete Team</span>
                  </button>
                )}
              </div>
            </div>

            {/* Shareable Team Link & Quick Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto">
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-black/50 border border-white/10 font-mono text-xs text-slate-300 overflow-hidden shadow-inner">
                <span className="text-slate-500 hidden sm:inline text-[11px] uppercase tracking-wider font-sans font-bold">Live Form:</span>
                <span className="text-blue-400 font-semibold truncate max-w-[220px] sm:max-w-[300px]">
                  {activeTeamUrl}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyTeamLink}
                  className="flex-1 sm:flex-none glass-panel px-3.5 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 text-slate-200 hover:text-white cursor-pointer hover:border-blue-500/50 transition-all active:scale-95 shadow-md"
                  title="Copy Live Link for this Team"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-blue-400" />}
                  <span>{copiedLink ? "Copied!" : "Copy Link"}</span>
                </button>

                <a
                  href={activeTeamUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-panel p-2.5 rounded-xl text-slate-300 hover:text-white hover:border-white/30 transition-colors flex items-center justify-center shadow-md"
                  title="Open live team form in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

          </div>
        </div>

        {/* Quick Stats Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4"
        >
          <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-white/10 flex items-center justify-between shadow-lg">
            <div>
              <p className="text-[11px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Questions ({selectedTeam.name})
              </p>
              <h3 className="text-xl sm:text-2xl font-black text-white mt-0.5">{questions.length}</h3>
            </div>
            <div className="p-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
              <HelpCircle className="w-5 sm:w-6 h-5 sm:h-6" />
            </div>
          </div>

          <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-white/10 flex items-center justify-between shadow-lg">
            <div>
              <p className="text-[11px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Leads Collected ({selectedTeam.name})
              </p>
              <h3 className="text-xl sm:text-2xl font-black text-white mt-0.5">{leads.length}</h3>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Users className="w-5 sm:w-6 h-5 sm:h-6" />
            </div>
          </div>

          <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-white/10 flex items-center justify-between shadow-lg">
            <div>
              <p className="text-[11px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Active Teams</p>
              <h3 className="text-xl sm:text-2xl font-black text-emerald-400 mt-0.5 flex items-center gap-2">
                <span>{teams.length} Teams</span>
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Users2 className="w-5 sm:w-6 h-5 sm:h-6" />
            </div>
          </div>
        </motion.div>

        {/* Tab Switcher & Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/90 border border-white/10 w-full sm:w-auto overflow-x-auto">
            <button
              onClick={() => {
                sound.playSelect();
                setActiveTab("questions");
              }}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === "questions"
                  ? "bg-red-600 text-white shadow-lg shadow-red-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Questions ({questions.length})</span>
            </button>

            <button
              onClick={() => {
                sound.playSelect();
                setActiveTab("leads");
              }}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === "leads"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Student Leads ({leads.length})</span>
            </button>

            <button
              onClick={() => {
                sound.playSelect();
                setActiveTab("gsheet");
              }}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === "gsheet"
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Sheet className="w-4 h-4" />
              <span>Google Sheet Sync</span>
            </button>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={() => {
                sound.playClick();
                loadAllData();
              }}
              className="glass-panel p-2.5 rounded-xl text-slate-300 hover:text-white transition-all cursor-pointer hover:border-white/30"
              title="Refresh Data from Cloud"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>

            {activeTab === "questions" && (
              <button
                onClick={() => {
                  sound.playClick();
                  setEditingQuestion(null);
                  setIsModalOpen(true);
                }}
                className="btn-3d-red px-3.5 py-2 rounded-xl text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 cursor-pointer shadow-lg shadow-red-600/30"
              >
                <Plus className="w-4 h-4" />
                <span>Add Question ({selectedTeam.name})</span>
              </button>
            )}

            {activeTab === "leads" && leads.length > 0 && (
              <button
                onClick={handleClearAllLeads}
                className="px-3 py-2 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                title={`Clear all leads for ${selectedTeam.name}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Team Leads</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Content with AnimatePresence */}
        <AnimatePresence mode="wait">
          {/* Tab 1: Questions Manager */}
          {activeTab === "questions" && (
            <motion.div
              key={`questions-tab-${selectedTeamId}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-3 sm:space-y-4"
            >
              <div className="flex items-center justify-between px-1">
                <p className="text-xs font-semibold text-slate-400">
                  Managing custom question set for: <span className="text-white font-bold">{selectedTeam.name}</span>
                </p>
                <span className="text-xs text-slate-500">
                  {questions.length} total questions
                </span>
              </div>

              {questions.length === 0 ? (
                <div className="glass-panel rounded-2xl p-12 text-center text-slate-400 space-y-3 border border-white/10">
                  <HelpCircle className="w-10 h-10 text-slate-600 mx-auto" />
                  <p className="text-sm">No questions configured for team "{selectedTeam.name}" yet.</p>
                  <button
                    onClick={() => {
                      sound.playClick();
                      setEditingQuestion(null);
                      setIsModalOpen(true);
                    }}
                    className="btn-3d-red px-4 py-2 rounded-xl text-white text-xs font-bold inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create First Question</span>
                  </button>
                </div>
              ) : (
                questions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="glass-panel rounded-2xl p-4 sm:p-5 border border-white/10 hover:border-white/20 transition-all space-y-3 shadow-lg"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div className="flex items-start sm:items-center gap-3">
                        <span className="w-6 sm:w-7 h-6 sm:h-7 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 sm:mt-0">
                          {idx + 1}
                        </span>
                        <h4 className="text-sm sm:text-base font-bold text-white leading-snug">{q.questionText}</h4>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                          q.type === "multiple" 
                            ? "bg-blue-500/10 text-blue-400 border border-blue-500/30" 
                            : "bg-red-500/10 text-red-400 border border-red-500/30"
                        }`}>
                          {q.type === "multiple" ? <CheckSquare className="w-3 h-3" /> : <CircleDot className="w-3 h-3" />}
                          <span>{q.type === "multiple" ? "Multi-Select" : "Single-Select"}</span>
                        </span>

                        {q.category && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-300">
                            {q.category}
                          </span>
                        )}

                        <button
                          onClick={() => {
                            sound.playClick();
                            setEditingQuestion(q);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg glass-panel hover:text-blue-400 text-slate-300 cursor-pointer"
                          title="Edit Question"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="p-1.5 rounded-lg glass-panel hover:text-red-400 text-slate-300 cursor-pointer"
                          title="Delete Question"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Options Preview */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-white/5">
                      {q.options.map((opt, optIdx) => (
                        <div
                          key={opt.id || optIdx}
                          className="px-3 py-2 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-300 flex items-center gap-2"
                        >
                          <span className="w-4 h-4 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span className="truncate">{opt.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}

          {/* Tab 2: Leads & Submissions */}
          {activeTab === "leads" && (
            <motion.div
              key={`leads-tab-${selectedTeamId}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {/* Search & Actions Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:max-w-md">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder={`Search submissions for ${selectedTeam.name}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-white text-xs sm:text-sm cursor-text"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                  {webhookUrl && (
                    <button
                      onClick={handleSyncAllLeads}
                      disabled={isSyncingAll}
                      className="btn-3d-emerald px-4 py-2 rounded-xl text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-600/20"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-300" />
                      <span>{isSyncingAll ? "Syncing..." : `Sync (${leads.length}) to Sheet`}</span>
                    </button>
                  )}
                </div>
              </div>

              {syncAllStatus && (
                <div className="p-3 rounded-xl bg-slate-900 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{syncAllStatus}</span>
                </div>
              )}

              {filteredLeads.length === 0 ? (
                <div className="glass-panel rounded-2xl p-12 text-center text-slate-400 text-sm space-y-2 border border-white/10">
                  <Users className="w-10 h-10 text-slate-600 mx-auto" />
                  <p>No student submissions found for team "{selectedTeam.name}".</p>
                  <p className="text-xs text-slate-500">
                    Share the live link <span className="text-blue-400 font-mono">{activeTeamUrl}</span> with candidates to start receiving responses.
                  </p>
                </div>
              ) : (
                <>
                  {/* Mobile-Friendly Cards View */}
                  <div className="block lg:hidden space-y-3">
                    {filteredLeads.map((lead, lIdx) => (
                      <div
                        key={lead.id || lead.createdAt || lIdx}
                        className="glass-panel rounded-2xl p-4 border border-white/10 space-y-3 shadow-lg"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="text-sm font-bold text-white">{lead.fullName}</h4>
                            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                              <Phone className="w-3 h-3 text-red-400" />
                              <a href={`tel:${lead.phoneNumber}`} className="hover:text-blue-400 font-mono">
                                {lead.phoneNumber}
                              </a>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300">
                              {lead.gender || "N/A"}
                            </span>
                            <button
                              onClick={() => lead.id && handleDeleteLead(lead.id)}
                              className="p-1 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                              title="Delete Submission"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1 border-t border-white/5">
                          <Calendar className="w-3 h-3 text-blue-400" />
                          <span>DOB: {lead.birthday || "N/A"}</span>
                          <span className="text-slate-600">•</span>
                          <span>
                            {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : ""}
                          </span>
                        </div>

                        {/* Quiz Answers Details */}
                        <div className="space-y-1.5 pt-1.5 border-t border-white/5">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Candidate Answers:</p>
                          {questions.map((q, qIndex) => {
                            const ans = lead.answers?.[q.id];
                            const ansText = Array.isArray(ans) ? ans.join(", ") : ans || "No Answer";
                            return (
                              <div key={q.id} className="text-xs">
                                <span className="text-slate-400 font-medium">Q{qIndex + 1}: </span>
                                <span className="text-slate-200 font-semibold">{ansText}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Full Table View */}
                  <div className="hidden lg:block glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-300">
                        <thead className="bg-slate-900/90 text-slate-400 font-semibold border-b border-white/10 uppercase tracking-wider text-[11px]">
                          <tr>
                            <th className="py-3.5 px-4">#</th>
                            <th className="py-3.5 px-4">Candidate</th>
                            <th className="py-3.5 px-4">Phone</th>
                            <th className="py-3.5 px-4">Gender & DOB</th>
                            <th className="py-3.5 px-4">Answers Breakdown</th>
                            <th className="py-3.5 px-4">Date</th>
                            <th className="py-3.5 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {filteredLeads.map((lead, idx) => (
                            <tr key={lead.id || idx} className="hover:bg-white/5 transition-colors">
                              <td className="py-3 px-4 font-mono text-slate-400">{idx + 1}</td>
                              <td className="py-3 px-4 font-bold text-white whitespace-nowrap">
                                {lead.fullName}
                              </td>
                              <td className="py-3 px-4 font-mono text-slate-300 whitespace-nowrap">
                                <a href={`tel:${lead.phoneNumber}`} className="hover:text-blue-400">
                                  {lead.phoneNumber}
                                </a>
                              </td>
                              <td className="py-3 px-4 whitespace-nowrap">
                                <div className="text-white font-medium">{lead.gender || "Not Specified"}</div>
                                <div className="text-[11px] text-slate-400">DOB: {lead.birthday || "N/A"}</div>
                              </td>
                              <td className="py-3 px-4 max-w-xs">
                                <div className="space-y-1">
                                  {questions.map((q, qIdx) => {
                                    const ans = lead.answers?.[q.id];
                                    const ansText = Array.isArray(ans) ? ans.join(", ") : ans || "—";
                                    return (
                                      <div key={q.id} className="text-[11px] truncate">
                                        <span className="text-slate-400">Q{qIdx + 1}: </span>
                                        <span className="text-white font-medium">{ansText}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </td>
                              <td className="py-3 px-4 whitespace-nowrap text-slate-400 text-[11px]">
                                {lead.createdAt ? new Date(lead.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) : "N/A"}
                              </td>
                              <td className="py-3 px-4 text-right whitespace-nowrap">
                                <button
                                  onClick={() => lead.id && handleDeleteLead(lead.id)}
                                  className="p-1.5 rounded-lg glass-panel hover:text-red-400 text-slate-400 hover:border-red-500/30 transition-colors"
                                  title="Delete submission"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* Tab 3: Google Sheets Webhook Configuration */}
          {activeTab === "gsheet" && (
            <motion.div
              key="gsheet-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Webhook URL Config Card */}
              <div className="glass-panel rounded-2xl p-5 sm:p-6 border border-white/10 space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Sheet className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Google Sheet Live Integration</h3>
                    <p className="text-xs text-slate-400">
                      Every submission from all teams is automatically appended as a new row to your Google Sheet with a Team column.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Google Apps Script Webhook URL
                  </label>
                  <div className="flex flex-col sm:flex-row items-center gap-2.5">
                    <input
                      type="url"
                      placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl glass-input text-white text-xs sm:text-sm font-mono cursor-text"
                    />
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={handleSaveWebhook}
                        className="btn-3d-emerald px-4 py-2.5 rounded-xl text-white text-xs font-bold whitespace-nowrap cursor-pointer flex-1 sm:flex-none"
                      >
                        Save URL
                      </button>
                      <button
                        onClick={handleTestWebhook}
                        className="glass-panel px-4 py-2.5 rounded-xl text-slate-300 hover:text-white text-xs font-semibold whitespace-nowrap cursor-pointer flex-1 sm:flex-none"
                      >
                        Test Connection
                      </button>
                    </div>
                  </div>
                </div>

                {testStatus && (
                  <div className="p-3 rounded-xl bg-slate-900 border border-white/10 text-xs font-mono">
                    {testStatus}
                  </div>
                )}
              </div>

              {/* Step-by-Step Setup Guide */}
              <div className="glass-panel rounded-2xl p-5 sm:p-6 border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Google Apps Script Setup (1 Minute Setup)</span>
                  </h4>
                  <button
                    onClick={copyAppsScript}
                    className="glass-panel px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? "Copied Code!" : "Copy Script"}</span>
                  </button>
                </div>

                <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-300">
                  <li>Open your Google Sheet $\to$ Click <strong>Extensions</strong> in the top menu $\to$ <strong>Apps Script</strong>.</li>
                  <li>Delete any existing code, paste the script below, and click <strong>Save</strong> (Ctrl+S).</li>
                  <li>Click <strong>Deploy</strong> (top right) $\to$ <strong>New deployment</strong>.</li>
                  <li>Select <strong>Web app</strong>, set <em>Execute as</em>: <strong>Me</strong>, and <em>Who has access</em>: <strong>Anyone</strong>.</li>
                  <li>Click <strong>Deploy</strong>, authorize when prompted, copy the <strong>Web app URL</strong>, paste it into the box above and click <strong>Save URL</strong>!</li>
                </ol>

                {/* Code Snippet */}
                <div className="relative rounded-xl bg-slate-950 p-4 border border-white/10 font-mono text-[11px] text-emerald-300 overflow-x-auto max-h-56 select-all cursor-text">
                  <pre>{appsScriptCode}</pre>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Question Editor Modal */}
      <QuestionEditorModal
        isOpen={isModalOpen}
        question={editingQuestion}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveQuestion}
        existingCount={questions.length}
      />

      {/* Create Team Modal */}
      <CreateTeamModal
        isOpen={isCreateTeamModalOpen}
        onClose={() => setIsCreateTeamModalOpen(false)}
        onCreate={handleCreateTeam}
        existingSlugs={teams.map((t) => t.slug)}
      />
    </div>
  );
}
