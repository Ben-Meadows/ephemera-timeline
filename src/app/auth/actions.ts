"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { signInSchema, signUpSchema } from "@/lib/validators";
import {
  sanitizeEmail,
  sanitizeUsername,
  sanitizeSingleLine,
  containsXSSPatterns,
} from "@/lib/sanitize";
import {
  checkRateLimit,
  getClientIP,
  RATE_LIMITS,
  rateLimitError,
} from "@/lib/rate-limit";
import {
  logAuthAttempt,
  logValidationFailure,
  logRateLimitExceeded,
  logXSSAttempt,
} from "@/lib/audit";

type ActionResult = { error?: string } | void;

export async function signInAction(formData: FormData): Promise<ActionResult> {
  const headersList = await headers();
  const ip = getClientIP(headersList);
  const userAgent = headersList.get("user-agent") ?? undefined;

  // Rate limiting
  const rateLimitResult = checkRateLimit(ip, "auth.signin", RATE_LIMITS.auth);
  if (!rateLimitResult.success) {
    logRateLimitExceeded("auth.signin", { identifier: ip, ip });
    return rateLimitError(rateLimitResult.resetInSeconds);
  }

  // Sanitize inputs
  const rawEmail = formData.get("email");
  const email = sanitizeEmail(rawEmail as string);

  // Check for XSS in raw input
  if (rawEmail && containsXSSPatterns(String(rawEmail))) {
    logXSSAttempt("email", { ip, rawInput: String(rawEmail) });
  }

  // Validate
  const parsed = signInSchema.safeParse({
    email,
    password: formData.get("password"),
  });

  if (!parsed.success) {
    logValidationFailure("auth.signin", {
      ip,
      field: parsed.error.issues[0]?.path.join("."),
      reason: parsed.error.issues[0]?.message,
    });
    logAuthAttempt("signin", { email, ip, userAgent, success: false, error: "validation" });
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    logAuthAttempt("signin", { email, ip, userAgent, success: false, error: error.message });
    return { error: error.message };
  }

  logAuthAttempt("signin", { email, ip, userAgent, success: true });
  revalidatePath("/timeline");
  redirect("/timeline");
}

export async function signUpAction(formData: FormData): Promise<ActionResult> {
  const headersList = await headers();
  const ip = getClientIP(headersList);
  const userAgent = headersList.get("user-agent") ?? undefined;

  // Rate limiting
  const rateLimitResult = checkRateLimit(ip, "auth.signup", RATE_LIMITS.auth);
  if (!rateLimitResult.success) {
    logRateLimitExceeded("auth.signup", { identifier: ip, ip });
    return rateLimitError(rateLimitResult.resetInSeconds);
  }

  // Sanitize inputs
  const rawEmail = formData.get("email");
  const rawUsername = formData.get("username");
  const rawDisplayName = formData.get("display_name");

  const email = sanitizeEmail(rawEmail as string);
  const username = sanitizeUsername(rawUsername as string);
  const displayName = rawDisplayName
    ? sanitizeSingleLine(rawDisplayName as string)
    : undefined;

  // Check for XSS attempts
  if (rawEmail && containsXSSPatterns(String(rawEmail))) {
    logXSSAttempt("email", { ip, rawInput: String(rawEmail) });
  }
  if (rawUsername && containsXSSPatterns(String(rawUsername))) {
    logXSSAttempt("username", { ip, rawInput: String(rawUsername) });
  }
  if (rawDisplayName && containsXSSPatterns(String(rawDisplayName))) {
    logXSSAttempt("display_name", { ip, rawInput: String(rawDisplayName) });
  }

  // Validate
  const parsed = signUpSchema.safeParse({
    email,
    password: formData.get("password"),
    username,
    display_name: displayName || undefined,
  });

  if (!parsed.success) {
    logValidationFailure("auth.signup", {
      ip,
      field: parsed.error.issues[0]?.path.join("."),
      reason: parsed.error.issues[0]?.message,
    });
    logAuthAttempt("signup", { email, ip, userAgent, success: false, error: "validation" });
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        username: parsed.data.username,
        display_name: parsed.data.display_name,
      },
    },
  });

  if (error) {
    logAuthAttempt("signup", { email, ip, userAgent, success: false, error: error.message });
    return { error: error.message };
  }

  logAuthAttempt("signup", { email, ip, userAgent, success: true });
  revalidatePath("/timeline");
  redirect("/timeline");
}
