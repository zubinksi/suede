import { NextRequest, NextResponse } from "next/server";
import { synthesizePosts } from "@/lib/synthesizer";
import { AnalystPost } from "@/lib/analysts";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const { posts }: { posts: AnalystPost[] } = await request.json();

    if (!posts || posts.length === 0) {
      return NextResponse.json(
        { error: "No posts provided for synthesis" },
        { status: 400 }
      );
    }

    const result = await synthesizePosts(posts);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[synthesize]", err);
    return NextResponse.json(
      { error: "Synthesis failed", details: String(err) },
      { status: 500 }
    );
  }
}
