import { notFound } from "next/navigation";
import Link from "next/link";
import { PageCard } from "@/components/page/page-card";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Params = {
  params: Promise<{ username: string }>;
};

export default async function PublicProfile({ params }: Params) {
  const { username } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (!profile) {
    notFound();
  }

  const { data: pages } = await supabase
    .from("journal_pages")
    .select("*")
    .eq("user_id", profile.id)
    .in("visibility", ["public", "unlisted"])
    .order("page_date", { ascending: false });

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <div 
        className="relative rounded-sm bg-[#f5efe6] p-8 text-center"
        style={{
          boxShadow: '0 4px 20px rgba(44, 24, 16, 0.08)',
          border: '1px solid rgba(139, 69, 19, 0.12)',
        }}
      >
        {/* Decorative corners */}
        <div className="absolute top-3 left-3 w-6 h-6 border-l-2 border-t-2 border-[#d4a574] opacity-50" />
        <div className="absolute top-3 right-3 w-6 h-6 border-r-2 border-t-2 border-[#d4a574] opacity-50" />
        <div className="absolute bottom-3 left-3 w-6 h-6 border-l-2 border-b-2 border-[#d4a574] opacity-50" />
        <div className="absolute bottom-3 right-3 w-6 h-6 border-r-2 border-b-2 border-[#d4a574] opacity-50" />

        {/* Avatar/Initial */}
        <div 
          className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full"
          style={{
            background: 'radial-gradient(circle at 30% 30%, #9a3b3b, #722f37)',
            boxShadow: 'inset -2px -2px 4px rgba(0, 0, 0, 0.2), 2px 2px 8px rgba(44, 24, 16, 0.2)',
          }}
        >
          <span className="font-[family-name:var(--font-playfair)] text-2xl text-[#f5efe6]">
            {(profile.display_name || profile.username)[0].toUpperCase()}
          </span>
        </div>

        {/* Username */}
        <p className="font-[family-name:var(--font-typewriter)] text-xs uppercase tracking-[0.2em] text-[#8b4513]">
          @{profile.username}
        </p>

        {/* Display name */}
        <h1 className="mt-2 font-[family-name:var(--font-playfair)] text-2xl font-semibold text-[#2c1810]">
          {profile.display_name || "Ephemera Collector"}
        </h1>

        {/* Stats */}
        <div className="mt-4 flex items-center justify-center gap-6">
          <div className="text-center">
            <p className="font-[family-name:var(--font-playfair)] text-2xl font-semibold text-[#2c1810]">
              {pages?.length ?? 0}
            </p>
            <p className="font-[family-name:var(--font-typewriter)] text-[10px] uppercase tracking-wider text-[#8b4513]">
              Public Pages
            </p>
          </div>
        </div>
      </div>

      {/* Pages section */}
      <div>
        <div className="vintage-divider mb-6">
          <span className="font-[family-name:var(--font-typewriter)] text-xs uppercase tracking-wider text-[#8b4513]">
            Public Collection
          </span>
        </div>

        <div className="grid gap-4">
          {pages?.length ? (
            pages.map((page) => (
              <PageCard key={page.id} page={page} href={`/p/${page.id}`} />
            ))
          ) : (
            <div 
              className="rounded-sm bg-[#f5efe6] p-8 text-center"
              style={{
                border: '1px dashed rgba(139, 69, 19, 0.3)',
              }}
            >
              <span className="text-3xl">📭</span>
              <p className="mt-3 font-[family-name:var(--font-playfair)] text-lg font-semibold text-[#2c1810]">
                No public pages yet
              </p>
              <p className="mt-1 font-[family-name:var(--font-crimson)] text-sm text-[#5c4033]">
                This collector hasn't shared any ephemera publicly.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
