"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
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
  ExternalLink
} from "lucide-react";
import { Question, StudentLead } from "@/types/quiz";
import { 
  fetchQuestions, 
  saveQuestion, 
  deleteQuestion, 
  fetchStudentLeads, 
  isFirebaseConfigured 
} from "@/lib/firebase";
import { exportLeadsToExcel } from "@/lib/excelExport";
import { QuestionEditorModal } from "./QuestionEditorModal";

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
    if (typeof window !== "undefined") {
      const savedUrl = localStorage.getItem("icat_gsheet_webhook") || "";
      setWebhookUrl(savedUrl);
    }
  }, []);

  const handleSaveWebhook = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("icat_gsheet_webhook", webhookUrl.trim());
      alert("Google Sheet Webhook URL saved successfully!");
    }
  };

  const handleTestWebhook = async () => {
    if (!webhookUrl.trim()) {
      alert("Please enter a Google Sheet Webhook URL first.");
      return;
    }
    setTestStatus("Testing...");
    try {
      const testLead: StudentLead = {
        fullName: "Test Candidate",
        phoneNumber: "9876543210",
        createdAt: new Date().toISOString(),
        answers: {
          q1: ["Game Development & 3D Interactive Worlds"],
          q2: ["Unreal Engine 5 & Unity 3D"],
        },
      };

      const res = await fetch("/api/sync-sheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead: testLead,
          questions: questions,
          webhookUrl: webhookUrl.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setTestStatus("Success! Check your Google Sheet for the new test row.");
      } else {
        setTestStatus(`Failed: ${data.message || "Could not reach webhook"}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error";
      setTestStatus(`Error: ${msg}`);
    }
  };

  const handleSaveQuestion = async (q: Question) => {
    await saveQuestion(q);
    await loadData();
  };

  const handleDeleteQuestion = async (id: string) => {
    if (confirm("Are you sure you want to delete this question?")) {
      await deleteQuestion(id);
      await loadData();
    }
  };

  const handleExportExcel = () => {
    exportLeadsToExcel(leads, questions);
  };

  const filteredLeads = leads.filter((lead) => {
    const term = searchQuery.toLowerCase();
    return (
      lead.fullName.toLowerCase().includes(term) ||
      lead.phoneNumber.includes(term)
    );
  });

  const appsScriptCode = `function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var payload = JSON.parse(e.postData.contents);
    var data = payload.data;
    
    // Auto-create headers if sheet is empty
    if (sheet.getLastRow() === 0) {
      var headers = Object.keys(data);
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#dc2626").setFontColor("#ffffff");
    }
    
    // Map values to existing columns
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var row = [];
    for (var i = 0; i < headers.length; i++) {
      row.push(data[headers[i]] || "");
    }
    sheet.appendRow(row);
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;

  const copyAppsScript = () => {
    navigator.clipboard.writeText(appsScriptCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#050814] text-slate-200 pb-16">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-lg border-b border-white/10 px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 to-blue-600 flex items-center justify-center font-black text-white text-base shadow-lg shadow-red-600/30">
              ICAT
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-white leading-tight">
                Admin Management Console
              </h1>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Database className="w-3 h-3 text-blue-400" />
                  {isFirebaseConfigured ? "Firebase Cloud Firestore Connected" : "Local Storage Mode"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-600/30 transition-all hover:scale-105 active:scale-95"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export to Excel (.xlsx)</span>
            </button>

            <Link
              href="/"
              className="glass-panel px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Live Site</span>
            </Link>

            <button
              onClick={onLogout}
              className="glass-panel p-2 rounded-xl text-slate-400 hover:text-red-400 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 space-y-6">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-panel p-5 rounded-2xl border border-white/10 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Questions</p>
              <h3 className="text-2xl font-black text-white mt-1">{questions.length}</h3>
            </div>
            <div className="p-3 rounded-xl bg-red-500/10 text-red-400">
              <HelpCircle className="w-6 h-6" />
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/10 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Student Leads</p>
              <h3 className="text-2xl font-black text-white mt-1">{leads.length}</h3>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/10 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Latest Submission</p>
              <h3 className="text-sm font-semibold text-slate-200 mt-1">
                {leads[0]?.createdAt
                  ? new Date(leads[0].createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
                  : "No submissions yet"}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Tab Switcher & Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-900 border border-white/10 w-full sm:w-auto overflow-x-auto">
            <button
              onClick={() => setActiveTab("questions")}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                activeTab === "questions"
                  ? "bg-red-600 text-white shadow-lg shadow-red-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Questions ({questions.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("leads")}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                activeTab === "leads"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Student Leads ({leads.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("gsheet")}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                activeTab === "gsheet"
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Sheet className="w-4 h-4" />
              <span>Google Sheet Live Sync</span>
            </button>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={loadData}
              className="glass-panel p-2.5 rounded-xl text-slate-300 hover:text-white"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>

            {activeTab === "questions" && (
              <button
                onClick={() => {
                  setEditingQuestion(null);
                  setIsModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-red-600/30 transition-all hover:scale-105"
              >
                <Plus className="w-4 h-4" />
                <span>Add Question</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab 1: Questions Manager */}
        {activeTab === "questions" && (
          <div className="space-y-4">
            {questions.length === 0 ? (
              <div className="glass-panel rounded-2xl p-12 text-center text-slate-400">
                No questions found. Click "Add Question" to create your first one.
              </div>
            ) : (
              questions.map((q, idx) => (
                <div
                  key={q.id}
                  className="glass-panel rounded-2xl p-5 border border-white/10 hover:border-white/20 transition-all space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center text-xs font-bold">
                        {idx + 1}
                      </span>
                      <h4 className="text-base font-bold text-white">{q.questionText}</h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 ${
                        q.type === "multiple" 
                          ? "bg-blue-500/10 text-blue-400 border border-blue-500/30" 
                          : "bg-red-500/10 text-red-400 border border-red-500/30"
                      }`}>
                        {q.type === "multiple" ? <CheckSquare className="w-3 h-3" /> : <CircleDot className="w-3 h-3" />}
                        <span>{q.type === "multiple" ? "Multi-Select" : "Single-Select"}</span>
                      </span>

                      {q.category && (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-800 text-slate-300">
                          {q.category}
                        </span>
                      )}

                      <button
                        onClick={() => {
                          setEditingQuestion(q);
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg glass-panel hover:text-blue-400 text-slate-300"
                        title="Edit Question"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="p-1.5 rounded-lg glass-panel hover:text-red-400 text-slate-300"
                        title="Delete Question"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* 4 Options Preview */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-white/5">
                    {q.options.map((opt, oIdx) => (
                      <div
                        key={opt.id || oIdx}
                        className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 text-xs text-slate-300 flex items-center gap-2"
                      >
                        <span className="w-5 h-5 rounded bg-slate-800 text-slate-400 flex items-center justify-center font-bold text-[10px]">
                          {["A", "B", "C", "D"][oIdx]}
                        </span>
                        <span className="truncate">{opt.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Student Leads & Detailed Responses */}
        {activeTab === "leads" && (
          <div className="space-y-4">
            {/* Search filter */}
            <div className="relative max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search students by name or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-white text-xs sm:text-sm"
              />
            </div>

            {filteredLeads.length === 0 ? (
              <div className="glass-panel rounded-2xl p-12 text-center text-slate-400">
                No student submissions found matching your search.
              </div>
            ) : (
              <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-slate-900/80 text-slate-400 font-semibold border-b border-white/10 uppercase text-[11px] tracking-wider">
                      <tr>
                        <th className="p-4">Candidate</th>
                        <th className="p-4">Contact</th>
                        <th className="p-4">Submission Time</th>
                        <th className="p-4">Question Answers Breakdown</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredLeads.map((lead) => (
                        <tr key={lead.id || lead.createdAt} className="hover:bg-slate-900/40 transition-colors">
                          <td className="p-4">
                            <div className="font-bold text-white">{lead.fullName}</div>
                          </td>
                          <td className="p-4">
                            <a
                              href={`tel:${lead.phoneNumber}`}
                              className="flex items-center gap-1.5 text-blue-400 hover:underline font-mono"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              <span>{lead.phoneNumber}</span>
                            </a>
                          </td>
                          <td className="p-4 text-slate-400 text-xs">
                            {lead.createdAt ? new Date(lead.createdAt).toLocaleString("en-IN") : "N/A"}
                          </td>
                          <td className="p-4 space-y-1 max-w-lg">
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
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Google Sheets Live Sync Setup */}
        {activeTab === "gsheet" && (
          <div className="space-y-6 max-w-4xl">
            <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <Sheet className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Google Sheets Live Sync Setup</h3>
                  <p className="text-xs text-slate-400">
                    Automatically append new student submissions into your live Google Sheet in real-time.
                  </p>
                </div>
              </div>

              {/* Webhook URL Input Form */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Google Apps Script Webhook Web App URL
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    placeholder="https://script.google.com/macros/s/.../exec"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-xl glass-input text-white text-xs sm:text-sm font-mono"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveWebhook}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/20"
                    >
                      Save URL
                    </button>
                    <button
                      onClick={handleTestWebhook}
                      className="px-4 py-2.5 rounded-xl glass-panel hover:border-emerald-500 text-slate-200 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all"
                    >
                      <SendHorizontal className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Test Sync</span>
                    </button>
                  </div>
                </div>

                {testStatus && (
                  <p className="text-xs font-medium text-amber-300 pt-1 bg-slate-900/60 p-2 rounded-lg border border-white/5">
                    {testStatus}
                  </p>
                )}
              </div>
            </div>

            {/* Quick 2-Minute Google Apps Script Guide */}
            <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                  How to setup your Google Sheet in 2 minutes:
                </h4>
                <button
                  onClick={copyAppsScript}
                  className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 glass-panel px-3 py-1.5 rounded-lg"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? "Copied Code!" : "Copy Script Code"}</span>
                </button>
              </div>

              <ol className="text-xs text-slate-300 space-y-2.5 list-decimal list-inside leading-relaxed">
                <li>Create a new blank spreadsheet at <a href="https://sheets.new" target="_blank" rel="noreferrer" className="text-emerald-400 underline inline-flex items-center gap-1">sheets.new <ExternalLink className="w-3 h-3" /></a>.</li>
                <li>Click on <strong>Extensions</strong> $\to$ <strong>Apps Script</strong> in the top menu.</li>
                <li>Delete everything in the editor and paste the code below.</li>
                <li>Click <strong>Deploy</strong> (top right) $\to$ <strong>New deployment</strong>.</li>
                <li>Select type: <strong>Web app</strong>. Set <em>Execute as</em>: <strong>Me</strong>, and <em>Who has access</em>: <strong>Anyone</strong>.</li>
                <li>Click <strong>Deploy</strong>, copy the generated <strong>Web app URL</strong>, paste it into the box above, and click <strong>Save URL</strong>!</li>
              </ol>

              {/* Code Snippet Box */}
              <div className="relative rounded-xl bg-slate-950 p-4 border border-white/10 font-mono text-[11px] text-emerald-300 overflow-x-auto max-h-48">
                <pre>{appsScriptCode}</pre>
              </div>
            </div>
          </div>
        )}
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
