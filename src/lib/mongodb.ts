import { MongoClient } from "mongodb";

// 개발 서버(HMR)에서 연결이 계속 늘어나지 않도록 전역에 캐시합니다.
const globalForMongo = globalThis as unknown as {
  _mongoClientPromise?: Promise<MongoClient>;
};

/** MONGODB_URI가 없으면 null (클릭 수 기록만 건너뛰고 페이지는 정상 동작) */
export function getMongoClient(): Promise<MongoClient> | null {
  const uri = process.env.MONGODB_URI;
  if (!uri) return null;

  if (!globalForMongo._mongoClientPromise) {
    globalForMongo._mongoClientPromise = new MongoClient(uri).connect();
  }
  return globalForMongo._mongoClientPromise;
}
