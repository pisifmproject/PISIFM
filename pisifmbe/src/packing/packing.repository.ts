// src/packing/packing.repository.ts
// DISABLED - Packing line tables have been removed from schema
// This file is kept for future use when packing line tables are re-enabled

type PackingWeigherRow = {
  id: string;
  timestamp: Date;
  lineId: string;
  targetPacks: number;
  actualPacks: number;
  rejectCount: number;
  avgWeight: number;
  minWeight: number;
  maxWeight: number;
  status: string;
  efficiency: number;
};

type PackingBagMakerRow = {
  id: string;
  timestamp: Date;
  lineId: string;
  targetBags: number;
  actualBags: number;
  defectBags: number;
  status: string;
  efficiency: number;
  speedRpm: number;
};

// Placeholder functions - return empty data until packing tables are re-enabled

export async function findAllWeigher(_limit: number = 100): Promise<PackingWeigherRow[]> {
  console.warn("Packing line tables are disabled");
  return [];
}

export async function findLatestWeigher(): Promise<PackingWeigherRow | null> {
  console.warn("Packing line tables are disabled");
  return null;
}

export async function insertWeigher(_data: Partial<PackingWeigherRow>): Promise<PackingWeigherRow | null> {
  console.warn("Packing line tables are disabled");
  return null;
}

export async function findAllBagMaker(_limit: number = 100): Promise<PackingBagMakerRow[]> {
  console.warn("Packing line tables are disabled");
  return [];
}

export async function findLatestBagMaker(): Promise<PackingBagMakerRow | null> {
  console.warn("Packing line tables are disabled");
  return null;
}

export async function insertBagMaker(_data: Partial<PackingBagMakerRow>): Promise<PackingBagMakerRow | null> {
  console.warn("Packing line tables are disabled");
  return null;
}
