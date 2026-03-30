import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "outline" | "high" | "medium" | "low" | "long" | "short" | "options" | "macro" | "relative value";
  className?: string;
}

const variantClasses: Record<string, string> = {
  default: "bg-zinc-700 text-zinc-100",
  outline: "border border-zinc-600 text-zinc-300",
  high: "bg-emerald-900/60 text-emerald-300 border border-emerald-800",
  medium: "bg-amber-900/60 text-amber-300 border border-amber-800",
  low: "bg-zinc-800 text-zinc-400 border border-zinc-700",
  long: "bg-blue-900/60 text-blue-300 border border-blue-800",
  short: "bg-red-900/60 text-red-300 border border-red-800",
  options: "bg-purple-900/60 text-purple-300 border border-purple-800",
  macro: "bg-indigo-900/60 text-indigo-300 border border-indigo-800",
  "relative value": "bg-teal-900/60 text-teal-300 border border-teal-800",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium",
        variantClasses[variant] ?? variantClasses.default,
        className
      )}
    >
      {children}
    </span>
  );
}
