import { z } from "zod";

/**
 * Reserved usernames that cannot be used
 * These match routes or system terms
 */
export const RESERVED_USERNAMES = [
  "admin",
  "administrator",
  "api",
  "auth",
  "login",
  "logout",
  "signin",
  "signout",
  "signup",
  "register",
  "new",
  "timeline",
  "settings",
  "profile",
  "user",
  "users",
  "account",
  "help",
  "support",
  "contact",
  "about",
  "terms",
  "privacy",
  "public",
  "private",
  "system",
  "root",
  "null",
  "undefined",
  "test",
  "demo",
  "example",
  "www",
  "mail",
  "email",
  "ftp",
  "localhost",
] as const;

/**
 * Stricter email regex
 * - Must have @ symbol
 * - Domain must have at least one dot
 * - No consecutive dots
 * - Limited special characters
 */
const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

/**
 * Username pattern
 * - Only lowercase letters, numbers, underscore
 * - Must start with a letter
 * - No consecutive underscores
 */
const USERNAME_REGEX = /^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$/;

/**
 * Date format validation (YYYY-MM-DD)
 */
const DATE_REGEX = /^\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])$/;

/**
 * Check for potentially dangerous content
 * Used as a refinement to reject obviously malicious input
 */
const containsDangerousContent = (value: string): boolean => {
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /vbscript:/i,
    /on\w+\s*=/i,
    /data:text\/html/i,
  ];
  return dangerousPatterns.some((pattern) => pattern.test(value));
};

/**
 * Safe text validator - rejects dangerous content
 */
const safeText = (maxLength: number) =>
  z
    .string()
    .max(maxLength, `Max ${maxLength} characters`)
    .refine((val) => !containsDangerousContent(val), {
      message: "Invalid content detected",
    });

/**
 * Auth schema with strict validation
 */
export const authSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .max(254, "Email too long")
    .regex(EMAIL_REGEX, "Valid email required")
    .transform((val) => val.toLowerCase().trim()),

  password: z
    .string()
    .min(6, "At least 6 characters")
    .max(128, "Password too long"),

  username: z
    .string()
    .min(3, "Min 3 characters")
    .max(30, "Max 30 characters")
    .regex(
      USERNAME_REGEX,
      "Must start with letter, only lowercase letters, numbers, underscores"
    )
    .refine(
      (val) =>
        !RESERVED_USERNAMES.includes(val.toLowerCase() as (typeof RESERVED_USERNAMES)[number]),
      { message: "This username is not available" }
    )
    .transform((val) => val.toLowerCase()),

  display_name: safeText(80).optional().nullable(),
});

export const signInSchema = authSchema.pick({
  email: true,
  password: true,
});

export const signUpSchema = authSchema;

/**
 * Page schema with strict validation
 */
export const pageSchema = z.object({
  title: safeText(120).optional(),

  page_date: z
    .string()
    .regex(DATE_REGEX, "Invalid date format (YYYY-MM-DD)")
    .refine(
      (val) => {
        const date = new Date(val);
        const now = new Date();
        // Allow dates up to 100 years in past, 1 year in future
        const minDate = new Date(now.getFullYear() - 100, 0, 1);
        const maxDate = new Date(now.getFullYear() + 1, 11, 31);
        return date >= minDate && date <= maxDate;
      },
      { message: "Date out of valid range" }
    ),

  caption: safeText(500).optional(),

  visibility: z.enum(["private", "public", "unlisted"]),
});

/**
 * Marker schema with strict coordinate validation
 */
export const markerSchema = z.object({
  page_id: z.string().uuid("Invalid page ID"),

  x: z
    .number()
    .min(0, "X must be >= 0")
    .max(1, "X must be <= 1")
    .refine((val) => isFinite(val), { message: "X must be a finite number" }),

  y: z
    .number()
    .min(0, "Y must be >= 0")
    .max(1, "Y must be <= 1")
    .refine((val) => isFinite(val), { message: "Y must be a finite number" }),

  label: safeText(120).refine((val) => val.trim().length >= 1, {
    message: "Label is required",
  }),

  note: safeText(500).optional(),

  category: safeText(80).optional(),

  source_date: z
    .string()
    .regex(DATE_REGEX, "Invalid date format")
    .optional()
    .or(z.literal("")),

  source_location: safeText(120).optional(),
});

/**
 * Marker update schema (partial, for PATCH operations)
 */
export const markerUpdateSchema = markerSchema.partial().omit({ page_id: true });

/**
 * Validate that a value is a valid UUID
 */
export function isValidUUID(value: string): boolean {
  const UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return UUID_REGEX.test(value);
}
