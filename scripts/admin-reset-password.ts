import { PrismaClient } from "@prisma/client";
import { randomBytes } from "node:crypto";
import { hashPassword } from "../src/lib/password";

function getArgValue(name: string) {
  const args = process.argv.slice(2);
  const idx = args.findIndex((arg) => arg === `--${name}`);
  if (idx === -1) return "";
  return args[idx + 1] || "";
}

async function main() {
  const prisma = new PrismaClient();
  try {
    const email = (getArgValue("email") || process.env.ADMIN_EMAIL || "").trim().toLowerCase();
    if (!email) {
      throw new Error("Missing email. Use --email <admin@email> or set ADMIN_EMAIL.");
    }

    const providedPassword = (getArgValue("password") || "").trim();
    const generatedPassword = randomBytes(12).toString("base64url");
    const password = providedPassword || generatedPassword;

    const hashed = await hashPassword(password);

    await prisma.adminUser.upsert({
      where: { email },
      update: {
        passwordHash: hashed.hash,
        passwordSalt: hashed.salt,
        isSuperAdmin: true,
        isActive: true,
      },
      create: {
        email,
        passwordHash: hashed.hash,
        passwordSalt: hashed.salt,
        isSuperAdmin: true,
        isActive: true,
      },
    });

    console.log(`Superadmin credential updated for ${email}`);
    if (!providedPassword) {
      console.log(`Generated password: ${generatedPassword}`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
