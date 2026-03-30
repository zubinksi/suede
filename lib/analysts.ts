export type SourceType = "rss" | "web" | "twitter" | "manual";

export interface Analyst {
  id: string;
  name: string;
  displayName: string;
  avatar: string;
  sources: AnalystSource[];
  description: string;
  tags: string[];
}

export interface AnalystSource {
  type: SourceType;
  url: string;
  label: string;
}

export interface AnalystPost {
  analystId: string;
  analystName: string;
  title: string;
  summary: string;
  url: string;
  publishedAt: string;
  content?: string;
  tags?: string[];
}

export const ANALYSTS: Analyst[] = [
  {
    id: "campbell",
    name: "Alex Campbell",
    displayName: "Campbell Ramble",
    avatar: "AC",
    description: "Macro & markets commentary",
    tags: ["macro", "equities", "rates"],
    sources: [
      { type: "web", url: "https://www.campbellramble.ai/", label: "Campbell Ramble" },
    ],
  },
  {
    id: "lekker",
    name: "Lekker Capital",
    displayName: "Lekker Capital",
    avatar: "LK",
    description: "Value-oriented investment ideas",
    tags: ["equities", "value", "deep-dive"],
    sources: [
      { type: "web", url: "https://www.lekkercapital.com/", label: "Lekker Capital" },
    ],
  },
  {
    id: "skewga",
    name: "Skewga Capital",
    displayName: "Skewga Capital",
    avatar: "SK",
    description: "Options & volatility strategies",
    tags: ["options", "volatility", "derivatives"],
    sources: [
      { type: "rss", url: "https://skewgacapital.substack.com/feed", label: "Skewga Substack" },
    ],
  },
  {
    id: "fejau",
    name: "Fejau",
    displayName: "Fejau",
    avatar: "FJ",
    description: "Global macro & cross-asset ideas",
    tags: ["macro", "cross-asset", "fx"],
    sources: [
      { type: "twitter", url: "https://x.com/fejau_inc", label: "@fejau_inc" },
    ],
  },
  {
    id: "warren_pies",
    name: "Warren Pies",
    displayName: "Warren Pies",
    avatar: "WP",
    description: "Energy & macro research",
    tags: ["energy", "macro", "commodities"],
    sources: [
      { type: "twitter", url: "https://x.com/WarrenPies", label: "@WarrenPies" },
    ],
  },
  {
    id: "renmac",
    name: "Renaissance Macro",
    displayName: "Renaissance Macro",
    avatar: "RM",
    description: "Institutional macro & technical research",
    tags: ["macro", "technicals", "rates"],
    sources: [
      { type: "manual", url: "newsletter@news.renmac.com", label: "RenMac Newsletter" },
    ],
  },
];
