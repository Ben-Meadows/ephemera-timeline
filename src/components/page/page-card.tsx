import Image from "next/image";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { JournalPage } from "@/lib/types";

type PageCardProps = {
  page: JournalPage & { image_url?: string };
  href: string;
};

function visibilityBadge(visibility: string) {
  const styles: Record<string, string> = {
    public: "bg-[#f5efe6] text-[#5c4033] border-[#8b4513]",
    private: "bg-[#f5efe6] text-[#722f37] border-[#722f37]",
    unlisted: "bg-[#f5efe6] text-[#8b4513] border-[#d4a574]",
  };
  return styles[visibility] ?? styles.private;
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
  const supabase = await createSupabaseServerClient();
  const { data } = supabase.storage
    .from("journal-pages")
    .getPublicUrl(page.image_path);
  const imageUrl = page.image_url ?? data.publicUrl;
  const dateInfo = formatDate(page.page_date);

  return (
    <Link
      href={href}
      className="group relative flex gap-5 rounded-sm bg-[#f5efe6] p-5 transition-all duration-300 hover:-translate-y-1"
      style={{
        boxShadow: '2px 3px 12px rgba(44, 24, 16, 0.08), 0 1px 3px rgba(44, 24, 16, 0.05)',
        border: '1px solid rgba(139, 69, 19, 0.12)',
      }}
    >
      {/* Tape decoration at top */}
      <div 
        className="absolute -top-2 left-1/2 -translate-x-1/2 w-16 h-5 opacity-70"
        style={{
          background: 'linear-gradient(180deg, rgba(212, 165, 116, 0.6) 0%, rgba(212, 165, 116, 0.4) 100%)',
          transform: 'translateX(-50%) rotate(-1deg)',
        }}
      />
      
      {/* Photo with vintage frame */}
      <div className="relative h-32 w-28 flex-shrink-0 overflow-hidden bg-[#e8dfd3]"
        style={{
          boxShadow: 'inset 0 0 20px rgba(44, 24, 16, 0.1)',
          border: '3px solid #f5efe6',
          outline: '1px solid rgba(139, 69, 19, 0.2)',
        }}
      >
        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-[#d4a574] opacity-60" />
        <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-[#d4a574] opacity-60" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-[#d4a574] opacity-60" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-[#d4a574] opacity-60" />
        
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={page.title ?? "Journal page"}
            fill
            sizes="120px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="font-[family-name:var(--font-typewriter)] text-xs text-[#8b7355]">
              No image
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-between py-1">
        {/* Header with date postmark and visibility */}
        <div className="flex items-start justify-between gap-3">
          {/* Postmark-style date */}
          <div 
            className="flex flex-col items-center justify-center rounded-full border-2 border-[#722f37] px-3 py-1 opacity-80"
            style={{ transform: 'rotate(-8deg)' }}
          >
            <span className="font-[family-name:var(--font-typewriter)] text-[10px] leading-none text-[#722f37]">
              {dateInfo.month}
            </span>
            <span className="font-[family-name:var(--font-typewriter)] text-lg font-bold leading-none text-[#722f37]">
              {dateInfo.day}
            </span>
            <span className="font-[family-name:var(--font-typewriter)] text-[10px] leading-none text-[#722f37]">
              {dateInfo.year}
            </span>
          </div>

          {/* Visibility badge */}
          <span
            className={`rounded-sm border px-2 py-0.5 font-[family-name:var(--font-typewriter)] text-[10px] uppercase tracking-wider ${visibilityBadge(page.visibility)}`}
          >
            {page.visibility}
          </span>
        </div>

        {/* Title and caption */}
        <div className="mt-2 space-y-1">
          <h3 className="font-[family-name:var(--font-playfair)] text-base font-semibold text-[#2c1810] group-hover:text-[#8b4513] transition-colors">
            {page.title || "Untitled page"}
          </h3>
          {page.caption && (
            <p className="font-[family-name:var(--font-crimson)] text-sm text-[#5c4033] line-clamp-2 italic">
              {page.caption}
            </p>
          )}
        </div>
      </div>

      {/* Hover indicator - small arrow */}
      <div className="absolute bottom-4 right-4 opacity-0 transition-opacity group-hover:opacity-100">
        <span className="font-[family-name:var(--font-typewriter)] text-xs text-[#8b4513]">
          View →
        </span>
      </div>
    </Link>
  );
}
