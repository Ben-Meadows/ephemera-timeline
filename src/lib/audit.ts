/**
 * Audit logging for security-relevant events
 * 
 * For production, replace console logging with:
 * - External logging service (Datadog, LogTail, etc.)
 * - Database table for audit trail
 * - SIEM integration
 */

export type AuditEventType =
  | "auth.signin.attempt"
  | "auth.signin.success"
  | "auth.signin.failure"
  | "auth.signup.attempt"
  | "auth.signup.success"
  | "auth.signup.failure"
  | "auth.signout"
  | "page.create"
  | "page.update"
  | "page.delete"
  | "marker.create"
  | "marker.update"
  | "marker.delete"
  | "timeline.create"
  | "timeline.update"
  | "timeline.delete"
  | "page_timelines.create"
  | "page_timelines.update"
  | "page_timelines.delete"
  | "validation.failure"
  | "ratelimit.exceeded"
  | "security.xss_attempt";

export type AuditEvent = {
  timestamp: string;
  event: AuditEventType;
  userId?: string | null;
  ip?: string;
  userAgent?: string;
  details?: Record<string, unknown>;
  success: boolean;
};

/**
 * Log an audit event
 */
export function logAuditEvent(
  event: AuditEventType,
  options: {
    userId?: string | null;
    ip?: string;
    userAgent?: string;
    details?: Record<string, unknown>;
    success?: boolean;
  } = {}
): void {
  const auditEntry: AuditEvent = {
    timestamp: new Date().toISOString(),
    event,
    userId: options.userId ?? null,
    ip: options.ip ?? "unknown",
    userAgent: options.userAgent,
    details: options.details,
    success: options.success ?? true,
  };

  // Format for structured logging
  const logMessage = JSON.stringify({
    level: options.success === false ? "warn" : "info",
    type: "audit",
    ...auditEntry,
  });

  // In development, use console
  // In production, this should go to external logging service
  if (process.env.NODE_ENV === "production") {
    // Production: structured JSON logging
    console.log(logMessage);
  } else {
    // Development: readable format
    const icon = options.success === false ? "⚠️" : "✓";
    console.log(
      `[AUDIT] ${icon} ${event} | user: ${options.userId ?? "anonymous"} | ip: ${options.ip ?? "unknown"}`
    );
    if (options.details) {
      console.log(`        Details:`, options.details);
    }
  }
}

/**
 * Log authentication attempt
 */
export function logAuthAttempt(
  action: "signin" | "signup",
  options: {
    email: string;
    ip?: string;
    userAgent?: string;
    success: boolean;
    error?: string;
  }
): void {
  const event: AuditEventType = options.success
    ? `auth.${action}.success`
    : `auth.${action}.failure`;

  logAuditEvent(event, {
    ip: options.ip,
    userAgent: options.userAgent,
    details: {
      email: maskEmail(options.email),
      ...(options.error && { error: options.error }),
    },
    success: options.success,
  });
}

/**
 * Log validation failure
 */
export function logValidationFailure(
  action: string,
  options: {
    userId?: string | null;
    ip?: string;
    field?: string;
    reason?: string;
    rawInput?: string;
  }
): void {
  logAuditEvent("validation.failure", {
    userId: options.userId,
    ip: options.ip,
    details: {
      action,
      field: options.field,
      reason: options.reason,
      // Only log first 100 chars of raw input for debugging
      rawInputPreview: options.rawInput?.substring(0, 100),
    },
    success: false,
  });
}

/**
 * Log rate limit exceeded
 */
export function logRateLimitExceeded(
  action: string,
  options: {
    identifier: string;
    ip?: string;
  }
): void {
  logAuditEvent("ratelimit.exceeded", {
    ip: options.ip,
    details: {
      action,
      identifier: options.identifier,
    },
    success: false,
  });
}

/**
 * Log potential XSS attempt
 */
export function logXSSAttempt(
  field: string,
  options: {
    userId?: string | null;
    ip?: string;
    rawInput: string;
  }
): void {
  logAuditEvent("security.xss_attempt", {
    userId: options.userId,
    ip: options.ip,
    details: {
      field,
      // Log sanitized preview only
      inputPreview: options.rawInput.substring(0, 200).replace(/</g, "&lt;"),
    },
    success: false,
  });
}

/**
 * Log data modification
 */
export function logDataChange(
  action: "create" | "update" | "delete",
  resource: "page" | "marker" | "timeline" | "page_timelines",
  options: {
    userId: string;
    resourceId: string;
    ip?: string;
    details?: Record<string, unknown>;
  }
): void {
  const event: AuditEventType = `${resource}.${action}`;

  logAuditEvent(event, {
    userId: options.userId,
    ip: options.ip,
    details: {
      resourceId: options.resourceId,
      ...options.details,
    },
    success: true,
  });
}

/**
 * Mask email for logging (privacy)
 * user@example.com -> u***@example.com
 */
function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return "***@***";
  
  const maskedLocal =
    local.length > 2
      ? local[0] + "***" + local[local.length - 1]
      : local[0] + "***";
  
  return `${maskedLocal}@${domain}`;
}
