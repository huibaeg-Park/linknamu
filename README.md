# 🌳 링크나무

내 모든 링크를 한 페이지에 모아 하나의 URL로 공유하는 서비스입니다. (모바일 우선 반응형)

## 기술 스택
- Next.js 16 (App Router) + TypeScript
- Tailwind CSS 4
- MongoDB Atlas (클릭 수 저장)
- Vercel (배포)

## 실행 방법
1. [Node.js](https://nodejs.org) 20 이상(LTS) 설치
2. 패키지 설치: `npm install`
3. `.env.example` 을 `.env.local` 로 복사하고 `MONGODB_URI` 입력 (없어도 페이지는 동작, 클릭 수만 기록 안 됨)
4. 개발 서버: `npm run dev` (또는 `start.bat` 더블클릭) → http://localhost:3000

## 기능
- **프로필**: 이름, 한 줄 소개, 원형 프로필 사진 (`src/data/page-data.ts` 에서 수정)
- **링크 카드**: SNS·블로그 링크를 카드로 나열, 클릭하면 새 탭으로 이동
- **클릭 수 집계**: 카드 클릭 시 `/go/<id>` 를 거쳐 MongoDB에 횟수를 기록한 뒤 이동
  - 링크별 클릭 수 확인: http://localhost:3000/api/clicks

## 구조
```
src/app/page.tsx              메인 페이지 (프로필 + 링크 카드 목록)
src/app/go/[id]/route.ts      클릭 수 기록 후 원래 주소로 이동
src/app/api/clicks/route.ts   링크별 클릭 수 조회 API
src/components/               ProfileHeader, LinkCard
src/data/page-data.ts         프로필·링크 데이터
src/lib/                      MongoDB 연결, 클릭 수 저장
```

## Vercel 배포
저장소를 Vercel에 연결하고 환경변수 `MONGODB_URI`, `MONGODB_DB` 를 등록하면 됩니다.
