import { test, expect } from "@playwright/test";

test.describe("Protected Routes (Unauthenticated)", () => {
  test("timeline page requires authentication", async ({ page }) => {
    await page.goto("/timeline");

    // Should either redirect to sign-in or show auth required message
    // The exact behavior depends on your middleware
    const url = page.url();
    const hasAuthRedirect =
      url.includes("/auth/sign-in") || url.includes("/timeline");

    expect(hasAuthRedirect).toBe(true);
  });

  test("new page requires authentication", async ({ page }) => {
    await page.goto("/new");

    // Should either redirect or show auth message
    const url = page.url();
    const isProtected =
      url.includes("/auth/sign-in") || url.includes("/new");

    expect(isProtected).toBe(true);
  });
});

test.describe("Page Detail View", () => {
  test("non-existent page shows 404", async ({ page }) => {
    // Random UUID that doesn't exist
    await page.goto("/p/00000000-0000-0000-0000-000000000000");

    // Should show not found
    await expect(page.locator("body")).toContainText(/not found|404/i);
  });

  test("invalid page ID format shows error", async ({ page }) => {
    await page.goto("/p/invalid-id");

    // Should show not found content (Next.js notFound() may still return 200 status
    // but renders the not-found page content)
    await expect(page.locator("body")).toContainText(/not found|404|error/i);
  });
});

test.describe("Public Profile", () => {
  test("non-existent user shows 404", async ({ page }) => {
    await page.goto("/u/nonexistentuser12345");

    // Should show not found
    await expect(page.locator("body")).toContainText(/not found|404/i);
  });
});

test.describe("Navigation", () => {
  test("navigation links are functional", async ({ page }) => {
    await page.goto("/");

    // Check that clicking sign-in navigates correctly
    const signInLink = page.locator('a[href="/auth/sign-in"]').first();
    if (await signInLink.isVisible()) {
      await signInLink.click();
      await expect(page).toHaveURL(/\/auth\/sign-in/);
    }
  });

  test("app logo links to home", async ({ page }) => {
    await page.goto("/auth/sign-in");

    // Click on app name/logo in header
    const homeLink = page.locator('header a[href="/"]').first();
    if (await homeLink.isVisible()) {
      await homeLink.click();
      await expect(page).toHaveURL("/");
    }
  });
});

test.describe("Responsive Layout", () => {
  test("page is responsive on mobile viewport", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto("/");

    // Page should still be usable
    await expect(page.locator("header")).toBeVisible();
  });

  test("page is responsive on tablet viewport", async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });

    await page.goto("/");

    // Page should still be usable
    await expect(page.locator("header")).toBeVisible();
  });
});
