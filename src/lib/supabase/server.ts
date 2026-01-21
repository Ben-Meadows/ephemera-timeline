import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createSupabaseServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase environment variables are not configured.");
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch {
          // Expected: cookies can only be modified in Server Actions/Route Handlers
          // This silently fails during page renders, which is fine
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.delete({ name, ...options });
        } catch {
          // Expected: cookies can only be modified in Server Actions/Route Handlers
        }
      },
    },
  });
}
