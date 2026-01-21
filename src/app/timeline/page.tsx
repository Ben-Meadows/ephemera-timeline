import Link from "next/link";
import { redirect } from "next/navigation";
import { PageCard } from "@/components/page/page-card";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { buttonClasses } from "@/components/ui/button";

export default async function TimelinePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  const { data: pages } = await supabase
    .from("journal_pages")
    .select("*")
    .eq("user_id", user.id)
    .order("page_date", { ascending: false });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div 
        className="rounded-sm bg-[#f5efe6] p-6"
        style={{
          boxShadow: '0 2px 12px rgba(44, 24, 16, 0.06)',
          border: '1px solid rgba(139, 69, 19, 0.1)',
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="font-[family-name:var(--font-typewriter)] text-xs uppercase tracking-[0.2em] text-[#8b4513]">
              ✦ My Collection
            </p>
            <h1 className="mt-1 font-[family-name:var(--font-playfair)] text-2xl font-semibold text-[#2c1810]">
              Your Timeline
            </h1>
            <p className="mt-1 font-[family-name:var(--font-crimson)] text-sm text-[#5c4033]">
              Pages arranged in reverse chronological order
            </p>
          </div>
          <Link
            href="/new"
            className={buttonClasses("primary", "md")}
          >
            + New Page
          </Link>
        </div>
      </div>

      {/* Pages grid */}
      <div className="grid gap-4">
        {pages?.length ? (
          pages.map((page) => (
            <PageCard key={page.id} page={page} href={`/p/${page.id}`} />
          ))
        ) : (
          <div 
            className="relative rounded-sm bg-[#f5efe6] p-8 text-center"
            style={{
              boxShadow: '0 2px 12px rgba(44, 24, 16, 0.06)',
              border: '1px dashed rgba(139, 69, 19, 0.3)',
            }}
          >
            {/* Decorative corners */}
            <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-[#d4a574] opacity-50" />
            <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-[#d4a574] opacity-50" />
            <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-[#d4a574] opacity-50" />
            <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-[#d4a574] opacity-50" />
            
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-[#d4a574]">
              <span className="text-2xl">📄</span>
            </div>
            <p className="font-[family-name:var(--font-playfair)] text-lg font-semibold text-[#2c1810]">
              Your collection is empty
            </p>
            <p className="mt-2 font-[family-name:var(--font-crimson)] text-sm text-[#5c4033]">
              Start preserving your ephemera.{" "}
              <Link 
                className="font-semibold text-[#8b4513] underline decoration-[#d4a574] underline-offset-2" 
                href="/new"
              >
                Create your first page
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
