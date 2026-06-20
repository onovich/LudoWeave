import { expect, test } from "@playwright/test";

test("renders the runtime Prompt and Subtitle in the playground", async ({ page }) => {
  await page.goto("/");

  const prompt = page.locator('[data-ludoweave-node-id="root/key:prompt"]');
  await expect(prompt).toBeVisible();
  await expect(prompt).toHaveText("Press E");
  await expect(prompt).toHaveAttribute("data-ludoweave-node-type", "button");
  await expect(prompt).toHaveAttribute("type", "button");
  await expect(prompt).toHaveCSS("position", "absolute");

  const subtitle = page.locator('[data-ludoweave-node-id="root/key:subtitle"]');
  await expect(subtitle).toBeVisible();
  await expect(subtitle).toHaveText("The gate hums softly.");
  await expect(subtitle).toHaveAttribute("data-ludoweave-node-type", "text");
  await expect(subtitle).toHaveCSS("position", "absolute");
});
