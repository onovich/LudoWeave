import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const workspaceRoots = ["packages", "apps", "examples", "tooling"];

const configPaths = workspaceRoots.flatMap((root) => {
  if (!existsSync(root)) {
    return [];
  }

  return readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => join(root, entry.name, "api-extractor.json"))
    .filter((configPath) => existsSync(configPath));
});

if (configPaths.length === 0) {
  console.log("api-check: no API Extractor package configs yet.");
  process.exit(0);
}

for (const configPath of configPaths) {
  const result = spawnSync(
    "pnpm",
    ["exec", "api-extractor", "run", "--local", "--config", configPath],
    {
      shell: true,
      stdio: "inherit",
    },
  );

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
