import { notFound } from "next/navigation";
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
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold text-emerald-600">
          @{profile.username}
        </p>
        <h1 className="text-2xl font-semibold text-slate-900">
          {profile.display_name || "Journalist"}
        </h1>
        <p className="text-sm text-slate-600">
          Public timeline · {pages?.length ?? 0} pages
        </p>
      </div>

      <div className="grid gap-3">
        {pages?.length ? (
          pages.map((page) => (
            <PageCard key={page.id} page={page} href={`/p/${page.id}`} />
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-600">
            No public pages yet.
          </div>
        )}
      </div>
    </div>
  );
}
