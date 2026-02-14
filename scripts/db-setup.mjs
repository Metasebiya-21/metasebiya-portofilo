#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";

const args = process.argv.slice(2);
const reset = args.includes("--reset");

function run(command, args) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function hasMigrationFiles() {
  try {
    return readdirSync("prisma/migrations").some((entry) => entry !== "migration_lock.toml");
  } catch {
    return false;
  }
}

if (!hasMigrationFiles()) {
  console.error("[db:setup] no migrations found in prisma/migrations.");
  console.error("[db:setup] create an initial migration first, then re-run db:setup.");
  process.exit(1);
}

console.log("[db:setup] generating prisma client...");
run("npm", ["run", "db:generate"]);

if (reset) {
  console.log("[db:setup] resetting local database schema...");
  run("npx", ["prisma", "migrate", "reset", "--force", "--skip-seed"]);
}

console.log("[db:setup] applying migrations...");
run("npm", ["run", "db:migrate:deploy"]);

console.log("[db:setup] seeding (idempotent)...");
run("npm", ["run", "db:seed"]);

console.log("[db:setup] completed.");
