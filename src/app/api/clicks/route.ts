import { NextResponse } from "next/server";
import { getClickCounts } from "@/lib/clicks";
import { links } from "@/data/page-data";

// 항상 최신 클릭 수를 보여주도록 캐시하지 않습니다.
export const dynamic = "force-dynamic";

/** 링크별 클릭 수 조회: GET /api/clicks */
export async function GET() {
  const counts = await getClickCounts();
  return NextResponse.json(
    links.map((link) => ({
      id: link.id,
      title: link.title,
      clicks: counts[link.id] ?? 0,
    })),
  );
}
