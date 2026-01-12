import { describe, it, expect } from "vitest";
import {
  signInSchema,
  signUpSchema,
  pageSchema,
  markerSchema,
} from "@/lib/validators";

describe("signInSchema", () => {
  it("validates correct credentials", () => {
    const result = signInSchema.safeParse({
      email: "test@example.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = signInSchema.safeParse({
      email: "not-an-email",
      password: "password123",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Valid email required");
    }
  });

  it("rejects short password", () => {
    const result = signInSchema.safeParse({
      email: "test@example.com",
      password: "12345",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("At least 6 characters");
    }
  });

  it("rejects empty email", () => {
    const result = signInSchema.safeParse({
      email: "",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });
});

describe("signUpSchema", () => {
  it("validates correct sign-up data", () => {
    const result = signUpSchema.safeParse({
      email: "newuser@example.com",
      password: "securepass",
      username: "newuser",
      display_name: "New User",
    });
    expect(result.success).toBe(true);
  });

  it("validates without display_name (optional)", () => {
    const result = signUpSchema.safeParse({
      email: "newuser@example.com",
      password: "securepass",
      username: "newuser",
    });
    expect(result.success).toBe(true);
  });

  it("accepts null display_name", () => {
    const result = signUpSchema.safeParse({
      email: "newuser@example.com",
      password: "securepass",
      username: "newuser",
      display_name: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects short username", () => {
    const result = signUpSchema.safeParse({
      email: "test@example.com",
      password: "password123",
      username: "ab",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Min 3 characters");
    }
  });

  it("rejects username with special characters", () => {
    const result = signUpSchema.safeParse({
      email: "test@example.com",
      password: "password123",
      username: "user@name",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain(
        "lowercase letters, numbers, underscores"
      );
    }
  });

  it("accepts username with underscores", () => {
    const result = signUpSchema.safeParse({
      email: "test@example.com",
      password: "password123",
      username: "user_name_123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects too long username", () => {
    const result = signUpSchema.safeParse({
      email: "test@example.com",
      password: "password123",
      username: "a".repeat(31),
    });
    expect(result.success).toBe(false);
  });
});

describe("pageSchema", () => {
  it("validates correct page data", () => {
    const result = pageSchema.safeParse({
      title: "My Journal Page",
      page_date: "2026-01-12",
      caption: "A lovely day",
      visibility: "private",
    });
    expect(result.success).toBe(true);
  });

  it("validates minimal page data", () => {
    const result = pageSchema.safeParse({
      page_date: "2026-01-12",
      visibility: "public",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid visibility", () => {
    const result = pageSchema.safeParse({
      page_date: "2026-01-12",
      visibility: "secret",
    });
    expect(result.success).toBe(false);
  });

  it("accepts all visibility options", () => {
    const options = ["private", "public", "unlisted"] as const;
    options.forEach((visibility) => {
      const result = pageSchema.safeParse({
        page_date: "2026-01-12",
        visibility,
      });
      expect(result.success).toBe(true);
    });
  });

  it("rejects too long title", () => {
    const result = pageSchema.safeParse({
      title: "a".repeat(121),
      page_date: "2026-01-12",
      visibility: "private",
    });
    expect(result.success).toBe(false);
  });

  it("rejects too long caption", () => {
    const result = pageSchema.safeParse({
      page_date: "2026-01-12",
      visibility: "private",
      caption: "a".repeat(501),
    });
    expect(result.success).toBe(false);
  });
});

describe("markerSchema", () => {
  const validUUID = "123e4567-e89b-12d3-a456-426614174000";

  it("validates correct marker data", () => {
    const result = markerSchema.safeParse({
      page_id: validUUID,
      x: 0.5,
      y: 0.5,
      label: "Ticket stub",
      note: "From the concert",
      category: "tickets",
    });
    expect(result.success).toBe(true);
  });

  it("validates marker at origin (0,0)", () => {
    const result = markerSchema.safeParse({
      page_id: validUUID,
      x: 0,
      y: 0,
      label: "Corner item",
    });
    expect(result.success).toBe(true);
  });

  it("validates marker at max (1,1)", () => {
    const result = markerSchema.safeParse({
      page_id: validUUID,
      x: 1,
      y: 1,
      label: "Corner item",
    });
    expect(result.success).toBe(true);
  });

  it("rejects x coordinate below 0", () => {
    const result = markerSchema.safeParse({
      page_id: validUUID,
      x: -0.1,
      y: 0.5,
      label: "Test",
    });
    expect(result.success).toBe(false);
  });

  it("rejects x coordinate above 1", () => {
    const result = markerSchema.safeParse({
      page_id: validUUID,
      x: 1.1,
      y: 0.5,
      label: "Test",
    });
    expect(result.success).toBe(false);
  });

  it("rejects y coordinate below 0", () => {
    const result = markerSchema.safeParse({
      page_id: validUUID,
      x: 0.5,
      y: -0.1,
      label: "Test",
    });
    expect(result.success).toBe(false);
  });

  it("rejects y coordinate above 1", () => {
    const result = markerSchema.safeParse({
      page_id: validUUID,
      x: 0.5,
      y: 1.1,
      label: "Test",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty label", () => {
    const result = markerSchema.safeParse({
      page_id: validUUID,
      x: 0.5,
      y: 0.5,
      label: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid UUID for page_id", () => {
    const result = markerSchema.safeParse({
      page_id: "not-a-uuid",
      x: 0.5,
      y: 0.5,
      label: "Test",
    });
    expect(result.success).toBe(false);
  });
});
