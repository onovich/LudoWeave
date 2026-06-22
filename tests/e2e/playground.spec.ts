import { expect, test } from "@playwright/test";

test("renders v0.3 runtime UI states in the playground", async ({ page }) => {
  await page.goto("/");

  const prompt = page.locator('[data-ludoweave-node-id="root/key:prompt"]');
  await expect(prompt).toBeVisible();
  await expect(prompt).toHaveText("Press E");
  await expect(prompt).toHaveAttribute("data-ludoweave-node-type", "button");
  await expect(prompt).toHaveAttribute("data-ludoweave-theme-token", "runtime-ui.prompt.root");
  await expect(prompt).toHaveAttribute("type", "button");
  await expect(prompt).toHaveCSS("position", "absolute");

  const subtitle = page.locator('[data-ludoweave-node-id="root/key:subtitle"]');
  await expect(subtitle).toBeVisible();
  await expect(subtitle).toHaveText("The gate hums softly.");
  await expect(subtitle).toHaveAttribute("data-ludoweave-node-type", "text");
  await expect(subtitle).toHaveCSS("position", "absolute");

  const objective = page.locator('[data-ludoweave-node-id="root/key:objective.delivery"]');
  await expect(objective).toBeVisible();
  await expect(objective).toContainText("Deliver the cell");
  await expect(objective).toContainText("Bring the energy cell to the gate.");
  await expect(objective).toHaveAttribute("role", "button");

  const dialog = page.locator('[data-ludoweave-node-id="root/key:pause"]');
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute("role", "dialog");
  await expect(dialog).toHaveAttribute("aria-modal", "true");
  await expect(dialog).toHaveAccessibleName("Pause");

  const confirm = page.locator('[data-ludoweave-node-id="root/key:pause/key:confirm"]');
  await expect(confirm).toBeVisible();
  await expect(confirm).toHaveText("Confirm");

  const actionLog = page.locator("#action-log");
  await expect(actionLog).toContainText("Waiting for ActionRef");

  await prompt.click();
  await objective.click();
  await confirm.click();

  await expect(actionLog.locator("[data-action-type]")).toHaveCount(3);
  await expect(actionLog).toContainText("runtime.gameplay.interact");
  await expect(actionLog).toContainText("runtime.objective.inspect");
  await expect(actionLog).toContainText("runtime.pause.resume");

  const themeResolution = page.locator("#theme-resolution");
  await expect(themeResolution).toContainText("Theme resolution");
  await expect(themeResolution.locator('[data-theme-state="default"]')).toHaveCount(4);
  await expect(themeResolution.locator('[data-theme-state="high-contrast"]')).toHaveCount(4);
  await expect(
    themeResolution.locator(
      '[data-theme-state="default"][data-theme-token="runtime-ui.prompt.root"]',
    ),
  ).toContainText("#1f2937 / #fef3c7 / #fbbf24");
  await expect(
    themeResolution.locator(
      '[data-theme-state="high-contrast"][data-theme-token="runtime-ui.dialog.controls"]',
    ),
  ).toContainText("#ffffff / #000000 / #dc2626");
});
