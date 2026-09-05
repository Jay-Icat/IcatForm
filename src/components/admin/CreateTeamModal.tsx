"use client";

import React, { useState, useEffect } from "react";
import { X, Users2, Link2, Copy, Check, Sparkles, CheckSquare, Square } from "lucide-react";
import { Team } from "@/types/quiz";
import { sound } from "@/lib/sound";

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (team: Team, cloneDefaultQuestions: boolean) => Promise<void>;
  existingSlugs: string[];
}

export function CreateTeamModal({
  isOpen,
  onClose,
  onCreate,
  existingSlugs,
}: CreateTeamModalProps) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [cloneQuestions, setCloneQuestions] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setName("");
      setSlug("");
      setDescription("");
      setCloneQuestions(true);
      setError("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNameChange = (val: string) => {
    setName(val);
    // Auto-generate clean slug if user hasn't typed a custom slug
    const autoSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setSlug(autoSlug);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const cleanName = name.trim();
    const cleanSlug = slug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    if (!cleanName) {
      setError("Please enter a team name.");
      return;
    }

    if (!cleanSlug) {
      setError("Please provide a valid URL slug (e.g. 'animation').");
      return;
    }

    const reserved = ["admin", "api", "default", "public", "_next", "favicon.ico"];
    if (reserved.includes(cleanSlug)) {
      setError(`The slug "${cleanSlug}" is reserved. Please choose another.`);
      return;
    }

    if (existingSlugs.includes(cleanSlug)) {
      setError(`A team with URL slug "${cleanSlug}" already exists.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const newTeam: Team = {
        id: cleanSlug,
        slug: cleanSlug,
        name: cleanName,
        createdAt: new Date().toISOString(),
        ...(description.trim() ? { description: description.trim() } : {}),
      };

      await onCreate(newTeam, cloneQuestions);
      sound.playSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create team";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-lg glass-panel rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl bg-slate-950/90 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Users2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white leading-tight">
                Create New Team
              </h3>
              <p className="text-xs text-slate-400">
                Setup a separate URL and isolated data collection
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Team Display Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Animation & VFX, Game Design, Outreach Team"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-blue-500 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              URL Slug (Link Path) *
            </label>
            <div className="flex items-center rounded-xl bg-white/5 border border-white/10 overflow-hidden focus-within:border-blue-500 transition-colors">
              <span className="px-3 py-2.5 text-xs text-slate-400 bg-white/5 border-r border-white/10 font-mono">
                /
              </span>
              <input
                type="text"
                placeholder="e.g. animation"
                value={slug}
                onChange={(e) =>
                  setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
                }
                className="w-full px-3 py-2.5 bg-transparent text-white placeholder:text-slate-500 text-sm font-mono focus:outline-none"
                required
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Students will access the quiz via:{" "}
              <span className="text-blue-400 font-mono">
                {typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}
                /{slug || "your-team-slug"}
              </span>
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Notes or campaign details for this team..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Clone default questions toggle */}
          <div
            onClick={() => setCloneQuestions(!cloneQuestions)}
            className="flex items-start gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all cursor-pointer select-none"
          >
            <div className="mt-0.5 text-blue-400">
              {cloneQuestions ? (
                <CheckSquare className="w-5 h-5 text-blue-400" />
              ) : (
                <Square className="w-5 h-5 text-slate-500" />
              )}
            </div>
            <div>
              <p className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Clone Default Questions into New Team</span>
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Copies the 4 standard ICAT questions so the team link is immediately ready. You can edit them anytime.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-3d-red px-5 py-2.5 rounded-xl text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-red-600/30"
            >
              {isSubmitting ? (
                <span>Creating Team...</span>
              ) : (
                <>
                  <Users2 className="w-4 h-4" />
                  <span>Create Team & Generate Link</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
