"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { markerSchema } from "@/lib/validators";
import { z } from "zod";

type ActionResult = { error?: string } | void;

const updateSchema = markerSchema.extend({
  id: z.string().uuid(),
});

export async function createMarkerAction(
  payload: z.infer<typeof markerSchema>,
): Promise<ActionResult> {
  await requireUser();
  const parsed = markerSchema.safeParse(payload);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("page_items").insert({
    ...parsed.data,
    // rely on RLS to ensure this page belongs to the user
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/p/${payload.page_id}`);
}

export async function updateMarkerAction(
  payload: z.infer<typeof updateSchema>,
): Promise<ActionResult> {
  await requireUser();
  const parsed = updateSchema.safeParse(payload);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("page_items")
    .update({
      label: parsed.data.label,
      note: parsed.data.note ?? null,
      category: parsed.data.category ?? null,
      source_date: parsed.data.source_date ?? null,
      source_location: parsed.data.source_location ?? null,
      x: parsed.data.x,
      y: parsed.data.y,
    })
    .eq("id", parsed.data.id)
    .eq("page_id", parsed.data.page_id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/p/${payload.page_id}`);
}

export async function deleteMarkerAction(
  payload: { id: string; page_id: string },
): Promise<ActionResult> {
  await requireUser();
  const schema = z.object({
    id: z.string().uuid(),
    page_id: z.string().uuid(),
  });
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return { error: "Invalid marker id" };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("page_items")
    .delete()
    .eq("id", parsed.data.id)
    .eq("page_id", parsed.data.page_id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/p/${payload.page_id}`);
}

export type CreateMarker = typeof createMarkerAction;
export type UpdateMarker = typeof updateMarkerAction;
export type DeleteMarker = typeof deleteMarkerAction;
