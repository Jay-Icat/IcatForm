"use client";

import React, { useState, useEffect } from "react";
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
  AlertTriangle
} from "lucide-react";
import { Question, StudentLead } from "@/types/quiz";
import { 
  fetchQuestions, 
  saveQuestion, 
  deleteQuestion, 
  fetchStudentLeads, 
  deleteStudentLead,
  clearAllStudentLeads,
  subscribeToStudentLeads,
  isFirebaseConfigured 
} from "@/lib/firebase";
import { exportLeadsToExcel } from "@/lib/excelExport";
import { QuestionEditorModal } from "./QuestionEditorModal";
import { sound } from "@/lib/sound";

interface AdminDashboardProps {
  onLogout: () => void;
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<"questions" | "leads" | "gsheet">("questions");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [leads, setLeads] = useState<StudentLead[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Google Sheets Webhook Configuration
  const [webhookUrl, setWebhookUrl] = useState("");
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [syncAllStatus, setSyncAllStatus] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [qData, lData] = await Promise.all([
        fetchQuestions(),
        fetchStudentLeads(),
      ]);
      setQuestions(qData.sort((a, b) => a.order - b.order));
      setLeads(lData);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Subscribe to real-time updates from Firebase Firestore
    const unsubscribe = subscribeToStudentLeads((liveLeads) => {
      setLeads(liveLeads);
    });

    if (typeof window !== "undefined") {
      const savedUrl = localStorage.getItem("icat_gsheet_webhook") || "";
      setWebhookUrl(savedUrl);
    }

    return () => {
      unsubscribe();
    };
  }, []);

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

  // Sync All Existing Leads to Google Sheets in Bulk
  const handleSyncAllLeads = async () => {
    if (!webhookUrl.trim()) {
      alert("Please enter and save a Google Sheet Webhook URL first.");
      return;
    }
    if (leads.length === 0) {
      alert("No student leads to sync.");
      return;
    }

    setIsSyncingAll(true);
    setSyncAllStatus(`Transmitting all ${leads.length} leads to Google Sheets...`);
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
        setSyncAllStatus(`✅ Success! All ${leads.length} leads have been synced to your live Google Sheet.`);
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
      await deleteStudentLead(leadId);
      sound.playClick();
      loadData();
    }
  };

  // Clear all leads from Firestore and local storage
  const handleClearAllLeads = async () => {
    if (leads.length === 0) {
      alert("No stored submissions to clear.");
      return;
    }
    const confirmed = confirm(
      `⚠️ WARNING: Are you sure you want to permanently delete all ${leads.length} submissions from Firebase Firestore? Make sure you have exported to Excel or synced to Google Sheets first!`
    );
    if (confirmed) {
      await clearAllStudentLeads();
      sound.playClick();
      setLeads([]);
      alert("All submissions have been successfully cleared from Firestore and storage.");
    }
  };

  const handleSaveQuestion = async (q: Question) => {
    await saveQuestion(q);
    await loadData();
    sound.playSuccess();
  };

  const handleDeleteQuestion = async (id: string) => {
    if (confirm("Are you sure you want to delete this question?")) {
      await deleteQuestion(id);
      await loadData();
      sound.playClick();
    }
  };

  const handleExportExcel = () => {
    sound.playSuccess();
    exportLeadsToExcel(leads, questions);
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
    
    // Handle Bulk Append of all leads
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
                  <span>{isFirebaseConfigured ? "Firebase Cloud Live Sync" : "Local Storage Mode"}</span>
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
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export (.xlsx)</span>
            </button>

            <Link
              href="/"
              className="glass-panel px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 cursor-pointer hover:border-white/30"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Live Site</span>
            </Link>

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
        {/* Quick Stats Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4"
        >
          <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-white/10 flex items-center justify-between shadow-lg">
            <div>
              <p className="text-[11px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Questions</p>
              <h3 className="text-xl sm:text-2xl font-black text-white mt-0.5">{questions.length}</h3>
            </div>
            <div className="p-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
              <HelpCircle className="w-5 sm:w-6 h-5 sm:h-6" />
            </div>
          </div>

          <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-white/10 flex items-center justify-between shadow-lg">
            <div>
              <p className="text-[11px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">Student Leads (Cloud)</p>
              <h3 className="text-xl sm:text-2xl font-black text-white mt-0.5">{leads.length}</h3>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Users className="w-5 sm:w-6 h-5 sm:h-6" />
            </div>
          </div>

          <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-white/10 flex items-center justify-between shadow-lg">
            <div>
              <p className="text-[11px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">Live Sync Status</p>
              <h3 className="text-xs sm:text-sm font-semibold text-emerald-400 mt-1 flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${webhookUrl ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
                <span>{webhookUrl ? "Google Sheet Linked" : "Not Configured"}</span>
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Sheet className="w-5 sm:w-6 h-5 sm:h-6" />
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
                loadData();
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
                className="btn-3d-red px-3.5 py-2 rounded-xl text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Question</span>
              </button>
            )}

            {activeTab === "leads" && leads.length > 0 && (
              <button
                onClick={handleClearAllLeads}
                className="px-3 py-2 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Clear All Submissions"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All Data</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Content with AnimatePresence */}
        <AnimatePresence mode="wait">
          {/* Tab 1: Questions Manager */}
          {activeTab === "questions" && (
            <motion.div
              key="questions-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-3 sm:space-y-4"
            >
              {questions.length === 0 ? (
                <div className="glass-panel rounded-2xl p-10 text-center text-slate-400 text-sm">
                  No questions found. Click "Add Question" to create your first one.
                </div>
              ) : (
                questions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="glass-panel rounded-2xl p-4 sm:p-5 border border-white/10 hover:border-white/20 transition-all space-y-3"
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
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="p-1.5 rounded-lg glass-panel hover:text-red-400 text-slate-300 cursor-pointer"
                          title="Delete Question"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* 4 Options Preview */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-white/5">
                      {q.options.map((opt, oIdx) => (
                        <div
                          key={opt.id || oIdx}
                          className="p-2 sm:p-2.5 rounded-xl bg-slate-900/60 border border-white/5 text-[11px] sm:text-xs text-slate-300 flex items-center gap-2"
                        >
                          <span className="w-4 h-4 sm:w-5 sm:h-5 rounded bg-slate-800 text-slate-400 flex items-center justify-center font-bold text-[9px] sm:text-[10px] flex-shrink-0">
                            {["A", "B", "C", "D"][oIdx]}
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

          {/* Tab 2: Student Leads & Detailed Responses */}
          {activeTab === "leads" && (
            <motion.div
              key="leads-tab"
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
                    placeholder="Search by student name, phone, or gender..."
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
                      className="btn-3d-emerald px-4 py-2 rounded-xl text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-300" />
                      <span>{isSyncingAll ? "Syncing..." : `Sync All (${leads.length}) to Sheet`}</span>
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
                <div className="glass-panel rounded-2xl p-10 text-center text-slate-400 text-sm">
                  No student submissions found matching your search.
                </div>
              ) : (
                <>
                  {/* Mobile-Friendly Cards View (Visible on Small Screens) */}
                  <div className="block lg:hidden space-y-3">
                    {filteredLeads.map((lead, lIdx) => (
                      <div
                        key={lead.id || lead.createdAt || lIdx}
                        className="glass-panel rounded-2xl p-4 border border-white/10 space-y-3"
                      >
                        <div className="flex items-center justify-between border-b border-white/5 pb-2">
                          <div>
                            <h4 className="text-sm font-bold text-white">{lead.fullName}</h4>
                            <p className="text-[10px] text-slate-400">
                              {lead.createdAt ? new Date(lead.createdAt).toLocaleString("en-IN") : "N/A"}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/10 text-red-300 border border-red-500/20">
                              {lead.gender || "Gender: N/A"}
                            </span>

                            {lead.id && (
                              <button
                                onClick={() => handleDeleteLead(lead.id!)}
                                className="p-1 rounded-lg glass-panel text-slate-400 hover:text-red-400 cursor-pointer"
                                title="Delete Lead"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex items-center gap-1.5 text-blue-400 font-mono">
                            <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                            <a href={`tel:${lead.phoneNumber}`} className="hover:underline cursor-pointer">{lead.phoneNumber}</a>
                          </div>

                          <div className="flex items-center gap-1.5 text-slate-300">
                            <Calendar className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                            <span className="truncate">{lead.birthday || "DOB: N/A"}</span>
                          </div>
                        </div>

                        {/* Answers Accordion */}
                        <div className="pt-2 border-t border-white/5 space-y-1 text-xs">
                          <p className="text-[11px] font-bold text-slate-400">Question Choices:</p>
                          {questions.map((q) => {
                            const ans = lead.answers?.[q.id];
                            if (!ans || ans.length === 0) return null;
                            return (
                              <div key={q.id} className="text-[11px]">
                                <span className="text-slate-400 font-medium">{q.questionText}: </span>
                                <span className="text-red-300 font-semibold">
                                  {Array.isArray(ans) ? ans.join(", ") : ans}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop / Tablet Full Table View (Hidden on Small Screens) */}
                  <div className="hidden lg:block glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs sm:text-sm">
                        <thead className="bg-slate-900/80 text-slate-400 font-semibold border-b border-white/10 uppercase text-[10px] tracking-wider">
                          <tr>
                            <th className="p-4">Candidate</th>
                            <th className="p-4">Contact</th>
                            <th className="p-4">Gender</th>
                            <th className="p-4">Date of Birth</th>
                            <th className="p-4">Submission Time</th>
                            <th className="p-4">Question Answers Breakdown</th>
                            <th className="p-4 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {filteredLeads.map((lead, lIdx) => (
                            <tr key={lead.id || lead.createdAt || lIdx} className="hover:bg-slate-900/40 transition-colors">
                              <td className="p-4">
                                <div className="font-bold text-white">{lead.fullName}</div>
                              </td>
                              <td className="p-4">
                                <a
                                  href={`tel:${lead.phoneNumber}`}
                                  className="flex items-center gap-1.5 text-blue-400 hover:underline font-mono cursor-pointer"
                                >
                                  <Phone className="w-3.5 h-3.5" />
                                  <span>{lead.phoneNumber}</span>
                                </a>
                              </td>
                              <td className="p-4 text-slate-300">
                                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-500/10 text-red-300 border border-red-500/20">
                                  {lead.gender || "N/A"}
                                </span>
                              </td>
                              <td className="p-4 text-slate-300">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-emerald-400" />
                                  <span>{lead.birthday || "N/A"}</span>
                                </span>
                              </td>
                              <td className="p-4 text-slate-400 text-xs">
                                {lead.createdAt ? new Date(lead.createdAt).toLocaleString("en-IN") : "N/A"}
                              </td>
                              <td className="p-4 space-y-1 max-w-md">
                                {questions.map((q) => {
                                  const ans = lead.answers?.[q.id];
                                  if (!ans || ans.length === 0) return null;
                                  return (
                                    <div key={q.id} className="text-xs">
                                      <span className="text-slate-400 font-medium">{q.questionText}: </span>
                                      <span className="text-red-300 font-semibold">
                                        {Array.isArray(ans) ? ans.join(", ") : ans}
                                      </span>
                                    </div>
                                  );
                                })}
                              </td>
                              <td className="p-4 text-center">
                                {lead.id && (
                                  <button
                                    onClick={() => handleDeleteLead(lead.id!)}
                                    className="p-1.5 rounded-lg glass-panel hover:text-red-400 text-slate-400 transition-colors cursor-pointer"
                                    title="Delete Submission"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
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

          {/* Tab 3: Google Sheets Live Sync Setup */}
          {activeTab === "gsheet" && (
            <motion.div
              key="gsheet-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-4 sm:space-y-6 max-w-4xl"
            >
              {/* Status and Action Card */}
              <div className="glass-panel rounded-2xl p-5 sm:p-6 border border-white/10 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Sheet className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white">Google Sheets Real-Time & Bulk Sync Hub</h3>
                    <p className="text-xs text-slate-400">
                      Live sync each new student registration instantly, and batch sync all stored leads with one click.
                    </p>
                  </div>
                </div>

                {/* Webhook URL Input Form */}
                <div className="space-y-2 pt-1">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">
                    Google Apps Script Web App URL
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="url"
                      placeholder="https://script.google.com/macros/s/.../exec"
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      className="flex-1 px-3.5 py-2.5 rounded-xl glass-input text-white text-xs sm:text-sm font-mono cursor-text"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveWebhook}
                        className="flex-1 sm:flex-none btn-3d-emerald px-4 py-2 rounded-xl text-white text-xs font-bold cursor-pointer"
                      >
                        Save URL
                      </button>
                      <button
                        onClick={handleTestWebhook}
                        className="flex-1 sm:flex-none px-4 py-2 rounded-xl glass-panel hover:border-emerald-500 text-slate-200 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <SendHorizontal className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Test Ping</span>
                      </button>
                    </div>
                  </div>

                  {testStatus && (
                    <div className="text-xs font-medium pt-1 bg-slate-900/80 p-2.5 rounded-xl border border-white/10">
                      {testStatus}
                    </div>
                  )}
                </div>

                {/* Bulk Sync Button */}
                <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-white">Sync Existing Leads to Sheet</p>
                    <p className="text-[11px] text-slate-400">Push all {leads.length} recorded leads into your connected spreadsheet now.</p>
                  </div>

                  <button
                    onClick={handleSyncAllLeads}
                    disabled={isSyncingAll || !webhookUrl}
                    className={`btn-3d-emerald px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
                      webhookUrl && !isSyncingAll
                        ? "cursor-pointer"
                        : "opacity-40 cursor-not-allowed"
                    }`}
                  >
                    <Zap className="w-4 h-4 text-amber-300" />
                    <span>{isSyncingAll ? "Syncing..." : `Sync All (${leads.length}) Leads Now`}</span>
                  </button>
                </div>
              </div>

              {/* 2-Minute Setup Guide */}
              <div className="glass-panel rounded-2xl p-5 sm:p-6 border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                    How to setup your Google Sheet in 2 minutes:
                  </h4>
                  <button
                    onClick={copyAppsScript}
                    className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 glass-panel px-3 py-1.5 rounded-lg cursor-pointer"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? "Copied Code!" : "Copy Script Code"}</span>
                  </button>
                </div>

                <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside leading-relaxed">
                  <li>Create a blank spreadsheet at <a href="https://sheets.new" target="_blank" rel="noreferrer" className="text-emerald-400 underline inline-flex items-center gap-1 cursor-pointer">sheets.new <ExternalLink className="w-3 h-3" /></a>.</li>
                  <li>Click <strong>Extensions</strong> $\to$ <strong>Apps Script</strong>.</li>
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
    </div>
  );
}
