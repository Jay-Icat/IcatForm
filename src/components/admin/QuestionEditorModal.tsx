"use client";

import React, { useState, useEffect } from "react";
import { X, Save, Plus, CheckSquare, CircleDot, Tag, HelpCircle } from "lucide-react";
import { Question, QuestionType } from "@/types/quiz";

interface QuestionEditorModalProps {
  question?: Question | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (q: Question) => Promise<void>;
  existingCount: number;
}

export function QuestionEditorModal({
  question,
  isOpen,
  onClose,
  onSave,
  existingCount,
}: QuestionEditorModalProps) {
  const [questionText, setQuestionText] = useState("");
  const [type, setType] = useState<QuestionType>("single");
  const [category, setCategory] = useState("General Assessment");
  const [options, setOptions] = useState<string[]>([
    "Option 1",
    "Option 2",
    "Option 3",
    "Option 4",
  ]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (question) {
      setQuestionText(question.questionText);
      setType(question.type);
      setCategory(question.category || "General Assessment");
      setOptions(
        question.options && question.options.length === 4
          ? question.options.map((o) => o.text)
          : ["Option 1", "Option 2", "Option 3", "Option 4"]
      );
    } else {
      setQuestionText("");
      setType("single");
      setCategory("Creative Specialization");
      setOptions(["", "", "", ""]);
    }
  }, [question, isOpen]);

  if (!isOpen) return null;

  const handleOptionChange = (index: number, val: string) => {
    const updated = [...options];
    updated[index] = val;
    setOptions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) {
      alert("Please enter question text");
      return;
    }
    if (options.some((o) => !o.trim())) {
      alert("Please provide text for all 4 options");
      return;
    }

    setIsSaving(true);
    try {
      const qId = question?.id || "q_" + Date.now();
      const payload: Question = {
        id: qId,
        questionText: questionText.trim(),
        type,
        category: category.trim() || "General",
        order: question?.order ?? existingCount + 1,
        options: options.map((optText, idx) => ({
          id: `${qId}_opt${idx + 1}`,
          text: optText.trim(),
        })),
      };
      await onSave(payload);
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to save question");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-2xl glass-panel rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {question ? "Edit Question" : "Add New Quiz Question"}
              </h2>
              <p className="text-xs text-slate-400">Configure 4 options and response type</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Question Text */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Question Title / Prompt
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Which creative discipline do you wish to explore?"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              className="w-full px-4 py-3 rounded-xl glass-input text-white text-sm"
              required
            />
          </div>

          {/* Selection Type & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Selection Mode Toggle */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Selection Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setType("single")}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                    type === "single"
                      ? "bg-red-600/30 border-red-500 text-white shadow-lg shadow-red-600/20"
                      : "bg-slate-900/60 border-white/10 text-slate-400 hover:text-white"
                  }`}
                >
                  <CircleDot className="w-4 h-4" />
                  <span>Single Choice</span>
                </button>

                <button
                  type="button"
                  onClick={() => setType("multiple")}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                    type === "multiple"
                      ? "bg-blue-600/30 border-blue-500 text-white shadow-lg shadow-blue-600/20"
                      : "bg-slate-900/60 border-white/10 text-slate-400 hover:text-white"
                  }`}
                >
                  <CheckSquare className="w-4 h-4" />
                  <span>Multi Choice</span>
                </button>
              </div>
            </div>

            {/* Category Tag */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-amber-400" />
                Category / Badge
              </label>
              <input
                type="text"
                placeholder="e.g. Game Design, VFX, UI/UX"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl glass-input text-white text-sm"
              />
            </div>
          </div>

          {/* 4 Options Configuration */}
          <div className="space-y-3 pt-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              4 Answer Options
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {["Option A", "Option B", "Option C", "Option D"].map((label, idx) => (
                <div key={idx} className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400">{label}</span>
                  <input
                    type="text"
                    placeholder={`Enter choice for ${label}`}
                    value={options[idx] || ""}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-white text-xs sm:text-sm"
                    required
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Submit & Cancel Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-blue-600 text-white text-xs sm:text-sm font-bold shadow-lg shadow-red-600/30 hover:scale-105 active:scale-95 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? "Saving..." : "Save Question"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
