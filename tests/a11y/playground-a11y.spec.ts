import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("has no blocking accessibility violations in the playground", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator('[data-ludoweave-node-id="root/key:prompt"]')).toBeVisible();
  await expect(
    page.locator('[data-ludoweave-node-id="root/key:objective.delivery"]'),
  ).toBeVisible();
  await expect(page.locator('[data-ludoweave-node-id="root/key:pause"]')).toHaveAttribute(
    "role",
    "dialog",
  );
  await expect(page.locator("#theme-resolution")).toContainText("Theme resolution");
  await expect(page.locator("#gate-demo-status")).toHaveAttribute("data-gate-demo-status", "pass");
  await expect(
    page.locator('[data-ludoweave-node-id="runtime.main/key:editable.gate-code"]'),
  ).toHaveAccessibleName("Gate access code");
  await expect(page.locator("#navigation-status")).toHaveAttribute(
    "data-navigation-status",
    "pass",
  );
  await expect(page.locator("#scroll-status")).toHaveAttribute("data-scroll-status", "pass");

  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "best-practice"])
    .analyze();
  const blockingViolations = results.violations.filter(
    (violation) => violation.impact === "critical" || violation.impact === "serious",
  );

  expect(blockingViolations).toEqual([]);
});
