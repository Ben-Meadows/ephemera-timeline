/**
 * Input sanitization utilities for XSS protection
 * All user input should be sanitized before storage
 */

// HTML tag pattern for stripping
const HTML_TAG_PATTERN = /<[^>]*>/g;

// Control characters (except newline, tab)
const CONTROL_CHAR_PATTERN = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;

// Multiple whitespace normalization
const MULTI_WHITESPACE_PATTERN = /\s+/g;

// Script injection patterns
const SCRIPT_PATTERNS = [
  /javascript:/gi,
  /vbscript:/gi,
  /data:text\/html/gi,
  /on\w+\s*=[^>]*/gi, // onclick=..., onerror=..., etc. (capture the value too)
];

/**
 * Sanitize general text input
 * - Strips HTML tags
 * - Removes control characters
 * - Normalizes whitespace
 * - Trims
 */
export function sanitizeText(input: string | null | undefined): string {
  if (!input) return "";

  let sanitized = String(input);

  // Strip HTML tags
  sanitized = sanitized.replace(HTML_TAG_PATTERN, "");

  // Remove control characters
  sanitized = sanitized.replace(CONTROL_CHAR_PATTERN, "");

  // Remove potential script injections
  for (const pattern of SCRIPT_PATTERNS) {
    sanitized = sanitized.replace(pattern, "");
  }

  // Normalize whitespace (but preserve single newlines for multi-line text)
  sanitized = sanitized
    .split("\n")
    .map((line) => line.replace(MULTI_WHITESPACE_PATTERN, " ").trim())
    .join("\n");

  // Trim and remove leading/trailing newlines
  sanitized = sanitized.trim();

  return sanitized;
}

/**
 * Sanitize single-line text (no newlines allowed)
 */
export function sanitizeSingleLine(input: string | null | undefined): string {
  if (!input) return "";

  let sanitized = sanitizeText(input);

  // Replace all newlines with spaces
  sanitized = sanitized.replace(/\n/g, " ");

  // Normalize whitespace again
  sanitized = sanitized.replace(MULTI_WHITESPACE_PATTERN, " ").trim();

  return sanitized;
}

/**
 * Sanitize email address
 * - Lowercase
 * - Trim whitespace
 * - Basic format validation
 */
export function sanitizeEmail(input: string | null | undefined): string {
  if (!input) return "";

  let sanitized = String(input).toLowerCase().trim();

  // Remove any whitespace
  sanitized = sanitized.replace(/\s/g, "");

  // Remove HTML tags (edge case but possible)
  sanitized = sanitized.replace(HTML_TAG_PATTERN, "");

  return sanitized;
}

/**
 * Sanitize username
 * - Lowercase
 * - Only allow alphanumeric and underscore
 * - Trim
 */
export function sanitizeUsername(input: string | null | undefined): string {
  if (!input) return "";

  let sanitized = String(input).toLowerCase().trim();

  // Remove any characters that aren't alphanumeric or underscore
  sanitized = sanitized.replace(/[^a-z0-9_]/g, "");

  return sanitized;
}

/**
 * Sanitize numeric coordinate (0-1 range)
 * Returns null if invalid
 */
export function sanitizeCoordinate(
  input: number | string | null | undefined
): number | null {
  if (input === null || input === undefined) return null;

  const num = typeof input === "string" ? parseFloat(input) : input;

  if (isNaN(num) || !isFinite(num)) return null;

  // Clamp to 0-1 range with precision limit
  const clamped = Math.max(0, Math.min(1, num));

  // Round to 6 decimal places (sufficient precision for UI)
  return Math.round(clamped * 1000000) / 1000000;
}

/**
 * Validate UUID format
 * Returns the UUID if valid, null otherwise
 */
export function sanitizeUUID(input: string | null | undefined): string | null {
  if (!input) return null;

  const sanitized = String(input).toLowerCase().trim();

  // UUID v4 pattern
  const UUID_PATTERN =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

  if (!UUID_PATTERN.test(sanitized)) return null;

  return sanitized;
}

/**
 * Check if input contains potential XSS patterns
 * Useful for logging/alerting
 */
export function containsXSSPatterns(input: string): boolean {
  if (!input) return false;

  // Check for HTML tags (use fresh regex to avoid global flag issues)
  if (/<[^>]*>/g.test(input)) return true;

  // Check for script patterns (use fresh regex instances)
  const patterns = [
    /javascript:/i,
    /vbscript:/i,
    /data:text\/html/i,
    /on\w+\s*=/i,
  ];
  
  for (const pattern of patterns) {
    if (pattern.test(input)) return true;
  }

  return false;
}
