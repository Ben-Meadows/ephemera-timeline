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
    <header className="border-b border-[#d4a574]/40 bg-[#f5efe6]/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        {/* Logo with vintage flourish */}
        <Link href="/" className="group flex items-center gap-3">
          {/* Decorative stamp/seal */}
          <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#8b4513] bg-[#faf6f1] transition-transform group-hover:rotate-12">
            <span className="font-[family-name:var(--font-typewriter)] text-sm font-bold text-[#8b4513]">
              ET
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-[family-name:var(--font-playfair)] text-lg font-semibold text-[#2c1810] tracking-wide">
              Ephemera Timeline
            </span>
            <span className="font-[family-name:var(--font-typewriter)] text-[10px] uppercase tracking-[0.2em] text-[#8b4513]">
              Collect · Preserve · Share
            </span>
          </div>
        </Link>

        {/* Navigation links */}
        <nav className="flex items-center gap-6 text-sm">
          <Link
            href="/timeline"
            className="font-[family-name:var(--font-crimson)] text-[#5c4033] transition-colors hover:text-[#8b4513] relative group"
          >
            My Timeline
            <span className="absolute -bottom-1 left-0 h-px w-0 bg-[#8b4513] transition-all group-hover:w-full" />
          </Link>
          <Link 
            href="/new" 
            className="font-[family-name:var(--font-crimson)] text-[#5c4033] transition-colors hover:text-[#8b4513] relative group"
          >
            New Page
            <span className="absolute -bottom-1 left-0 h-px w-0 bg-[#8b4513] transition-all group-hover:w-full" />
          </Link>
          
          {authenticated ? (
            <form action={signOut}>
              <Button type="submit" variant="secondary" size="sm">
                Sign out
              </Button>
            </form>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/auth/sign-in"
                className="font-[family-name:var(--font-crimson)] text-[#5c4033] transition-colors hover:text-[#8b4513]"
              >
                Sign in
              </Link>
              <Link
                href="/auth/sign-up"
                className={buttonClasses("primary", "sm")}
              >
                Create Account
              </Link>
            </div>
          )}
        </nav>
      </div>
      
      {/* Decorative border flourish */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#d4a574] to-transparent" />
    </header>
  );
}
