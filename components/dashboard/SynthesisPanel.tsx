"use client";

import { SynthesisResult } from "@/lib/synthesizer";
import { ThemeCard } from "./ThemeCard";
import { PositionCard } from "./PositionCard";
import { Badge } from "@/components/ui/badge";
import { Brain, AlertOctagon, Newspaper, Filter } from "lucide-react";
import { useState } from "react";

interface SynthesisPanelProps {
  result: SynthesisResult | null;
  loading: boolean;
  error?: string | null;
}

type PositionFilter = "all" | "long" | "short" | "options" | "macro" | "relative value";
type ConvictionFilter = "all" | "high" | "medium" | "low";

export function SynthesisPanel({ result, loading, error }: SynthesisPanelProps) {
  const [activeTab, setActiveTab] = useState<"themes" | "positions" | "summary">("themes");
  const [positionFilter, setPositionFilter] = useState<PositionFilter>("all");
  const [convictionFilter, setConvictionFilter] = useState<ConvictionFilter>("all");

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-zinc-400 text-sm">Claude is synthesizing analyst ideas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-40 gap-2 text-red-400">
        <AlertOctagon className="w-6 h-6" />
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-zinc-600">
        <Brain className="w-10 h-10" />
        <div className="text-center">
          <p className="text-sm font-medium text-zinc-500">No synthesis yet</p>
          <p className="text-xs mt-1">
            Load analyst feeds and click &ldquo;Synthesize with Claude&rdquo; to generate strategies.
          </p>
        </div>
      </div>
    );
  }

  const filteredPositions = (result.positions ?? []).filter((p) => {
    if (positionFilter !== "all" && p.type !== positionFilter) return false;
    if (convictionFilter !== "all" && p.conviction !== convictionFilter) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Market regime + timestamp */}
      <div className="rounded-lg bg-zinc-800/50 border border-zinc-700 p-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-zinc-500 uppercase tracking-wide">
            Market Regime
          </span>
          <span className="text-[10px] text-zinc-600">
            {formatSynthTime(result.synthesizedAt)}
          </span>
        </div>
        <p className="text-sm text-zinc-200">{result.marketRegime}</p>
      </div>

      {/* Key risks */}
      {result.keyRisks?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {result.keyRisks.map((risk, i) => (
            <span
              key={i}
              className="text-[11px] bg-red-950/40 border border-red-900/50 text-red-400 rounded px-2 py-0.5"
            >
              {risk}
            </span>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-zinc-800/50 rounded-lg p-1">
        {(["themes", "positions", "summary"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors capitalize ${
              activeTab === tab
                ? "bg-zinc-700 text-white"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {tab}
            {tab === "themes" && result.themes?.length > 0 && (
              <span className="ml-1 text-[10px] text-zinc-500">
                ({result.themes.length})
              </span>
            )}
            {tab === "positions" && result.positions?.length > 0 && (
              <span className="ml-1 text-[10px] text-zinc-500">
                ({result.positions.length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Themes tab */}
      {activeTab === "themes" && (
        <div className="space-y-3">
          {(result.themes ?? []).length === 0 ? (
            <p className="text-xs text-zinc-600 text-center py-8">No themes identified</p>
          ) : (
            (result.themes ?? []).map((theme) => (
              <ThemeCard key={theme.id} theme={theme} />
            ))
          )}
        </div>
      )}

      {/* Positions tab */}
      {activeTab === "positions" && (
        <div className="space-y-3">
          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1">
              <Filter className="w-3 h-3 text-zinc-500" />
              <span className="text-[10px] text-zinc-500 uppercase">Type:</span>
              {(["all", "long", "short", "options", "macro", "relative value"] as PositionFilter[]).map(
                (f) => (
                  <button
                    key={f}
                    onClick={() => setPositionFilter(f)}
                    className={`text-[10px] px-1.5 py-0.5 rounded transition-colors capitalize ${
                      positionFilter === f
                        ? "bg-zinc-700 text-white"
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    {f}
                  </button>
                )
              )}
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-zinc-500 uppercase">Conviction:</span>
              {(["all", "high", "medium", "low"] as ConvictionFilter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setConvictionFilter(f)}
                  className={`text-[10px] px-1.5 py-0.5 rounded transition-colors capitalize ${
                    convictionFilter === f
                      ? "bg-zinc-700 text-white"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {filteredPositions.length === 0 ? (
            <p className="text-xs text-zinc-600 text-center py-8">
              No positions match filters
            </p>
          ) : (
            filteredPositions.map((position) => (
              <PositionCard key={position.id} position={position} />
            ))
          )}
        </div>
      )}

      {/* Summary tab */}
      {activeTab === "summary" && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Newspaper className="w-4 h-4 text-zinc-400" />
            <span className="text-sm font-semibold text-white">Executive Summary</span>
          </div>
          <div className="prose prose-invert prose-sm max-w-none">
            {result.summary?.split("\n\n").map((para, i) => (
              <p key={i} className="text-sm text-zinc-300 leading-relaxed mb-3">
                {para}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function formatSynthTime(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}
