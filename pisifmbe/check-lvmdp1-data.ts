import { db } from "./src/db";
import { sql } from "drizzle-orm";

async function checkData() {
  console.log("🔍 Checking LVMDP 1 data...\n");

  try {
    // Check if view exists and has data
    const result = await db.execute(sql`
      SELECT * FROM public.v_lvmdp_1 
      ORDER BY waktu DESC 
      LIMIT 5
    `);

    const rows = (result as any).rows || result;

    if (!Array.isArray(rows) || rows.length === 0) {
      console.log("❌ No data found in v_lvmdp_1");
      console.log("\nℹ️  View might be empty. Checking source tables...\n");

      // Check raw LVMDP tables
      const lvmdpResult = await db.execute(
        sql`SELECT COUNT(*) as count FROM public.lvmdp_1 LIMIT 1`
      );
      const lvmdpRows = (lvmdpResult as any).rows || lvmdpResult;
      const lvmdpCount = lvmdpRows[0]?.count || 0;

      console.log(`📊 Raw lvmdp_1 table has ${lvmdpCount} rows`);

      if (lvmdpCount === 0) {
        console.log("\n⚠️  No data in lvmdp_1 table. You need to:");
        console.log(
          "1. Check if there's an ETL/import process that populates this table"
        );
        console.log("2. Or manually insert test data");
        console.log("\nExample INSERT:");
        console.log(`
INSERT INTO public.lvmdp_1 (
  waktu, total_kwh, real_power, cos_phi, freq,
  avg_line_line, avg_line_neut, avg_current,
  current_r, current_s, current_t,
  voltage_rs, voltage_st, voltage_tr
) VALUES (
  NOW(),
  125000.5,
  2500,
  0.95,
  50.0,
  380,
  220,
  2000,
  2100, 2000, 1950,
  380, 385, 375
);
        `);
      }
      return;
    }

    console.log(`✅ Found ${rows.length} recent records in v_lvmdp_1:\n`);
    rows.forEach((row, idx) => {
      console.log(`Record ${idx + 1}:`);
      console.log(`  Waktu: ${row.waktu}`);
      console.log(`  Daya Aktif: ${row.real_power} kW`);
      console.log(`  Arus Rata-rata: ${row.avg_current} A`);
      console.log(`  Tegangan L-L: ${row.avg_line_line} V`);
      console.log(`  Power Factor: ${row.cos_phi}`);
      console.log(`  Total Energy: ${row.total_kwh} kWh\n`);
    });

    console.log("✨ Data is available and should display in real-time!");
  } catch (error) {
    console.error("❌ Error checking data:", error);
  }

  process.exit(0);
}

checkData();
