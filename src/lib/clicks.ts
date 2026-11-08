import { getMongoClient } from "@/lib/mongodb";

type ClickDoc = { _id: string; count: number };

async function collection() {
  const clientPromise = getMongoClient();
  if (!clientPromise) return null;
  const client = await clientPromise;
  return client.db(process.env.MONGODB_DB ?? "linknamu").collection<ClickDoc>("clicks");
}

/** 링크 하나의 클릭 수를 1 증가시킵니다. 실패해도 예외를 던지지 않습니다. */
export async function incrementClick(linkId: string): Promise<void> {
  try {
    const col = await collection();
    if (!col) return;
    await col.updateOne(
      { _id: linkId },
      { $inc: { count: 1 } },
      { upsert: true },
    );
  } catch (error) {
    console.error("[clicks] 클릭 수 기록 실패:", error);
  }
}

/** 링크별 클릭 수 조회 (관리 화면 등에서 사용 예정) */
export async function getClickCounts(): Promise<Record<string, number>> {
  try {
    const col = await collection();
    if (!col) return {};
    const docs = await col.find().toArray();
    return Object.fromEntries(docs.map((d) => [d._id, d.count]));
  } catch (error) {
    console.error("[clicks] 클릭 수 조회 실패:", error);
    return {};
  }
}
