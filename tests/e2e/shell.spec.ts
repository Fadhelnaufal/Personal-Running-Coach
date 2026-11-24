import { expect, test } from "@playwright/test";

const PROTECTED_ROUTES = [
  "/dashboard",
  "/calendar",
  "/activities",
  "/analytics",
  "/recovery",
  "/coach",
  "/settings",
  "/onboarding",
];

test.describe("Milestone 2 auth guard, auth pages, and design system", () => {
  test("health endpoint responds ok without secrets", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.ok()).toBe(true);
    const body = await res.json();
    expect(body.status).toBe("ok");
  });

  test("unauthenticated visitors are redirected from protected routes to /login", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => consoleErrors.push(err.message));

    for (const route of PROTECTED_ROUTES) {
      await page.goto(route);
      await expect(page).toHaveURL(new RegExp(`/login\\?next=${encodeURIComponent(route).replace("/", "\\/")}`));
      await expect(page.getByRole("heading", { name: "Sign In to Workspace" })).toBeVisible();
    }

    expect(consoleErrors).toEqual([]);
  });

  test("login and signup pages are responsive, accessible, and keyboard operable", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });

    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Sign In to Workspace" })).toBeVisible();
    await expect(page.getByLabel("Email address")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();

    const submitBox = await page
      .getByRole("button", { name: "Sign In to Workspace" })
      .boundingBox();
    expect(submitBox?.height ?? 0).toBeGreaterThanOrEqual(44);

    // Keyboard Tab moves focus onto interactive elements
    await page.keyboard.press("Tab");
    const activeTag = await page.evaluate(() => document.activeElement?.tagName ?? "");
    expect(["A", "BUTTON", "INPUT"]).toContain(activeTag);

    const loginOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(loginOverflow).toBe(false);

    // Navigate to signup
    await page.getByRole("link", { name: "Create an account" }).click();
    await expect(page).toHaveURL(/\/signup$/);
    await expect(page.getByRole("heading", { name: "Create Runner Account" })).toBeVisible();

    const signupOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(signupOverflow).toBe(false);

    // Navigate back to login
    await page.getByRole("link", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/login$/);

    expect(consoleErrors).toEqual([]);
  });

  test("dev design-system route hosts interactive component verification", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });

    await page.goto("/dev/design-system");
    await expect(
      page.getByRole("heading", { name: "Design System & State Verification" })
    ).toBeVisible();

    // Dialog opens & closes via Escape
    await page.getByRole("button", { name: "System Info" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toBeHidden();

    // Tabs switch panel states
    await page.getByRole("tab", { name: "Loading" }).click();
    await expect(page.getByRole("status", { name: "Loading training summary" })).toBeVisible();
    await page.getByRole("tab", { name: "Error" }).click();
    await expect(
      page.getByRole("tabpanel", { name: "Error" }).getByRole("alert")
    ).toContainText("Unable to reach external provider");
    await page.getByRole("button", { name: "Reset State" }).click();
    await expect(page.getByText("No synced activities yet")).toBeVisible();

    // Select updates unit label
    await page.getByRole("combobox", { name: "Preview display unit" }).click();
    await page.getByRole("option", { name: "Miles (mi)" }).click();
    await expect(page.getByRole("combobox", { name: "Preview display unit" })).toContainText(
      "Miles (mi)"
    );

    const hasOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(hasOverflow).toBe(false);
    expect(consoleErrors).toEqual([]);
  });
});
