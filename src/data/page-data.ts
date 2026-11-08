// ⚠️ 보여주기용 더미 데이터입니다. 진짜 내용은 나중에 이 파일에서 바꿔 주세요.
// (이후 MongoDB Atlas 연동 시 DB 조회로 교체할 수 있습니다.)

export type Profile = {
  name: string;
  bio: string;
  /** 프로필 사진 경로(public 폴더 기준) 또는 URL. 없으면 이름 첫 글자를 보여줍니다. */
  avatar?: string;
};

export type LinkItem = {
  id: string;
  title: string;
  url: string;
};

export const profile: Profile = {
  name: "김클로",
  bio: "세계최강 바이브 코더",
  avatar: "/avatar-dummy.svg",
};

export const links: LinkItem[] = [
  { id: "link-1", title: "링크 카드 1", url: "https://example.com/1" },
  { id: "link-2", title: "링크 카드 2", url: "https://example.com/2" },
  { id: "link-3", title: "링크 카드 3", url: "https://example.com/3" },
];
