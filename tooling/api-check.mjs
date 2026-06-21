import { existsSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

const workspaceRoots = ["packages", "apps", "examples", "tooling"];

const configPaths = workspaceRoots
  .flatMap((root) => {
    if (!existsSync(root)) {
      return [];
    }

    return readdirSync(root, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .sort((left, right) => left.name.localeCompare(right.name))
      .map((entry) => join(root, entry.name, "api-extractor.json"))
      .filter((configPath) => existsSync(configPath));
  })
  .sort();

if (configPaths.length === 0) {
  console.log("api-check: no API Extractor package configs yet.");
  process.exit(0);
}

for (const configPath of configPaths) {
  const packageRoot = dirname(configPath);
  const tsconfigPath = join(packageRoot, "tsconfig.json");

  if (existsSync(tsconfigPath)) {
    runTool("tsc", ["-p", tsconfigPath]);
  }

  runTool("api-extractor", ["run", "--local", "--config", configPath]);
}

function runTool(toolName, args) {
  const toolPaths = {
    "api-extractor": join("node_modules", "@microsoft", "api-extractor", "bin", "api-extractor"),
    tsc: join("node_modules", "typescript", "bin", "tsc"),
  };
  const toolPath = toolPaths[toolName];
  const result = spawnSync(process.execPath, [toolPath, ...args], {
    stdio: "inherit",
  });

  if (result.error) {
    console.error(`api-check: failed to run ${toolName}: ${result.error.message}`);
    process.exit(1);
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
