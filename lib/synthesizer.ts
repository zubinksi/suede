import Anthropic from "@anthropic-ai/sdk";
import { AnalystPost } from "./analysts";

const client = new Anthropic();

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

export async function synthesizePosts(posts: AnalystPost[]): Promise<SynthesisResult> {
  if (posts.length === 0) {
    return {
      themes: [],
      positions: [],
      marketRegime: "Insufficient data",
      keyRisks: [],
      summary: "No analyst content available to synthesize.",
      synthesizedAt: new Date().toISOString(),
    };
  }

  const postsText = posts
    .map(
      (p) =>
        `ANALYST: ${p.analystName}\nTITLE: ${p.title}\nSUMMARY: ${p.summary}\nURL: ${p.url}\nDATE: ${p.publishedAt}\n---`
    )
    .join("\n");

  const prompt = `You are an expert investment analyst and portfolio strategist. You have access to the latest research and commentary from the following investment analysts:

${postsText}

Based on this content, please analyze and synthesize the key investment ideas into actionable strategies and positions.

Return a JSON response with this exact structure (no markdown, just JSON):
{
  "themes": [
    {
      "id": "unique-id",
      "title": "Theme title (concise)",
      "description": "2-3 sentence description of the theme",
      "conviction": "high|medium|low",
      "analysts": ["analyst names who hold this view"],
      "timeframe": "near-term|medium-term|long-term"
    }
  ],
  "positions": [
    {
      "id": "unique-id",
      "instrument": "Ticker or instrument name (e.g. SPY, Gold, 10Y UST, EUR/USD)",
      "type": "long|short|options|relative value|macro",
      "thesis": "2-3 sentence investment thesis",
      "catalysts": ["specific near-term catalyst 1", "catalyst 2"],
      "risks": ["key risk 1", "key risk 2"],
      "analysts": ["analyst names supporting this"],
      "conviction": "high|medium|low",
      "assetClass": "equities|rates|fx|commodities|options|macro"
    }
  ],
  "marketRegime": "One sentence description of current market regime",
  "keyRisks": ["Top macro risk 1", "Top macro risk 2", "Top macro risk 3"],
  "summary": "2-3 paragraph executive summary of the overall investment landscape based on these analysts"
}

Important:
- Identify themes that multiple analysts agree on (high conviction) vs single-analyst ideas (lower conviction)
- Be specific about instruments and tickers where mentioned
- Distinguish between directional positions, relative value, and macro themes
- Include both bullish and bearish ideas
- If analysts conflict on a view, note the disagreement in the theme/position
- Only include positions that are clearly mentioned or strongly implied by the content`;

  const message = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const rawText =
    message.content[0].type === "text" ? message.content[0].text : "";

  // Extract JSON from the response
  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to extract JSON from synthesis response");
  }

  const parsed = JSON.parse(jsonMatch[0]);

  return {
    ...parsed,
    synthesizedAt: new Date().toISOString(),
  };
}
