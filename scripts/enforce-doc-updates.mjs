#!/usr/bin/env node

import { execSync } from "node:child_process";

const DOC_PATTERNS = [
  /^CONTRIBUTING\.md$/,
  /^docs\/ARCHITECTURE\.md$/,
  /^docs\/implementation-plan\.md$/,
  /^apps\/web\/src\/(?:app|components|config|features|services|shared)\/(?:.*\/)?(?:README|CONTEXT)\.md$/,
];

const IGNORE_PATTERNS = [
  /^\.env(\..+)?$/,
  /^apps\/web\/\.env(\..+)?$/,
  /^\.gitignore$/,
  /^apps\/web\/\.gitignore$/,
];

function run(command) {
  return execSync(command, {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  }).trim();
}

function getChangedFiles() {
  const output = run("git status --porcelain");
  if (!output) {
    return [];
  }

  return output
    .split("\n")
    .map((line) => line.slice(3).trim())
    .filter(Boolean)
    .map((path) => {
      if (path.includes(" -> ")) {
        return path.split(" -> ").at(-1)?.trim() ?? path;
      }
      return path;
    });
}

function matchesAny(path, patterns) {
  return patterns.some((pattern) => pattern.test(path));
}

if (process.env.SKIP_DOC_GUARD === "1") {
  process.exit(0);
}

const changedFiles = getChangedFiles();
if (changedFiles.length === 0) {
  process.exit(0);
}

const relevantChangedFiles = changedFiles.filter((path) => !matchesAny(path, IGNORE_PATTERNS));
if (relevantChangedFiles.length === 0) {
  process.exit(0);
}

const docChanged = relevantChangedFiles.some((path) => matchesAny(path, DOC_PATTERNS));
const codeChanged = relevantChangedFiles.some((path) => !matchesAny(path, DOC_PATTERNS));

if (codeChanged && !docChanged) {
  console.error("\nDocumentation guard failed.");
  console.error("You changed implementation files without updating contribution docs/context.");
  console.error("\nTo fix this, update at least one of:");
  console.error("- CONTRIBUTING.md");
  console.error("- docs/ARCHITECTURE.md");
  console.error("- docs/implementation-plan.md");
  console.error("- apps/web/src/**/README.md or CONTEXT.md for touched modules");
  console.error("\nChanged files:");
  relevantChangedFiles.forEach((file) => console.error(`- ${file}`));
  process.exit(1);
}

process.exit(0);
