import type { Profile } from "@/data/page-data";

export default function ProfileHeader({ profile }: { profile: Profile }) {
  return (
    <header className="flex flex-col items-center text-center">
      {profile.avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={profile.avatar}
          alt={`${profile.name} 프로필 사진`}
          className="size-28 rounded-full object-cover ring-4 ring-white shadow-md"
        />
      ) : (
        <div
          aria-hidden="true"
          className="flex size-28 items-center justify-center rounded-full bg-[var(--accent)] text-4xl font-bold text-white ring-4 ring-white shadow-md"
        >
          {profile.name.charAt(0)}
        </div>
      )}
      <h1 className="mt-4 text-2xl font-bold">{profile.name}</h1>
      <p className="mt-1 text-base text-neutral-600">{profile.bio}</p>
    </header>
  );
}
