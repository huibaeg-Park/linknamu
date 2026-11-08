import { NextResponse } from "next/server";
import { incrementClick } from "@/lib/clicks";
import { links } from "@/data/page-data";

// 링크 카드를 누르면 이 주소를 거쳐 클릭 수를 기록한 뒤 원래 주소로 이동합니다.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const link = links.find((l) => l.id === id);

  if (!link) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  await incrementClick(link.id);
  return NextResponse.redirect(link.url);
}
