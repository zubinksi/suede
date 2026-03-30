import type { Position } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Zap, ArrowRightLeft, Globe, Users, AlertTriangle, Target } from "lucide-react";

interface PositionCardProps {
  position: Position;
}

const TYPE_ICON: Record<string, React.ReactNode> = {
  long: <TrendingUp className="w-3.5 h-3.5" />,
  short: <TrendingDown className="w-3.5 h-3.5" />,
  options: <Zap className="w-3.5 h-3.5" />,
  "relative value": <ArrowRightLeft className="w-3.5 h-3.5" />,
  macro: <Globe className="w-3.5 h-3.5" />,
};

const ASSET_CLASS_COLOR: Record<string, string> = {
  equities: "text-blue-400",
  rates: "text-green-400",
  fx: "text-yellow-400",
  commodities: "text-orange-400",
  options: "text-purple-400",
  macro: "text-indigo-400",
};

export function PositionCard({ position }: PositionCardProps) {
  const typeVariant = position.type as keyof typeof TYPE_ICON;
  const convictionVariant = position.conviction as "high" | "medium" | "low";
  const assetColor = ASSET_CLASS_COLOR[position.assetClass] ?? "text-zinc-400";

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className={`flex items-center gap-1 text-sm font-bold ${
              position.type === "short" ? "text-red-400" :
              position.type === "long" ? "text-blue-400" :
              position.type === "options" ? "text-purple-400" :
              position.type === "relative value" ? "text-teal-400" :
              "text-indigo-400"
            }`}
          >
            {TYPE_ICON[typeVariant]}
          </span>
          <span className="text-white font-bold text-base">{position.instrument}</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Badge variant={typeVariant as "long" | "short" | "options" | "macro" | "relative value"}>
            {position.type}
          </Badge>
          <Badge variant={convictionVariant}>{position.conviction}</Badge>
        </div>
      </div>

      {/* Asset class */}
      <div className={`text-xs font-medium ${assetColor} uppercase tracking-wide`}>
        {position.assetClass}
      </div>

      {/* Thesis */}
      <p className="text-xs text-zinc-300 leading-relaxed">{position.thesis}</p>

      {/* Catalysts */}
      {position.catalysts?.length > 0 && (
        <div>
          <div className="flex items-center gap-1 text-[10px] text-zinc-500 uppercase tracking-wide mb-1">
            <Target className="w-3 h-3" />
            <span>Catalysts</span>
          </div>
          <ul className="space-y-0.5">
            {position.catalysts.map((c, i) => (
              <li key={i} className="text-xs text-zinc-400 flex gap-1.5">
                <span className="text-emerald-500 mt-0.5">+</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Risks */}
      {position.risks?.length > 0 && (
        <div>
          <div className="flex items-center gap-1 text-[10px] text-zinc-500 uppercase tracking-wide mb-1">
            <AlertTriangle className="w-3 h-3" />
            <span>Risks</span>
          </div>
          <ul className="space-y-0.5">
            {position.risks.map((r, i) => (
              <li key={i} className="text-xs text-zinc-400 flex gap-1.5">
                <span className="text-red-500 mt-0.5">!</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Analysts */}
      <div className="flex items-center gap-1 text-xs text-zinc-600 pt-1 border-t border-zinc-800">
        <Users className="w-3 h-3" />
        <span>{position.analysts.join(", ")}</span>
      </div>
    </div>
  );
}
