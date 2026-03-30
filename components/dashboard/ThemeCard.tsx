import type { Theme } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Users, Clock } from "lucide-react";

interface ThemeCardProps {
  theme: Theme;
}

export function ThemeCard({ theme }: ThemeCardProps) {
  const convictionVariant = theme.conviction as "high" | "medium" | "low";
  const timeframeColor =
    theme.timeframe === "near-term"
      ? "text-amber-400"
      : theme.timeframe === "medium-term"
      ? "text-blue-400"
      : "text-purple-400";

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-white text-sm leading-snug">
          {theme.title}
        </h3>
        <Badge variant={convictionVariant} className="shrink-0">
          {theme.conviction}
        </Badge>
      </div>
      <p className="text-xs text-zinc-400 leading-relaxed">{theme.description}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-zinc-500">
          <Users className="w-3 h-3" />
          <span>{theme.analysts.join(", ")}</span>
        </div>
        <div className={`flex items-center gap-1 text-xs ${timeframeColor}`}>
          <Clock className="w-3 h-3" />
          <span className="capitalize">{theme.timeframe}</span>
        </div>
      </div>
    </div>
  );
}
