import { redirect } from "next/navigation";
import { NewPageForm } from "@/components/page/new-page-form";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createPageAction } from "./actions";

export default async function NewPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <p className="text-sm font-semibold text-emerald-600">New page</p>
        <h1 className="text-2xl font-semibold text-slate-900">
          Upload and annotate
        </h1>
        <p className="text-sm text-slate-600">
          Upload a photo of your junk journal page and add basic details. You
          can add markers after the page is created.
        </p>
      </div>
      <NewPageForm action={createPageAction} />
    </div>
  );
}
