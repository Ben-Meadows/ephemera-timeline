import Link from "next/link";
import { redirect } from "next/navigation";
import { PageCard } from "@/components/page/page-card";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-emerald-600">My timeline</p>
          <h1 className="text-2xl font-semibold text-slate-900">
            Pages in reverse chronological order
          </h1>
        </div>
        <Link
          href="/new"
          className="text-sm font-semibold text-emerald-700 underline"
        >
          New page
        </Link>
      </div>
      <div className="grid gap-3">
        {pages?.length ? (
          pages.map((page) => (
            <PageCard key={page.id} page={page} href={`/p/${page.id}`} />
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-600">
            You have no pages yet.{" "}
            <Link className="font-semibold text-emerald-700" href="/new">
              Create your first page
            </Link>
            .
          </div>
        )}
      </div>
    </div>
  );
}
