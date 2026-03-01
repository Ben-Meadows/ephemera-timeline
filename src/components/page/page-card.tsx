import Image from "next/image";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPageImageUrl } from "@/lib/supabase/storage";
import type { JournalPage } from "@/lib/types";

type PageCardProps = {
  page: JournalPage & { image_url?: string };
  href: string;
};

function visibilityBadge(visibility: string) {
  return "bg-[#5E657B]/10 text-[#5E657B] border-[#5E657B]/30";
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  return {
    day: date.getDate(),
    month: months[date.getMonth()],
    year: date.getFullYear(),
  };
}

export async function PageCard({ page, href }: PageCardProps) {
  let imageUrl = page.image_url;
  if (!imageUrl) {
    const supabase = await createSupabaseServerClient();
    imageUrl = await getPageImageUrl(supabase, page.image_path, page.visibility);
  }
  const dateInfo = formatDate(page.page_date);

  return (
    <Link
      href={href}
      className="group relative flex gap-5 rounded-sm bg-[#F1E6D2] p-5 transition-all duration-300 hover:-translate-y-1"
      style={{
        boxShadow: '2px 3px 12px rgba(33, 7, 6, 0.08), 0 1px 3px rgba(33, 7, 6, 0.05)',
        border: '1px solid rgba(137, 29, 26, 0.12)',
      }}
    >
      {/* Tape decoration */}
      <div
        className="absolute -top-2 left-1/2 -translate-x-1/2 w-14 h-4 opacity-50"
        style={{
          background: 'linear-gradient(180deg, rgba(137, 29, 26, 0.35) 0%, rgba(137, 29, 26, 0.2) 100%)',
          transform: 'translateX(-50%) rotate(-1deg)',
        }}
      />

      {/* Polaroid-style photo */}
      <div
        className="relative flex-shrink-0 overflow-hidden"
        style={{
          width: '108px',
          height: '124px',
          backgroundColor: '#FAFAF9',
          padding: '6px 6px 0 6px',
          boxShadow: '0 3px 10px rgba(33, 7, 6, 0.18)',
          border: '1px solid rgba(33, 7, 6, 0.06)',
        }}
      >
        {/* Photo area */}
        <div className="relative w-full overflow-hidden bg-[#F1E6D2]" style={{ height: '88px' }}>
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={page.title ?? "Journal page"}
              fill
              sizes="96px"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="font-[family-name:var(--font-crimson)] text-xs italic text-[#5E657B]">
                No image
              </span>
            </div>
          )}
        </div>
        {/* Polaroid date strip */}
        <div className="flex items-center justify-center h-[30px]">
          <span className="font-[family-name:var(--font-crimson)] text-[10px] italic text-[#891D1A]">
            {dateInfo.month} {dateInfo.day}, {dateInfo.year}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-between py-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          {/* Postmark-style date circle */}
          <div
            className="flex flex-col items-center justify-center rounded-full border-2 border-[#891D1A] px-3 py-1 opacity-80"
            style={{ transform: 'rotate(-8deg)' }}
          >
            <span className="font-[family-name:var(--font-crimson)] text-[9px] leading-none text-[#891D1A] italic">
              {dateInfo.month}
            </span>
            <span className="font-[family-name:var(--font-playfair)] text-lg font-bold leading-none text-[#891D1A]">
              {dateInfo.day}
            </span>
            <span className="font-[family-name:var(--font-crimson)] text-[9px] leading-none text-[#891D1A] italic">
              {dateInfo.year}
            </span>
          </div>

          {/* Visibility badge */}
          <span
            className={`rounded-sm border px-2 py-0.5 font-[family-name:var(--font-crimson)] text-[10px] italic ${visibilityBadge(page.visibility)}`}
          >
            {page.visibility}
          </span>
        </div>

        {/* Title and caption */}
        <div className="mt-2 space-y-1">
          <h3 className="font-[family-name:var(--font-playfair)] text-base font-semibold text-[#210706] group-hover:text-[#891D1A] transition-colors">
            {page.title || "Untitled page"}
          </h3>
          {page.caption && (
            <p className="font-[family-name:var(--font-crimson)] text-sm text-[#5E657B] line-clamp-2 italic">
              {page.caption}
            </p>
          )}
        </div>
      </div>

      {/* Hover indicator */}
      <div className="absolute bottom-4 right-4 opacity-0 transition-opacity group-hover:opacity-100">
        <span className="font-[family-name:var(--font-crimson)] text-xs italic text-[#891D1A]">
          View →
        </span>
      </div>
    </Link>
  );
}
