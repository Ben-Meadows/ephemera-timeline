"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { pageSchema } from "@/lib/validators";

type ActionResult = { error?: string } | void;

export async function createPageAction(
  formData: FormData,
): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to create a page." };
  }
  const image = formData.get("image");

  if (!(image instanceof File) || image.size === 0) {
    return { error: "Image is required" };
  }

  const parsed = pageSchema.safeParse({
    title: formData.get("title"),
    page_date: formData.get("page_date"),
    caption: formData.get("caption"),
    visibility: formData.get("visibility"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const pageId = crypto.randomUUID();
  const extension = image.name.split(".").pop() ?? "jpg";
  const objectPath = `${user.id}/${pageId}/original.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from("journal-pages")
    .upload(objectPath, image, {
      contentType: image.type,
      upsert: false,
    });

  if (uploadError) {
    return { error: uploadError.message };
  }

  const { error: insertError } = await supabase.from("journal_pages").insert({
    id: pageId,
    user_id: user.id,
    title: parsed.data.title || null,
    page_date: parsed.data.page_date,
    caption: parsed.data.caption || null,
    visibility: parsed.data.visibility,
    image_path: objectPath,
  });

  if (insertError) {
    return { error: insertError.message };
  }

  revalidatePath("/timeline");
  redirect(`/p/${pageId}`);
}
