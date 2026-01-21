import { test, expect } from "@playwright/test";

test.describe("Authentication Pages", () => {
  test("sign-in page loads correctly", async ({ page }) => {
    await page.goto("/auth/sign-in");

    // Check page title/heading (case insensitive)
    await expect(page.locator("h1")).toContainText(/sign in/i);

    // Check form fields exist
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();

    // Check link to sign-up (use .first() since there may be multiple links)
    await expect(page.locator('a[href="/auth/sign-up"]').first()).toBeVisible();
  });

  test("sign-up page loads correctly", async ({ page }) => {
    await page.goto("/auth/sign-up");

    // Check page title/heading (case insensitive)
    await expect(page.locator("h1")).toContainText(/create.*account/i);

    // Check form fields exist
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expect(page.locator('input[name="display_name"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();

    // Check link to sign-in (use .first() since there may be multiple links)
    await expect(page.locator('a[href="/auth/sign-in"]').first()).toBeVisible();
  });

  test("sign-in form validates required fields", async ({ page }) => {
    await page.goto("/auth/sign-in");

    // Try to submit empty form
    await page.click('button[type="submit"]');

    // HTML5 validation should prevent submission
    // Check that we're still on the sign-in page
    await expect(page).toHaveURL(/\/auth\/sign-in/);
  });

  test("sign-up form validates username pattern", async ({ page }) => {
    await page.goto("/auth/sign-up");

    // Fill with invalid username (has special char)
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="username"]', "user@name");
    await page.fill('input[name="password"]', "password123");

    await page.click('button[type="submit"]');

    // Should still be on sign-up page (validation failed)
    await expect(page).toHaveURL(/\/auth\/sign-up/);
  });

  test("can navigate between sign-in and sign-up", async ({ page }) => {
    // Start at sign-in
    await page.goto("/auth/sign-in");
    await expect(page.locator("h1")).toContainText(/sign in/i);

    // Click link to sign-up
    await page.click('a[href="/auth/sign-up"]');
    await expect(page).toHaveURL(/\/auth\/sign-up/);
    await expect(page.locator("h1")).toContainText(/create.*account/i);

    // Click link back to sign-in
    await page.click('a[href="/auth/sign-in"]');
    await expect(page).toHaveURL(/\/auth\/sign-in/);
  });
});

test.describe("Landing Page", () => {
  test("landing page loads with navigation", async ({ page }) => {
    await page.goto("/");

    // Check header/nav exists
    await expect(page.locator("header")).toBeVisible();

    // Check sign-in link exists
    await expect(page.locator('a[href="/auth/sign-in"]')).toBeVisible();
  });

  test("landing page shows app name", async ({ page }) => {
    await page.goto("/");

    // Check for app branding (use .first() since there may be multiple elements)
    await expect(page.locator("text=Ephemera").first()).toBeVisible();
  });
});
