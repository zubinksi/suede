export interface Theme {
  id: string;
  title: string;
  description: string;
  conviction: "high" | "medium" | "low";
  analysts: string[];
  timeframe: string;
}

export interface Position {
  id: string;
  instrument: string;
  type: "long" | "short" | "options" | "relative value" | "macro";
  thesis: string;
  catalysts: string[];
  risks: string[];
  analysts: string[];
  conviction: "high" | "medium" | "low";
  assetClass: string;
}

export interface SynthesisResult {
  themes: Theme[];
  positions: Position[];
  marketRegime: string;
  keyRisks: string[];
  summary: string;
  synthesizedAt: string;
}
