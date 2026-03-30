"use client";

import { useState, useCallback } from "react";
import { ANALYSTS, AnalystPost } from "@/lib/analysts";
import type { SynthesisResult } from "@/lib/types";
import { AnalystCard } from "@/components/dashboard/AnalystCard";
import { SynthesisPanel } from "@/components/dashboard/SynthesisPanel";
import { ManualInputModal } from "@/components/dashboard/ManualInputModal";
import { Brain, RefreshCw, Plus, Activity } from "lucide-react";

interface FeedState {
  [analystId: string]: {
    posts: AnalystPost[];
    loading: boolean;
    error?: string;
  };
}

export default function Dashboard() {
  const [feeds, setFeeds] = useState<FeedState>({});
  const [selectedAnalysts, setSelectedAnalysts] = useState<Set<string>>(
    new Set(ANALYSTS.map((a) => a.id))
  );
  const [synthesis, setSynthesis] = useState<SynthesisResult | null>(null);
  const [synthLoading, setSynthLoading] = useState(false);
  const [synthError, setSynthError] = useState<string | null>(null);
  const [feedsLoading, setFeedsLoading] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualPosts, setManualPosts] = useState<AnalystPost[]>([]);

  const loadFeeds = useCallback(async () => {
    setFeedsLoading(true);

    setFeeds((prev) => {
      const next = { ...prev };
      ANALYSTS.forEach((a) => {
        if (selectedAnalysts.has(a.id)) {
          next[a.id] = { posts: prev[a.id]?.posts ?? [], loading: true };
        }
      });
      return next;
    });

    await Promise.allSettled(
      ANALYSTS.filter((a) => selectedAnalysts.has(a.id)).map(async (analyst) => {
        try {
          const res = await fetch(`/api/fetch-feeds?analyst=${analyst.id}`);
          const data = await res.json();
          const posts: AnalystPost[] = data[0]?.posts ?? [];
          setFeeds((prev) => ({
            ...prev,
            [analyst.id]: { posts, loading: false },
          }));
        } catch (err) {
          setFeeds((prev) => ({
            ...prev,
            [analyst.id]: { posts: [], loading: false, error: String(err) },
          }));
        }
      })
    );

    setFeedsLoading(false);
  }, [selectedAnalysts]);

  const synthesize = useCallback(async () => {
    setSynthLoading(true);
    setSynthError(null);

    const allPosts: AnalystPost[] = [
      ...manualPosts,
      ...ANALYSTS.filter((a) => selectedAnalysts.has(a.id)).flatMap(
        (a) => feeds[a.id]?.posts ?? []
      ),
    ];

    try {
      const res = await fetch("/api/synthesize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ posts: allPosts }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Synthesis failed");
      }
      const result: SynthesisResult = await res.json();
      setSynthesis(result);
    } catch (err) {
      setSynthError(String(err));
    } finally {
      setSynthLoading(false);
    }
  }, [feeds, selectedAnalysts, manualPosts]);

  const toggleAnalyst = (id: string) => {
    setSelectedAnalysts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const totalPosts =
    manualPosts.length +
    ANALYSTS.filter((a) => selectedAnalysts.has(a.id)).reduce(
      (sum, a) => sum + (feeds[a.id]?.posts.length ?? 0),
      0
    );

  const anyFeedLoaded =
    Object.values(feeds).some((f) => f.posts.length > 0) ||
    manualPosts.length > 0;

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-screen-2xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-white text-sm">Suede</h1>
              <p className="text-[10px] text-zinc-500">Investment Strategy Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {totalPosts > 0 && (
              <span className="text-xs text-zinc-500">
                {totalPosts} items loaded
              </span>
            )}
            <button
              onClick={() => setShowManualInput(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Notes
            </button>
            <button
              onClick={loadFeeds}
              disabled={feedsLoading || selectedAnalysts.size === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 disabled:opacity-50 rounded-lg transition-colors"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${feedsLoading ? "animate-spin" : ""}`}
              />
              {feedsLoading ? "Loading..." : "Load Feeds"}
            </button>
            <button
              onClick={synthesize}
              disabled={synthLoading || !anyFeedLoaded}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg font-medium transition-colors"
            >
              <Brain className="w-3.5 h-3.5" />
              {synthLoading ? "Synthesizing..." : "Synthesize with Claude"}
            </button>
          </div>
        </div>
      </header>

      {/* Main layout */}
      <div className="max-w-screen-2xl mx-auto px-6 py-6 flex gap-6">
        {/* Left: Analyst feeds */}
        <div className="w-[420px] shrink-0 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">
              Analysts
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  setSelectedAnalysts(new Set(ANALYSTS.map((a) => a.id)))
                }
                className="text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                Select all
              </button>
              <span className="text-zinc-700">·</span>
              <button
                onClick={() => setSelectedAnalysts(new Set())}
                className="text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>

          {manualPosts.length > 0 && (
            <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 flex items-center justify-between">
              <span className="text-xs text-zinc-300">
                {manualPosts.length} manual{" "}
                {manualPosts.length === 1 ? "note" : "notes"} added
              </span>
              <button
                onClick={() => setManualPosts([])}
                className="text-[10px] text-zinc-500 hover:text-red-400 transition-colors"
              >
                Clear
              </button>
            </div>
          )}

          {ANALYSTS.map((analyst) => (
            <AnalystCard
              key={analyst.id}
              analyst={analyst}
              posts={feeds[analyst.id]?.posts ?? []}
              loading={feeds[analyst.id]?.loading}
              selected={selectedAnalysts.has(analyst.id)}
              onToggleSelect={toggleAnalyst}
            />
          ))}
        </div>

        {/* Right: Synthesis */}
        <div className="flex-1 min-w-0">
          <div className="sticky top-20">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">
                AI Synthesis
              </h2>
              {synthesis && (
                <button
                  onClick={synthesize}
                  disabled={synthLoading}
                  className="flex items-center gap-1 text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  <RefreshCw
                    className={`w-3 h-3 ${synthLoading ? "animate-spin" : ""}`}
                  />
                  Refresh
                </button>
              )}
            </div>

            {!synthesis && !synthLoading && !synthError && (
              <div className="rounded-xl border border-dashed border-zinc-800 p-8 text-center space-y-3 mb-4">
                <div className="flex justify-center">
                  <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center">
                    <Brain className="w-6 h-6 text-zinc-500" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-400">
                    Ready to synthesize
                  </p>
                  <p className="text-xs text-zinc-600 mt-1 max-w-xs mx-auto">
                    1. Select analysts on the left
                    <br />
                    2. Click{" "}
                    <strong className="text-zinc-500">Load Feeds</strong> to
                    pull latest content
                    <br />
                    3. Click{" "}
                    <strong className="text-zinc-500">
                      Synthesize with Claude
                    </strong>{" "}
                    to generate strategies
                  </p>
                </div>
                <div className="flex justify-center gap-2 pt-2">
                  <button
                    onClick={loadFeeds}
                    disabled={feedsLoading}
                    className="px-4 py-2 text-xs bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg transition-colors"
                  >
                    {feedsLoading ? "Loading..." : "Load Feeds"}
                  </button>
                  {anyFeedLoaded && (
                    <button
                      onClick={synthesize}
                      className="px-4 py-2 text-xs bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors font-medium"
                    >
                      Synthesize with Claude →
                    </button>
                  )}
                </div>
              </div>
            )}

            <SynthesisPanel
              result={synthesis}
              loading={synthLoading}
              error={synthError}
            />
          </div>
        </div>
      </div>

      {showManualInput && (
        <ManualInputModal
          onClose={() => setShowManualInput(false)}
          onAdd={(post) => setManualPosts((prev) => [post, ...prev])}
        />
      )}
    </div>
  );
}
