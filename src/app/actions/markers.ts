"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { markerSchema, isValidUUID } from "@/lib/validators";
import {
  sanitizeSingleLine,
  sanitizeText,
  sanitizeCoordinate,
  containsXSSPatterns,
} from "@/lib/sanitize";
import {
  checkRateLimit,
  getClientIP,
  RATE_LIMITS,
  rateLimitError,
} from "@/lib/rate-limit";
import {
  logDataChange,
  logValidationFailure,
  logRateLimitExceeded,
  logXSSAttempt,
} from "@/lib/audit";
import { z } from "zod";

type ActionResult = { error?: string } | void;

const updateSchema = markerSchema.extend({
  id: z.string().uuid(),
});

export async function createMarkerAction(
  payload: z.infer<typeof markerSchema>
): Promise<ActionResult> {
  const headersList = await headers();
  const ip = getClientIP(headersList);
  const user = await requireUser();

  // Rate limiting
  const rateLimitResult = checkRateLimit(
    user.id,
    "marker.create",
    RATE_LIMITS.create
  );
  if (!rateLimitResult.success) {
    logRateLimitExceeded("marker.create", { identifier: user.id, ip });
    return rateLimitError(rateLimitResult.resetInSeconds);
  }

  // Sanitize inputs
  const sanitizedPayload = {
    page_id: payload.page_id,
    x: sanitizeCoordinate(payload.x) ?? 0,
    y: sanitizeCoordinate(payload.y) ?? 0,
    label: sanitizeSingleLine(payload.label),
    note: payload.note ? sanitizeText(payload.note) : undefined,
    category: payload.category
      ? sanitizeSingleLine(payload.category)
      : undefined,
    source_date: payload.source_date,
    source_location: payload.source_location
      ? sanitizeSingleLine(payload.source_location)
      : undefined,
  };

  // Check for XSS
  if (containsXSSPatterns(payload.label)) {
    logXSSAttempt("marker.label", { userId: user.id, ip, rawInput: payload.label });
  }
  if (payload.note && containsXSSPatterns(payload.note)) {
    logXSSAttempt("marker.note", { userId: user.id, ip, rawInput: payload.note });
  }

  // Validate
  const parsed = markerSchema.safeParse(sanitizedPayload);
  if (!parsed.success) {
    logValidationFailure("marker.create", {
      userId: user.id,
      ip,
      field: parsed.error.issues[0]?.path.join("."),
      reason: parsed.error.issues[0]?.message,
    });
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("page_items")
    .insert(parsed.data)
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  logDataChange("create", "marker", {
    userId: user.id,
    resourceId: data.id,
    ip,
  });

  revalidatePath(`/p/${payload.page_id}`);
}

export async function updateMarkerAction(
  payload: z.infer<typeof updateSchema>
): Promise<ActionResult> {
  const headersList = await headers();
  const ip = getClientIP(headersList);
  const user = await requireUser();

  // Rate limiting
  const rateLimitResult = checkRateLimit(
    user.id,
    "marker.update",
    RATE_LIMITS.modify
  );
  if (!rateLimitResult.success) {
    logRateLimitExceeded("marker.update", { identifier: user.id, ip });
    return rateLimitError(rateLimitResult.resetInSeconds);
  }

  // Validate UUID format first
  if (!isValidUUID(payload.id) || !isValidUUID(payload.page_id)) {
    logValidationFailure("marker.update", {
      userId: user.id,
      ip,
      reason: "Invalid UUID format",
    });
    return { error: "Invalid marker or page ID" };
  }

  // Sanitize inputs
  const sanitizedPayload = {
    id: payload.id,
    page_id: payload.page_id,
    x: sanitizeCoordinate(payload.x) ?? 0,
    y: sanitizeCoordinate(payload.y) ?? 0,
    label: sanitizeSingleLine(payload.label),
    note: payload.note ? sanitizeText(payload.note) : undefined,
    category: payload.category
      ? sanitizeSingleLine(payload.category)
      : undefined,
    source_date: payload.source_date,
    source_location: payload.source_location
      ? sanitizeSingleLine(payload.source_location)
      : undefined,
  };

  // Check for XSS
  if (containsXSSPatterns(payload.label)) {
    logXSSAttempt("marker.label", { userId: user.id, ip, rawInput: payload.label });
  }

  // Validate
  const parsed = updateSchema.safeParse(sanitizedPayload);
  if (!parsed.success) {
    logValidationFailure("marker.update", {
      userId: user.id,
      ip,
      field: parsed.error.issues[0]?.path.join("."),
      reason: parsed.error.issues[0]?.message,
    });
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

  logDataChange("update", "marker", {
    userId: user.id,
    resourceId: parsed.data.id,
    ip,
  });

  revalidatePath(`/p/${payload.page_id}`);
}

export async function deleteMarkerAction(payload: {
  id: string;
  page_id: string;
}): Promise<ActionResult> {
  const headersList = await headers();
  const ip = getClientIP(headersList);
  const user = await requireUser();

  // Rate limiting
  const rateLimitResult = checkRateLimit(
    user.id,
    "marker.delete",
    RATE_LIMITS.modify
  );
  if (!rateLimitResult.success) {
    logRateLimitExceeded("marker.delete", { identifier: user.id, ip });
    return rateLimitError(rateLimitResult.resetInSeconds);
  }

  // Validate UUID format
  if (!isValidUUID(payload.id) || !isValidUUID(payload.page_id)) {
    logValidationFailure("marker.delete", {
      userId: user.id,
      ip,
      reason: "Invalid UUID format",
    });
    return { error: "Invalid marker or page ID" };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("page_items")
    .delete()
    .eq("id", payload.id)
    .eq("page_id", payload.page_id);

  if (error) {
    return { error: error.message };
  }

  logDataChange("delete", "marker", {
    userId: user.id,
    resourceId: payload.id,
    ip,
  });

  revalidatePath(`/p/${payload.page_id}`);
}

export type CreateMarker = typeof createMarkerAction;
export type UpdateMarker = typeof updateMarkerAction;
export type DeleteMarker = typeof deleteMarkerAction;
