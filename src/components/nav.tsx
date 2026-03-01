import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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
    <header style={{ backgroundColor: "#210706", borderBottom: "2px solid #891D1A" }}>
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full transition-transform group-hover:rotate-12"
            style={{ border: "2px solid #891D1A", backgroundColor: "#2a0a08" }}
          >
            <span className="font-[family-name:var(--font-playfair)] text-sm font-bold text-[#F1E6D2]">
              ET
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-[family-name:var(--font-playfair)] text-lg font-semibold text-[#F1E6D2] tracking-wide">
              Ephemera Timeline
            </span>
            <span className="font-[family-name:var(--font-crimson)] text-[10px] italic text-[#891D1A]">
              Collect · Preserve · Share
            </span>
          </div>
        </Link>

        {/* Navigation links */}
        <nav className="flex items-center gap-6 text-sm">
          <Link
            href="/timeline"
            className="font-[family-name:var(--font-crimson)] text-[#F1E6D2]/80 transition-colors hover:text-[#F1E6D2] relative group"
          >
            My Timeline
            <span className="absolute -bottom-1 left-0 h-px w-0 bg-[#891D1A] transition-all group-hover:w-full" />
          </Link>
          <Link
            href="/timelines"
            className="font-[family-name:var(--font-crimson)] text-[#F1E6D2]/80 transition-colors hover:text-[#F1E6D2] relative group"
          >
            Collections
            <span className="absolute -bottom-1 left-0 h-px w-0 bg-[#891D1A] transition-all group-hover:w-full" />
          </Link>
          <Link
            href="/new"
            className="font-[family-name:var(--font-crimson)] text-[#F1E6D2]/80 transition-colors hover:text-[#F1E6D2] relative group"
          >
            New Page
            <span className="absolute -bottom-1 left-0 h-px w-0 bg-[#891D1A] transition-all group-hover:w-full" />
          </Link>

          {authenticated ? (
            <form action={signOut}>
              <button
                type="submit"
                className="font-[family-name:var(--font-crimson)] text-sm rounded-sm px-3 py-1.5 transition-all hover:opacity-90"
                style={{ border: "1px solid rgba(241,230,210,0.3)", color: "#F1E6D2" }}
              >
                Sign out
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/auth/sign-in"
                className="font-[family-name:var(--font-crimson)] text-sm text-[#F1E6D2]/80 hover:text-[#F1E6D2] transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/auth/sign-up"
                className="font-[family-name:var(--font-crimson)] text-sm rounded-sm px-3 py-1.5 font-semibold transition-all hover:opacity-90"
                style={{ backgroundColor: "#891D1A", color: "#F1E6D2" }}
              >
                Create Account
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
