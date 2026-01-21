"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { isValidUUID } from "@/lib/validators";
import {
  sanitizeSingleLine,
  sanitizeText,
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

type ActionResult = { error?: string; data?: unknown } | void;

// Validation schemas
const timelineSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less"),
  description: z
    .string()
    .max(500, "Description must be 500 characters or less")
    .optional()
    .nullable(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex color")
    .default("#8b4513"),
  icon: z.string().max(10, "Icon must be 10 characters or less").default("📁"),
  visibility: z.enum(["private", "public", "unlisted"]).default("private"),
});

const updateTimelineSchema = timelineSchema.extend({
  id: z.string().uuid(),
});

export async function createTimelineAction(
  payload: z.infer<typeof timelineSchema>
): Promise<ActionResult> {
  const headersList = await headers();
  const ip = getClientIP(headersList);
  const user = await requireUser();

  // Rate limiting
  const rateLimitResult = checkRateLimit(
    user.id,
    "timeline.create",
    RATE_LIMITS.create
  );
  if (!rateLimitResult.success) {
    logRateLimitExceeded("timeline.create", { identifier: user.id, ip });
    return rateLimitError(rateLimitResult.resetInSeconds);
  }

  // Sanitize inputs
  const sanitizedPayload = {
    name: sanitizeSingleLine(payload.name),
    description: payload.description
      ? sanitizeText(payload.description)
      : null,
    color: payload.color || "#8b4513",
    icon: payload.icon || "📁",
    visibility: payload.visibility || "private",
  };

  // Check for XSS
  if (containsXSSPatterns(payload.name)) {
    logXSSAttempt("timeline.name", {
      userId: user.id,
      ip,
      rawInput: payload.name,
    });
  }

  // Validate
  const parsed = timelineSchema.safeParse(sanitizedPayload);
  if (!parsed.success) {
    logValidationFailure("timeline.create", {
      userId: user.id,
      ip,
      field: parsed.error.issues[0]?.path.join("."),
      reason: parsed.error.issues[0]?.message,
    });
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("timelines")
    .insert({
      ...parsed.data,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  logDataChange("create", "timeline", {
    userId: user.id,
    resourceId: data.id,
    ip,
  });

  revalidatePath("/timelines");
  revalidatePath("/timeline");
  return { data };
}

export async function updateTimelineAction(
  payload: z.infer<typeof updateTimelineSchema>
): Promise<ActionResult> {
  const headersList = await headers();
  const ip = getClientIP(headersList);
  const user = await requireUser();

  // Rate limiting
  const rateLimitResult = checkRateLimit(
    user.id,
    "timeline.update",
    RATE_LIMITS.modify
  );
  if (!rateLimitResult.success) {
    logRateLimitExceeded("timeline.update", { identifier: user.id, ip });
    return rateLimitError(rateLimitResult.resetInSeconds);
  }

  // Validate UUID format
  if (!isValidUUID(payload.id)) {
    logValidationFailure("timeline.update", {
      userId: user.id,
      ip,
      reason: "Invalid UUID format",
    });
    return { error: "Invalid timeline ID" };
  }

  // Sanitize inputs
  const sanitizedPayload = {
    id: payload.id,
    name: sanitizeSingleLine(payload.name),
    description: payload.description
      ? sanitizeText(payload.description)
      : null,
    color: payload.color || "#8b4513",
    icon: payload.icon || "📁",
    visibility: payload.visibility || "private",
  };

  // Check for XSS
  if (containsXSSPatterns(payload.name)) {
    logXSSAttempt("timeline.name", {
      userId: user.id,
      ip,
      rawInput: payload.name,
    });
  }

  // Validate
  const parsed = updateTimelineSchema.safeParse(sanitizedPayload);
  if (!parsed.success) {
    logValidationFailure("timeline.update", {
      userId: user.id,
      ip,
      field: parsed.error.issues[0]?.path.join("."),
      reason: parsed.error.issues[0]?.message,
    });
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("timelines")
    .update({
      name: parsed.data.name,
      description: parsed.data.description,
      color: parsed.data.color,
      icon: parsed.data.icon,
      visibility: parsed.data.visibility,
    })
    .eq("id", parsed.data.id)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  logDataChange("update", "timeline", {
    userId: user.id,
    resourceId: parsed.data.id,
    ip,
  });

  revalidatePath("/timelines");
  revalidatePath("/timeline");
}

export async function deleteTimelineAction(payload: {
  id: string;
}): Promise<ActionResult> {
  const headersList = await headers();
  const ip = getClientIP(headersList);
  const user = await requireUser();

  // Rate limiting
  const rateLimitResult = checkRateLimit(
    user.id,
    "timeline.delete",
    RATE_LIMITS.modify
  );
  if (!rateLimitResult.success) {
    logRateLimitExceeded("timeline.delete", { identifier: user.id, ip });
    return rateLimitError(rateLimitResult.resetInSeconds);
  }

  // Validate UUID format
  if (!isValidUUID(payload.id)) {
    logValidationFailure("timeline.delete", {
      userId: user.id,
      ip,
      reason: "Invalid UUID format",
    });
    return { error: "Invalid timeline ID" };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("timelines")
    .delete()
    .eq("id", payload.id)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  logDataChange("delete", "timeline", {
    userId: user.id,
    resourceId: payload.id,
    ip,
  });

  revalidatePath("/timelines");
  revalidatePath("/timeline");
}

export async function assignPageToTimelinesAction(payload: {
  page_id: string;
  timeline_ids: string[];
}): Promise<ActionResult> {
  const headersList = await headers();
  const ip = getClientIP(headersList);
  const user = await requireUser();

  // Rate limiting
  const rateLimitResult = checkRateLimit(
    user.id,
    "timeline.assign",
    RATE_LIMITS.modify
  );
  if (!rateLimitResult.success) {
    logRateLimitExceeded("timeline.assign", { identifier: user.id, ip });
    return rateLimitError(rateLimitResult.resetInSeconds);
  }

  // Validate UUIDs
  if (!isValidUUID(payload.page_id)) {
    logValidationFailure("timeline.assign", {
      userId: user.id,
      ip,
      reason: "Invalid page UUID format",
    });
    return { error: "Invalid page ID" };
  }

  for (const tid of payload.timeline_ids) {
    if (!isValidUUID(tid)) {
      logValidationFailure("timeline.assign", {
        userId: user.id,
        ip,
        reason: "Invalid timeline UUID format",
      });
      return { error: "Invalid timeline ID" };
    }
  }

  const supabase = await createSupabaseServerClient();

  // First, remove all existing assignments for this page
  const { error: deleteError } = await supabase
    .from("page_timelines")
    .delete()
    .eq("page_id", payload.page_id);

  if (deleteError) {
    return { error: deleteError.message };
  }

  // Then, add the new assignments
  if (payload.timeline_ids.length > 0) {
    const insertData = payload.timeline_ids.map((timeline_id) => ({
      page_id: payload.page_id,
      timeline_id,
    }));

    const { error: insertError } = await supabase
      .from("page_timelines")
      .insert(insertData);

    if (insertError) {
      return { error: insertError.message };
    }
  }

  logDataChange("update", "page_timelines", {
    userId: user.id,
    resourceId: payload.page_id,
    ip,
    details: { timeline_ids: payload.timeline_ids },
  });

  revalidatePath(`/p/${payload.page_id}`);
  revalidatePath("/timeline");
  revalidatePath("/timelines");
}

export async function getTimelinesForPageAction(payload: {
  page_id: string;
}): Promise<{ data?: string[]; error?: string }> {
  const user = await requireUser();

  if (!isValidUUID(payload.page_id)) {
    return { error: "Invalid page ID" };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("page_timelines")
    .select("timeline_id")
    .eq("page_id", payload.page_id);

  if (error) {
    return { error: error.message };
  }

  return { data: data.map((pt) => pt.timeline_id) };
}

export type CreateTimeline = typeof createTimelineAction;
export type UpdateTimeline = typeof updateTimelineAction;
export type DeleteTimeline = typeof deleteTimelineAction;
export type AssignPageToTimelines = typeof assignPageToTimelinesAction;
