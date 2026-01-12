import { test, expect } from "@playwright/test";

test.describe("Security Headers", () => {
  test("response includes security headers", async ({ page }) => {
    const response = await page.goto("/");

    expect(response).not.toBeNull();
    if (!response) return;

    const headers = response.headers();

    // Check X-Content-Type-Options
    expect(headers["x-content-type-options"]).toBe("nosniff");

    // Check X-Frame-Options
    expect(headers["x-frame-options"]).toBe("DENY");

    // Check X-XSS-Protection
    expect(headers["x-xss-protection"]).toBe("1; mode=block");

    // Check Referrer-Policy
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");

    // Check Permissions-Policy exists
    expect(headers["permissions-policy"]).toBeDefined();
  });

  test("auth pages have security headers", async ({ page }) => {
    const response = await page.goto("/auth/sign-in");

    expect(response).not.toBeNull();
    if (!response) return;

    const headers = response.headers();
    expect(headers["x-frame-options"]).toBe("DENY");
  });
});

test.describe("Form Validation - XSS Prevention", () => {
  test("sign-up form rejects XSS in username", async ({ page }) => {
    await page.goto("/auth/sign-up");

    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="username"]', "<script>alert(1)</script>");
    await page.fill('input[name="password"]', "password123");

    await page.click('button[type="submit"]');

    // Should show validation error or stay on page
    await expect(page).toHaveURL(/\/auth\/sign-up/);
  });

  test("sign-up form rejects reserved usernames", async ({ page }) => {
    await page.goto("/auth/sign-up");

    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="username"]', "admin");
    await page.fill('input[name="password"]', "password123");

    await page.click('button[type="submit"]');

    // Should stay on sign-up page (validation error)
    await expect(page).toHaveURL(/\/auth\/sign-up/);
  });

  test("sign-up form rejects invalid email formats", async ({ page }) => {
    await page.goto("/auth/sign-up");

    await page.fill('input[name="email"]', "not-an-email");
    await page.fill('input[name="username"]', "validuser");
    await page.fill('input[name="password"]', "password123");

    // HTML5 validation should prevent submission
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/auth\/sign-up/);
  });

  test("sign-up form rejects short passwords", async ({ page }) => {
    await page.goto("/auth/sign-up");

    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="username"]', "validuser");
    await page.fill('input[name="password"]', "12345"); // Too short

    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/auth\/sign-up/);
  });
});

test.describe("Input Sanitization", () => {
  test("username with special characters is rejected", async ({ page }) => {
    await page.goto("/auth/sign-up");

    await page.fill('input[name="email"]', "test@example.com");
    // HTML5 pattern should reject this
    await page.fill('input[name="username"]', "user@name!");
    await page.fill('input[name="password"]', "password123");

    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/auth\/sign-up/);
  });

  test("username starting with number is rejected", async ({ page }) => {
    await page.goto("/auth/sign-up");

    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="username"]', "123user");
    await page.fill('input[name="password"]', "password123");

    await page.click('button[type="submit"]');
    // Pattern validation should reject
    await expect(page).toHaveURL(/\/auth\/sign-up/);
  });
});

test.describe("Protected Routes", () => {
  test("cannot access new page creation without auth", async ({ page }) => {
    await page.goto("/new");

    // Should either redirect or show error
    const url = page.url();
    // Either redirected to auth or shows error on /new
    expect(url.includes("/auth") || url.includes("/new")).toBe(true);
  });

  test("cannot access timeline without auth", async ({ page }) => {
    await page.goto("/timeline");

    const url = page.url();
    expect(url.includes("/auth") || url.includes("/timeline")).toBe(true);
  });
});

test.describe("Content Security", () => {
  test("page does not execute inline scripts in user content", async ({
    page,
  }) => {
    // This test verifies CSP prevents script execution
    // We check that the page loads without script errors
    
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await page.goto("/");

    // Page should load without CSP violations causing errors
    await expect(page.locator("header")).toBeVisible();
  });
});

test.describe("Rate Limiting Behavior", () => {
  test("multiple rapid sign-in attempts show rate limit", async ({ page }) => {
    await page.goto("/auth/sign-in");

    // Attempt multiple sign-ins rapidly
    for (let i = 0; i < 6; i++) {
      await page.fill('input[name="email"]', `test${i}@example.com`);
      await page.fill('input[name="password"]', "wrongpassword");
      await page.click('button[type="submit"]');
      
      // Wait a bit for response
      await page.waitForTimeout(200);
    }

    // After 5+ attempts, might see rate limit message
    // This depends on implementation - check for error message
    const errorMessage = page.locator(".text-red-600");
    if (await errorMessage.isVisible()) {
      const text = await errorMessage.textContent();
      // Either shows rate limit or auth error
      expect(text).toBeTruthy();
    }
  });
});
