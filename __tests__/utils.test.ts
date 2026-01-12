import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn (class name utility)", () => {
  it("merges multiple class names", () => {
    const result = cn("px-4", "py-2");
    expect(result).toBe("px-4 py-2");
  });

  it("handles conditional classes", () => {
    const isActive = true;
    const result = cn("base-class", isActive && "active-class");
    expect(result).toBe("base-class active-class");
  });

  it("filters out falsy values", () => {
    const result = cn("base", false, null, undefined, "end");
    expect(result).toBe("base end");
  });

  it("merges conflicting Tailwind classes (last wins)", () => {
    const result = cn("px-2", "px-4");
    expect(result).toBe("px-4");
  });

  it("merges conflicting background colors", () => {
    const result = cn("bg-red-500", "bg-blue-500");
    expect(result).toBe("bg-blue-500");
  });

  it("handles array of classes", () => {
    const result = cn(["px-4", "py-2"]);
    expect(result).toBe("px-4 py-2");
  });

  it("handles object syntax for conditional classes", () => {
    const result = cn({
      "base-class": true,
      "inactive-class": false,
      "active-class": true,
    });
    expect(result).toBe("base-class active-class");
  });

  it("returns empty string for no input", () => {
    const result = cn();
    expect(result).toBe("");
  });

  it("handles complex Tailwind class merging", () => {
    const result = cn(
      "text-sm font-medium",
      "hover:bg-slate-100",
      "text-lg" // Should override text-sm
    );
    expect(result).toContain("text-lg");
    expect(result).toContain("font-medium");
    expect(result).toContain("hover:bg-slate-100");
    expect(result).not.toContain("text-sm");
  });
});
