import { NextRequest, NextResponse } from "next/server";
import { synthesizePosts } from "@/lib/synthesizer";
import { AnalystPost, ANALYSTS } from "@/lib/analysts";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// POST: Accept raw text/notes pasted from newsletters/Twitter and synthesize
export async function POST(request: NextRequest) {
  try {
    const { analystId, content, title } = await request.json();

    const analyst = ANALYSTS.find((a) => a.id === analystId);
    if (!analyst) {
      return NextResponse.json({ error: "Unknown analyst" }, { status: 400 });
    }

    const post: AnalystPost = {
      analystId,
      analystName: analyst.displayName,
      title: title || `${analyst.displayName} — Manual Input`,
      summary: content,
      url: analyst.sources[0]?.url || "",
      publishedAt: new Date().toISOString(),
      content,
      tags: analyst.tags,
    };

    return NextResponse.json({ post });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
