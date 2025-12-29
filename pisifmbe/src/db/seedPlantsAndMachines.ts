// src/db/seedPlantsAndMachines.ts
// Idempotent seed script for plants and machines
import { db } from "./index";
import { plants, machines } from "./schema";
import { eq } from "drizzle-orm";

/**
 * Plant and machine definitions
 * plantId values: semarang, cikokol, cikupa, agro
 */

const PLANTS_DATA = [
  {
    plantId: "cikupa",
    displayName: "Plant Cikupa",
    location: "Cikupa, Tangerang",
    status: "active",
    hasRealData: true, // Only Cikupa has real LVMDP data
    installedCapacityKva: 5540,
    metadata: { lvmdpPanels: [1, 2, 3, 4] },
  },
  {
    plantId: "semarang",
    displayName: "Plant Semarang",
    location: "Semarang, Central Java",
    status: "active",
    hasRealData: false,
    installedCapacityKva: 4500,
    metadata: {},
  },
  {
    plantId: "cikokol",
    displayName: "Plant Cikokol",
    location: "Cikokol, Tangerang",
    status: "active",
    hasRealData: false,
    installedCapacityKva: 3800,
    metadata: {},
  },
  {
    plantId: "agro",
    displayName: "Plant Agro",
    location: "Agro Industrial Area",
    status: "active",
    hasRealData: false,
    installedCapacityKva: 3200,
    metadata: {},
  },
];

/**
 * Machine definitions per plant
 * machineId is a stable URL-safe slug: {plantId}-{machine-name-kebab}
 */
const MACHINES_DATA = [
  // CIKOKOL MACHINES
  { plantId: "cikokol", machineName: "Baked Corn Puff", machineType: "production" },
  { plantId: "cikokol", machineName: "Potato Chips Line PC14", machineType: "production" },
  { plantId: "cikokol", machineName: "Cassava Inhouse", machineType: "production" },
  { plantId: "cikokol", machineName: "Cassava Copack", machineType: "production" },
  { plantId: "cikokol", machineName: "Tempe", machineType: "production" },
  { plantId: "cikokol", machineName: "Batch Fryer", machineType: "production" },
  { plantId: "cikokol", machineName: "Continuous Fryer", machineType: "production" },

  // SEMARANG MACHINES
  { plantId: "semarang", machineName: "PC 14", machineType: "production" },
  { plantId: "semarang", machineName: "PC 32", machineType: "production" },
  { plantId: "semarang", machineName: "Cassava Inhouse", machineType: "production" },
  { plantId: "semarang", machineName: "Cassava Copack", machineType: "production" },
  { plantId: "semarang", machineName: "Tempe", machineType: "production" },
  { plantId: "semarang", machineName: "Tortilla", machineType: "production" },
  { plantId: "semarang", machineName: "FCP", machineType: "production" },
  { plantId: "semarang", machineName: "Extrude Pellet", machineType: "production" },
  { plantId: "semarang", machineName: "Sheeted Pellet E250", machineType: "production" },
  { plantId: "semarang", machineName: "Sheeted Pellet E500 1", machineType: "production" },
  { plantId: "semarang", machineName: "Sheeted Pellet E500 2", machineType: "production" },
  { plantId: "semarang", machineName: "Batch Fryer", machineType: "production" },
  { plantId: "semarang", machineName: "Continuous Fryer", machineType: "production" },

  // CIKUPA MACHINES
  { plantId: "cikupa", machineName: "PC 14", machineType: "production" },
  { plantId: "cikupa", machineName: "PC 39", machineType: "production" },
  { plantId: "cikupa", machineName: "Cassava Inhouse", machineType: "production" },
  { plantId: "cikupa", machineName: "Cassava Copack", machineType: "production" },
  { plantId: "cikupa", machineName: "Tortilla", machineType: "production" },
  { plantId: "cikupa", machineName: "FCP", machineType: "production" },
  { plantId: "cikupa", machineName: "TWS 5.6", machineType: "production" },
  { plantId: "cikupa", machineName: "TWS 7.2", machineType: "production" },
  { plantId: "cikupa", machineName: "Packing Pouch Promina Puff", machineType: "packing" },
  { plantId: "cikupa", machineName: "Vacuum Fryer 1", machineType: "production" },

  // AGRO MACHINES
  { plantId: "agro", machineName: "Baked Corn Puff", machineType: "production" },
  { plantId: "agro", machineName: "Potato Chips Line PC14", machineType: "production" },
  { plantId: "agro", machineName: "Cassava Inhouse", machineType: "production" },
  { plantId: "agro", machineName: "Cassava Copack", machineType: "production" },
  { plantId: "agro", machineName: "Tempe", machineType: "production" },
  { plantId: "agro", machineName: "Batch Fryer", machineType: "production" },
  { plantId: "agro", machineName: "Continuous Fryer", machineType: "production" },
];

/**
 * Generate stable machineId from plantId and machineName
 */
function generateMachineId(plantId: string, machineName: string): string {
  const slug = machineName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${plantId}-${slug}`;
}

/**
 * Idempotent seed function
 * Checks if data exists before inserting
 */
export async function seedPlantsAndMachines() {
  console.log("[SEED] Starting plants and machines seed...");

  try {
    // Seed plants
    for (const plant of PLANTS_DATA) {
      const existing = await db
        .select()
        .from(plants)
        .where(eq(plants.plantId, plant.plantId))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(plants).values(plant);
        console.log(`[SEED] ✓ Inserted plant: ${plant.plantId}`);
      } else {
        console.log(`[SEED] ⊙ Plant already exists: ${plant.plantId}`);
      }
    }

    // Seed machines
    for (const machine of MACHINES_DATA) {
      const machineId = generateMachineId(machine.plantId, machine.machineName);
      const existing = await db
        .select()
        .from(machines)
        .where(eq(machines.machineId, machineId))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(machines).values({
          machineId,
          plantId: machine.plantId,
          machineName: machine.machineName,
          machineType: machine.machineType,
          status: "active",
        });
        console.log(`[SEED] ✓ Inserted machine: ${machineId}`);
      } else {
        console.log(`[SEED] ⊙ Machine already exists: ${machineId}`);
      }
    }

    console.log("[SEED] ✓ Plants and machines seed completed successfully");
  } catch (error) {
    console.error("[SEED] ✗ Error seeding plants and machines:", error);
    throw error;
  }
}

// Allow running this script directly
if (require.main === module) {
  seedPlantsAndMachines()
    .then(() => {
      console.log("[SEED] Done");
      process.exit(0);
    })
    .catch((err) => {
      console.error("[SEED] Fatal error:", err);
      process.exit(1);
    });
}
