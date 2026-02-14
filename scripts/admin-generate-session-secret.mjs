#!/usr/bin/env node

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";

const ENV_FILE = ".env.local";
const PLACEHOLDER = "replace_with_long_random_secret";
const args = process.argv.slice(2);
const force = args.includes("--force");

function generateSecret() {
  return randomBytes(48).toString("base64url");
}

function parseLines(content) {
  return content.split(/\r?\n/);
}

function findTokenLine(lines) {
  return lines.findIndex((line) => line.startsWith("ADMIN_SESSION_TOKEN="));
}

function getTokenValue(line) {
  const raw = line.split("=", 2)[1] ?? "";
  return raw.trim();
}

function main() {
  const exists = existsSync(ENV_FILE);
  const content = exists ? readFileSync(ENV_FILE, "utf8") : "";
  const lines = parseLines(content);
  const tokenIdx = findTokenLine(lines);

  if (tokenIdx >= 0) {
    const current = getTokenValue(lines[tokenIdx]);
    const shouldKeep = current && current !== PLACEHOLDER && !force;
    if (shouldKeep) {
      console.log("ADMIN_SESSION_TOKEN already set. Use --force to rotate.");
      return;
    }
    const next = generateSecret();
    lines[tokenIdx] = `ADMIN_SESSION_TOKEN=${next}`;
    writeFileSync(ENV_FILE, lines.join("\n").replace(/\n?$/, "\n"));
    console.log(force ? "ADMIN_SESSION_TOKEN rotated." : "ADMIN_SESSION_TOKEN generated.");
    return;
  }

  const next = generateSecret();
  const prefix = content && !content.endsWith("\n") ? "\n" : "";
  writeFileSync(ENV_FILE, `${content}${prefix}ADMIN_SESSION_TOKEN=${next}\n`);
  console.log("ADMIN_SESSION_TOKEN added to .env.local.");
}

main();
