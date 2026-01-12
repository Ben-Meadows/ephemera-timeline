"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { pageSchema } from "@/lib/validators";
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

type ActionResult = { error?: string } | void;

// Allowed image MIME types
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

// Max file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function createPageAction(
  formData: FormData
): Promise<ActionResult> {
  const headersList = await headers();
  const ip = getClientIP(headersList);

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to create a page." };
  }

  // Rate limiting
  const rateLimitResult = checkRateLimit(
    user.id,
    "page.create",
    RATE_LIMITS.create
  );
  if (!rateLimitResult.success) {
    logRateLimitExceeded("page.create", { identifier: user.id, ip });
    return rateLimitError(rateLimitResult.resetInSeconds);
  }

  // Validate image
  const image = formData.get("image");
  if (!(image instanceof File) || image.size === 0) {
    return { error: "Image is required" };
  }

  // Check file type
  if (!ALLOWED_IMAGE_TYPES.includes(image.type)) {
    logValidationFailure("page.create", {
      userId: user.id,
      ip,
      field: "image",
      reason: `Invalid file type: ${image.type}`,
    });
    return { error: "Invalid image type. Allowed: JPEG, PNG, GIF, WebP" };
  }

  // Check file size
  if (image.size > MAX_FILE_SIZE) {
    logValidationFailure("page.create", {
      userId: user.id,
      ip,
      field: "image",
      reason: "File too large",
    });
    return { error: "Image too large. Maximum size is 10MB." };
  }

  // Sanitize text inputs
  const rawTitle = formData.get("title");
  const rawCaption = formData.get("caption");

  const title = rawTitle ? sanitizeSingleLine(rawTitle as string) : undefined;
  const caption = rawCaption ? sanitizeText(rawCaption as string) : undefined;

  // Check for XSS
  if (rawTitle && containsXSSPatterns(String(rawTitle))) {
    logXSSAttempt("title", { userId: user.id, ip, rawInput: String(rawTitle) });
  }
  if (rawCaption && containsXSSPatterns(String(rawCaption))) {
    logXSSAttempt("caption", {
      userId: user.id,
      ip,
      rawInput: String(rawCaption),
    });
  }

  // Validate
  const parsed = pageSchema.safeParse({
    title,
    page_date: formData.get("page_date"),
    caption,
    visibility: formData.get("visibility"),
  });

  if (!parsed.success) {
    logValidationFailure("page.create", {
      userId: user.id,
      ip,
      field: parsed.error.issues[0]?.path.join("."),
      reason: parsed.error.issues[0]?.message,
    });
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const pageId = crypto.randomUUID();

  // Sanitize file extension
  const rawExtension = image.name.split(".").pop() ?? "jpg";
  const extension = rawExtension.toLowerCase().replace(/[^a-z0-9]/g, "");
  const safeExtension = ["jpg", "jpeg", "png", "gif", "webp"].includes(extension)
    ? extension
    : "jpg";

  const objectPath = `${user.id}/${pageId}/original.${safeExtension}`;

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
    // Clean up uploaded file on failure
    await supabase.storage.from("journal-pages").remove([objectPath]);
    return { error: insertError.message };
  }

  logDataChange("create", "page", {
    userId: user.id,
    resourceId: pageId,
    ip,
  });

  revalidatePath("/timeline");
  redirect(`/p/${pageId}`);
}
