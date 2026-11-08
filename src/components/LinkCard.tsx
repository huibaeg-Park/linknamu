import type { LinkItem } from "@/data/page-data";

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export default function LinkCard({ link }: { link: LinkItem }) {
  return (
    <a
      // /go/<id> 를 거쳐 클릭 수를 기록한 뒤 원래 주소로 이동합니다.
      href={`/go/${link.id}`}
      target="_blank"
      rel="noopener noreferrer"
      className="block w-full rounded-2xl border border-neutral-200 bg-white px-5 py-4 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--accent)] hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] active:translate-y-0"
    >
      <span className="block text-base font-semibold">{link.title}</span>
      <span className="mt-0.5 block text-xs text-neutral-500">
        {hostOf(link.url)}
      </span>
    </a>
  );
}
