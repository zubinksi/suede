"use client";

import { AnalystPost, Analyst } from "@/lib/analysts";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, RefreshCw, MessageCircle, Mail } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface AnalystCardProps {
  analyst: Analyst;
  posts: AnalystPost[];
  loading?: boolean;
  selected?: boolean;
  onToggleSelect: (id: string) => void;
}

const SOURCE_ICON: Record<string, React.ReactNode> = {
  twitter: <MessageCircle className="w-3 h-3" />,
  manual: <Mail className="w-3 h-3" />,
};

export function AnalystCard({
  analyst,
  posts,
  loading,
  selected,
  onToggleSelect,
}: AnalystCardProps) {
  const sourceType = analyst.sources[0]?.type ?? "web";

  return (
    <div
      className={`rounded-xl border transition-all cursor-pointer ${
        selected
          ? "border-blue-500 bg-zinc-900"
          : "border-zinc-800 bg-zinc-900 hover:border-zinc-600"
      }`}
      onClick={() => onToggleSelect(analyst.id)}
    >
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-zinc-800">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-xs font-bold text-white shrink-0">
          {analyst.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-white truncate">
              {analyst.displayName}
            </span>
            {SOURCE_ICON[sourceType] && (
              <span className="text-zinc-500">{SOURCE_ICON[sourceType]}</span>
            )}
          </div>
          <p className="text-xs text-zinc-500 truncate">{analyst.description}</p>
        </div>
        <div
          className={`w-3 h-3 rounded-full border-2 shrink-0 transition-colors ${
            selected ? "bg-blue-500 border-blue-500" : "border-zinc-600"
          }`}
        />
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1 px-4 pt-3">
        {analyst.tags.map((tag) => (
          <Badge key={tag} variant="outline" className="text-[10px]">
            {tag}
          </Badge>
        ))}
      </div>

      {/* Posts */}
      <div className="p-4 space-y-3">
        {loading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="animate-pulse space-y-1">
                <div className="h-3 bg-zinc-800 rounded w-3/4" />
                <div className="h-2 bg-zinc-800 rounded w-full" />
                <div className="h-2 bg-zinc-800 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <p className="text-xs text-zinc-600 italic">No content loaded</p>
        ) : (
          posts.slice(0, 3).map((post, i) => (
            <div key={i} className="group">
              <a
                href={post.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-1 text-xs font-medium text-zinc-200 hover:text-blue-400 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="line-clamp-2 flex-1">{post.title}</span>
                <ExternalLink className="w-3 h-3 shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
              {post.summary && (
                <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">
                  {post.summary}
                </p>
              )}
              <p className="text-[10px] text-zinc-700 mt-0.5">
                {formatRelative(post.publishedAt)}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Source link */}
      <div className="px-4 pb-3">
        <a
          href={analyst.sources[0]?.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-zinc-600 hover:text-zinc-400 flex items-center gap-1 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          {analyst.sources[0]?.label}
          <ExternalLink className="w-2.5 h-2.5" />
        </a>
      </div>
    </div>
  );
}

function formatRelative(iso: string) {
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true });
  } catch {
    return "";
  }
}
