import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Button, buttonClasses } from "./ui/button";

async function signOut() {
  "use server";
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  revalidatePath("/timeline");
  redirect("/");
}

type NavProps = {
  authenticated: boolean;
};

export async function Nav({ authenticated }: NavProps) {
  return (
    <header className="border-b border-slate-100 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Ephemera Timeline
        </Link>
        <div className="flex items-center gap-3 text-sm">
          <Link
            href="/timeline"
            className="text-slate-700 hover:text-slate-900"
          >
            My timeline
          </Link>
          <Link href="/new" className="text-slate-700 hover:text-slate-900">
            New page
          </Link>
          {authenticated ? (
            <form action={signOut}>
              <Button type="submit" variant="secondary">
                Sign out
              </Button>
            </form>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/sign-in"
                className="text-slate-700 hover:text-slate-900"
              >
                Sign in
              </Link>
              <Link
                href="/auth/sign-up"
                className={buttonClasses("primary", "sm")}
              >
                Create account
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
