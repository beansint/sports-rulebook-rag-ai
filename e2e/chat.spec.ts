import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  const email = process.env.E2E_USER_EMAIL;
  const password = process.env.E2E_USER_PASSWORD;
  if (!email || !password) test.skip();

  await page.goto("/login");
  await page.getByLabel(/email/i).fill(email!);
  await page.getByLabel(/password/i).fill(password!);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL(/\/chat/);
});

test("sport selector switches active sport", async ({ page }) => {
  await page.goto("/chat");
  const selector = page.getByTestId("sport-selector");
  await selector.getByRole("tab", { name: "NFL" }).click();
  await expect(selector.getByRole("tab", { name: "NFL" })).toHaveAttribute("aria-selected", "true");
  await expect(selector.getByRole("tab", { name: "NBA" })).toHaveAttribute("aria-selected", "false");
});

test("ask question shows answer and sources", async ({ page }) => {
  await page.goto("/chat");
  const textarea = page.getByLabel(/NBA rule question/i);
  await textarea.fill("What is a flagrant foul?");
  await page.keyboard.press("Enter");
  await expect(page.getByText(/flagrant/i)).toBeVisible({ timeout: 15000 });
  await expect(page.getByText(/Sources/i)).toBeVisible({ timeout: 15000 });
});

test("history sidebar shows past session after new session starts", async ({ page }) => {
  await page.goto("/chat");
  const textarea = page.getByLabel(/NBA rule question/i);
  await textarea.fill("What is a double dribble?");
  await page.keyboard.press("Enter");
  await expect(page.getByText(/double dribble/i)).toBeVisible({ timeout: 15000 });

  await page.reload();
  await expect(page.getByText(/double dribble/i)).toBeVisible({ timeout: 5000 });
});
