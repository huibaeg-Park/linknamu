import LinkCard from "@/components/LinkCard";
import ProfileHeader from "@/components/ProfileHeader";
import { links, profile } from "@/data/page-data";

// frame.png 와이어프레임 구성:
//   상단 — 원형 프로필 사진 / 이름 / 한 줄 소개
//   하단 — 링크 카드 목록 (세로 배치)
export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center px-4 py-12 sm:py-16">
      <ProfileHeader profile={profile} />

      <nav aria-label="링크 목록" className="mt-10 flex w-full flex-col gap-3">
        {links.map((link) => (
          <LinkCard key={link.id} link={link} />
        ))}
      </nav>
    </main>
  );
}
