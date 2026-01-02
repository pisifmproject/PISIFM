// src/auth/seed-users.ts
import { db } from "../db";
import { appUsers } from "./auth.schema";
import { hashPassword } from "./auth.service";

interface SeedUser {
  username: string;
  password: string;
  name: string;
  role: string;
  plantAccess: string[];
}

const seedUsers: SeedUser[] = [
  {
    username: "admin",
    password: "admifm",
    name: "Administrator",
    role: "ADMINISTRATOR",
    plantAccess: ["cikupa", "semarang", "cikokol", "agro"],
  },
  {
    username: "supervisor",
    password: "spvifm",
    name: "Supervisor",
    role: "SUPERVISOR",
    plantAccess: ["cikupa", "semarang", "cikokol", "agro"],
  },
  {
    username: "operator",
    password: "oprifm",
    name: "Operator",
    role: "OPERATOR",
    plantAccess: ["cikupa"],
  },
  {
    username: "maintenance",
    password: "mtcifm",
    name: "Maintenance",
    role: "MAINTENANCE",
    plantAccess: ["cikupa", "semarang", "cikokol", "agro"],
  },
  {
    username: "qc",
    password: "qcifm",
    name: "Quality Control",
    role: "QC",
    plantAccess: ["cikupa", "semarang"],
  },
  {
    username: "management",
    password: "mngifm",
    name: "Management",
    role: "MANAGEMENT",
    plantAccess: ["cikupa", "semarang", "cikokol", "agro"],
  },
  {
    username: "guest",
    password: "gsifm",
    name: "Guest",
    role: "VIEWER",
    plantAccess: ["cikupa"],
  },
];

export async function seedAppUsers() {
  console.log("Seeding app_users...");

  for (const user of seedUsers) {
    const passwordHash = await hashPassword(user.password);

    try {
      await db
        .insert(appUsers)
        .values({
          username: user.username,
          passwordHash,
          name: user.name,
          role: user.role,
          plantAccess: user.plantAccess,
          isActive: true,
        })
        .onConflictDoNothing();

      console.log(`  ✓ User "${user.username}" seeded`);
    } catch (error) {
      console.log(`  - User "${user.username}" already exists or error:`, error);
    }
  }

  console.log("Seeding complete!");
}

// Run if executed directly
if (require.main === module) {
  seedAppUsers()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Seed error:", err);
      process.exit(1);
    });
}
