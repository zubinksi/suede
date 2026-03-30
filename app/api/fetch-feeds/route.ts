import { NextResponse } from "next/server";
import { ANALYSTS } from "@/lib/analysts";
import { fetchAnalystContent } from "@/lib/fetcher";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const analystId = searchParams.get("analyst");

  const analysts = analystId
    ? ANALYSTS.filter((a) => a.id === analystId)
    : ANALYSTS;

  const results = await Promise.allSettled(
    analysts.map(async (analyst) => {
      const posts = await fetchAnalystContent(analyst);
      return { analyst, posts };
    })
  );

  const data = results.map((r) => {
    if (r.status === "fulfilled") return r.value;
    return { analyst: null, posts: [], error: String(r.reason) };
  });

  return NextResponse.json(data);
}
