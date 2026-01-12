import { describe, it, expect, beforeEach } from "vitest";
import {
  sanitizeText,
  sanitizeSingleLine,
  sanitizeEmail,
  sanitizeUsername,
  sanitizeCoordinate,
  sanitizeUUID,
  containsXSSPatterns,
} from "@/lib/sanitize";
import {
  checkRateLimit,
  clearAllRateLimits,
  RATE_LIMITS,
} from "@/lib/rate-limit";
import { signUpSchema, RESERVED_USERNAMES } from "@/lib/validators";

describe("Sanitization Functions", () => {
  describe("sanitizeText", () => {
    it("removes HTML tags", () => {
      expect(sanitizeText("<script>alert('xss')</script>")).toBe("alert('xss')");
      expect(sanitizeText("<b>bold</b>")).toBe("bold");
      expect(sanitizeText("<img src=x onerror=alert(1)>")).toBe("");
    });

    it("removes control characters", () => {
      expect(sanitizeText("hello\x00world")).toBe("helloworld");
      expect(sanitizeText("test\x1F")).toBe("test");
    });

    it("removes javascript: protocol", () => {
      expect(sanitizeText("javascript:alert(1)")).toBe("alert(1)");
    });

    it("removes event handlers", () => {
      expect(sanitizeText("onclick=alert(1)")).toBe("");
      expect(sanitizeText("onerror=malicious()")).toBe("");
      expect(sanitizeText("test onclick=bad")).toBe("test");
    });

    it("preserves normal text", () => {
      expect(sanitizeText("Hello, World!")).toBe("Hello, World!");
      expect(sanitizeText("Line 1\nLine 2")).toBe("Line 1\nLine 2");
    });

    it("normalizes whitespace", () => {
      expect(sanitizeText("  too   many   spaces  ")).toBe("too many spaces");
    });

    it("handles null/undefined", () => {
      expect(sanitizeText(null)).toBe("");
      expect(sanitizeText(undefined)).toBe("");
    });
  });

  describe("sanitizeSingleLine", () => {
    it("removes newlines", () => {
      expect(sanitizeSingleLine("line1\nline2")).toBe("line1 line2");
      expect(sanitizeSingleLine("line1\r\nline2")).toBe("line1 line2");
    });

    it("removes HTML and scripts", () => {
      expect(sanitizeSingleLine("<script>bad</script>")).toBe("bad");
    });
  });

  describe("sanitizeEmail", () => {
    it("lowercases email", () => {
      expect(sanitizeEmail("Test@Example.COM")).toBe("test@example.com");
    });

    it("trims whitespace", () => {
      expect(sanitizeEmail("  test@example.com  ")).toBe("test@example.com");
    });

    it("removes internal whitespace", () => {
      expect(sanitizeEmail("test @example.com")).toBe("test@example.com");
    });

    it("handles null/undefined", () => {
      expect(sanitizeEmail(null)).toBe("");
      expect(sanitizeEmail(undefined)).toBe("");
    });
  });

  describe("sanitizeUsername", () => {
    it("lowercases username", () => {
      expect(sanitizeUsername("TestUser")).toBe("testuser");
    });

    it("removes special characters", () => {
      expect(sanitizeUsername("user@name")).toBe("username");
      expect(sanitizeUsername("user-name")).toBe("username");
      expect(sanitizeUsername("user.name")).toBe("username");
    });

    it("keeps underscores", () => {
      expect(sanitizeUsername("user_name")).toBe("user_name");
    });

    it("removes HTML", () => {
      expect(sanitizeUsername("<script>user")).toBe("scriptuser");
    });
  });

  describe("sanitizeCoordinate", () => {
    it("returns valid coordinates", () => {
      expect(sanitizeCoordinate(0.5)).toBe(0.5);
      expect(sanitizeCoordinate(0)).toBe(0);
      expect(sanitizeCoordinate(1)).toBe(1);
    });

    it("clamps out of range values", () => {
      expect(sanitizeCoordinate(-0.5)).toBe(0);
      expect(sanitizeCoordinate(1.5)).toBe(1);
    });

    it("handles string input", () => {
      expect(sanitizeCoordinate("0.5")).toBe(0.5);
    });

    it("returns null for invalid input", () => {
      expect(sanitizeCoordinate("not a number")).toBe(null);
      expect(sanitizeCoordinate(NaN)).toBe(null);
      expect(sanitizeCoordinate(Infinity)).toBe(null);
    });

    it("rounds to precision limit", () => {
      expect(sanitizeCoordinate(0.123456789)).toBe(0.123457);
    });
  });

  describe("sanitizeUUID", () => {
    it("accepts valid UUIDs", () => {
      expect(sanitizeUUID("123e4567-e89b-12d3-a456-426614174000")).toBe(
        "123e4567-e89b-12d3-a456-426614174000"
      );
    });

    it("lowercases UUIDs", () => {
      expect(sanitizeUUID("123E4567-E89B-12D3-A456-426614174000")).toBe(
        "123e4567-e89b-12d3-a456-426614174000"
      );
    });

    it("rejects invalid UUIDs", () => {
      expect(sanitizeUUID("not-a-uuid")).toBe(null);
      expect(sanitizeUUID("123e4567-e89b-12d3-a456")).toBe(null);
      expect(sanitizeUUID("")).toBe(null);
    });
  });

  describe("containsXSSPatterns", () => {
    it("detects script tags", () => {
      expect(containsXSSPatterns("<script>alert(1)</script>")).toBe(true);
      expect(containsXSSPatterns("<SCRIPT>")).toBe(true);
    });

    it("detects javascript protocol", () => {
      expect(containsXSSPatterns("javascript:alert(1)")).toBe(true);
    });

    it("detects event handlers", () => {
      expect(containsXSSPatterns("onclick=")).toBe(true);
      expect(containsXSSPatterns("onerror=")).toBe(true);
    });

    it("returns false for safe content", () => {
      expect(containsXSSPatterns("Hello, World!")).toBe(false);
      expect(containsXSSPatterns("script is a word")).toBe(false);
    });
  });
});

describe("Rate Limiting", () => {
  beforeEach(() => {
    clearAllRateLimits();
  });

  it("allows requests within limit", () => {
    const result = checkRateLimit("test-ip", "test-action", { limit: 5, windowSeconds: 60 });
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it("blocks requests exceeding limit", () => {
    const config = { limit: 3, windowSeconds: 60 };
    
    // Use up the limit
    checkRateLimit("test-ip", "block-test", config);
    checkRateLimit("test-ip", "block-test", config);
    checkRateLimit("test-ip", "block-test", config);
    
    // This should be blocked
    const result = checkRateLimit("test-ip", "block-test", config);
    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("tracks different actions separately", () => {
    const config = { limit: 2, windowSeconds: 60 };
    
    checkRateLimit("ip", "action1", config);
    checkRateLimit("ip", "action1", config);
    
    // action2 should still work
    const result = checkRateLimit("ip", "action2", config);
    expect(result.success).toBe(true);
  });

  it("tracks different IPs separately", () => {
    const config = { limit: 2, windowSeconds: 60 };
    
    checkRateLimit("ip1", "action", config);
    checkRateLimit("ip1", "action", config);
    
    // ip2 should still work
    const result = checkRateLimit("ip2", "action", config);
    expect(result.success).toBe(true);
  });

  it("has correct preset limits", () => {
    expect(RATE_LIMITS.auth.limit).toBe(5);
    expect(RATE_LIMITS.create.limit).toBe(10);
    expect(RATE_LIMITS.modify.limit).toBe(20);
    expect(RATE_LIMITS.read.limit).toBe(100);
  });
});

describe("Validators - Security", () => {
  describe("Reserved Usernames", () => {
    it("rejects reserved usernames", () => {
      const reservedToTest = ["admin", "api", "auth", "new", "timeline", "settings"];
      
      reservedToTest.forEach((username) => {
        const result = signUpSchema.safeParse({
          email: "test@example.com",
          password: "password123",
          username,
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues.some(i => i.message === "This username is not available")).toBe(true);
        }
      });
    });

    it("allows non-reserved usernames", () => {
      const result = signUpSchema.safeParse({
        email: "test@example.com",
        password: "password123",
        username: "johndoe",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("Username Pattern", () => {
    it("requires username to start with letter", () => {
      const result = signUpSchema.safeParse({
        email: "test@example.com",
        password: "password123",
        username: "123user",
      });
      expect(result.success).toBe(false);
    });

    it("rejects consecutive underscores", () => {
      const result = signUpSchema.safeParse({
        email: "test@example.com",
        password: "password123",
        username: "user__name",
      });
      expect(result.success).toBe(false);
    });

    it("accepts valid username patterns", () => {
      const validUsernames = ["john", "john_doe", "john123", "john_doe_123"];
      
      validUsernames.forEach((username) => {
        const result = signUpSchema.safeParse({
          email: "test@example.com",
          password: "password123",
          username,
        });
        expect(result.success).toBe(true);
      });
    });
  });

  describe("XSS Rejection", () => {
    it("rejects XSS in display_name", () => {
      const result = signUpSchema.safeParse({
        email: "test@example.com",
        password: "password123",
        username: "validuser",
        display_name: "<script>alert('xss')</script>",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("Reserved Usernames List", () => {
    it("contains expected reserved words", () => {
      expect(RESERVED_USERNAMES).toContain("admin");
      expect(RESERVED_USERNAMES).toContain("api");
      expect(RESERVED_USERNAMES).toContain("auth");
      expect(RESERVED_USERNAMES).toContain("new");
      expect(RESERVED_USERNAMES).toContain("timeline");
    });
  });
});

describe("SQL Injection Patterns", () => {
  it("sanitizeText handles SQL injection attempts", () => {
    const sqlInjections = [
      "'; DROP TABLE users; --",
      "1 OR 1=1",
      "UNION SELECT * FROM passwords",
    ];

    sqlInjections.forEach((injection) => {
      // Should not throw, just sanitize
      const result = sanitizeText(injection);
      expect(typeof result).toBe("string");
    });
  });

  it("sanitizeUsername removes SQL special chars", () => {
    expect(sanitizeUsername("user'; DROP--")).toBe("userdrop");
    expect(sanitizeUsername("admin'--")).toBe("admin");
  });
});
