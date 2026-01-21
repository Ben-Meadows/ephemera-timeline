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
    <div className="mx-auto max-w-2xl">
      {/* Header card */}
      <div 
        className="relative mb-6 rounded-sm bg-[#f5efe6] p-6"
        style={{
          boxShadow: '0 2px 12px rgba(44, 24, 16, 0.06)',
          border: '1px solid rgba(139, 69, 19, 0.1)',
        }}
      >
        {/* Decorative tape */}
        <div 
          className="absolute -top-3 left-6 h-6 w-14"
          style={{
            background: 'linear-gradient(180deg, rgba(212, 165, 116, 0.6) 0%, rgba(212, 165, 116, 0.4) 100%)',
            transform: 'rotate(-2deg)',
          }}
        />
        
        <p className="font-[family-name:var(--font-typewriter)] text-xs uppercase tracking-[0.2em] text-[#8b4513]">
          ✦ Add to Collection
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-playfair)] text-2xl font-semibold text-[#2c1810]">
          Create New Page
        </h1>
        <p className="mt-2 font-[family-name:var(--font-crimson)] text-sm text-[#5c4033]">
          Upload a photo of your junk journal page and add the details. 
          Once created, you can click on the image to add markers for each item.
        </p>
      </div>

      {/* Form card */}
      <div 
        className="rounded-sm bg-[#f5efe6] p-6"
        style={{
          boxShadow: '0 4px 20px rgba(44, 24, 16, 0.08)',
          border: '1px solid rgba(139, 69, 19, 0.12)',
        }}
      >
        <NewPageForm action={createPageAction} />
      </div>
    </div>
  );
}
