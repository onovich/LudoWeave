import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import ts from "typescript";

const ignoredDirectories = new Set([".git", "coverage", "dist", "node_modules", "temp"]);
const sourceExtensions = new Set([".ts", ".tsx", ".mts", ".cts", ".js", ".jsx", ".mjs", ".cjs"]);

const boundaryRules = [
  {
    name: "core has no renderer or host dependencies",
    root: "packages/core",
    forbidden: [
      { label: "React", pattern: /^(react|react-dom)(\/|$)/ },
      { label: "Three", pattern: /^three(\/|$)/ },
      { label: "Pixi", pattern: /^(pixi\.js|@pixi\/)/ },
      { label: "WebGPU", pattern: /webgpu|web-gpu/i },
      { label: "Sinan", pattern: /sinan/i },
      { label: "DOM renderer", pattern: /^@ludoweave\/renderer-dom(\/|$)/ },
    ],
  },
  {
    name: "components stay renderer-agnostic",
    root: "packages/components",
    forbidden: [
      { label: "renderer package", pattern: /^@ludoweave\/renderer-/ },
      { label: "React", pattern: /^(react|react-dom)(\/|$)/ },
      { label: "Sinan", pattern: /sinan/i },
    ],
  },
  {
    name: "headless renderer has no DOM renderer dependency",
    root: "packages/renderer-headless",
    forbidden: [
      { label: "DOM renderer", pattern: /^@ludoweave\/renderer-dom(\/|$)/ },
      { label: "React", pattern: /^(react|react-dom)(\/|$)/ },
      { label: "Sinan", pattern: /sinan/i },
    ],
  },
  {
    name: "DOM renderer stays React-free",
    root: "packages/renderer-dom",
    forbidden: [
      { label: "React", pattern: /^(react|react-dom)(\/|$)/ },
      { label: "Sinan", pattern: /sinan/i },
    ],
  },
  {
    name: "Canvas2D renderer spike stays isolated",
    root: "packages/renderer-canvas2d",
    forbidden: [
      { label: "DOM renderer", pattern: /^@ludoweave\/renderer-dom(\/|$)/ },
      { label: "React", pattern: /^(react|react-dom)(\/|$)/ },
      { label: "Sinan", pattern: /sinan/i },
    ],
  },
];

const violations = [];

for (const rule of boundaryRules) {
  if (!existsSync(rule.root)) {
    continue;
  }

  checkPackageDependencies(rule);
  for (const filePath of collectSourceFiles(rule.root)) {
    checkSourceFile(rule, filePath);
  }
}

if (violations.length > 0) {
  console.error("structure-check: import boundary violations found");
  for (const violation of violations) {
    console.error(`- ${violation}`);
  }
  process.exit(1);
}

console.log(`structure-check: ${boundaryRules.length} boundary rules passed.`);

function checkPackageDependencies(rule) {
  const packageJsonPath = join(rule.root, "package.json");
  if (!existsSync(packageJsonPath)) {
    return;
  }

  const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
  const dependencyGroups = [
    "dependencies",
    "devDependencies",
    "optionalDependencies",
    "peerDependencies",
  ];

  for (const group of dependencyGroups) {
    for (const dependencyName of Object.keys(packageJson[group] ?? {})) {
      checkSpecifier(rule, packageJsonPath, dependencyName, `${group} dependency`);
    }
  }
}

function checkSourceFile(rule, filePath) {
  const sourceText = readFileSync(filePath, "utf8");
  const sourceFile = ts.createSourceFile(filePath, sourceText, ts.ScriptTarget.Latest, true);

  visit(sourceFile);

  function visit(node) {
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
      const specifier = node.moduleSpecifier;
      if (specifier && ts.isStringLiteral(specifier)) {
        checkSpecifier(rule, filePath, specifier.text, "module import");
      }
    }

    if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
      const [firstArgument] = node.arguments;
      if (firstArgument && ts.isStringLiteral(firstArgument)) {
        checkSpecifier(rule, filePath, firstArgument.text, "dynamic import");
      }
    }

    ts.forEachChild(node, visit);
  }
}

function checkSpecifier(rule, filePath, specifier, context) {
  if (specifier.startsWith(".") || specifier.startsWith("node:")) {
    return;
  }

  const matchedRule = rule.forbidden.find(({ pattern }) => pattern.test(specifier));
  if (!matchedRule) {
    return;
  }

  violations.push(
    `${toDisplayPath(filePath)} imports ${matchedRule.label} via "${specifier}" (${context}; ${rule.name})`,
  );
}

function collectSourceFiles(root) {
  const files = [];

  walk(root);
  return files;

  function walk(directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const entryPath = join(directory, entry.name);
      if (entry.isDirectory()) {
        if (!ignoredDirectories.has(entry.name)) {
          walk(entryPath);
        }
        continue;
      }

      if (entry.isFile() && sourceExtensions.has(getExtension(entry.name))) {
        files.push(entryPath);
      }
    }
  }
}

function getExtension(fileName) {
  const index = fileName.lastIndexOf(".");
  return index >= 0 ? fileName.slice(index) : "";
}

function toDisplayPath(filePath) {
  return relative(process.cwd(), filePath).replaceAll("\\", "/");
}
