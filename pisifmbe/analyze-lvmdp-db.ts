import { db } from "./src/db";
import { sql } from "drizzle-orm";

async function checkLVMDPData() {
  console.log("=== LVMDP Database Analysis ===\n");

  // Check v_lvmdp_1 structure and data
  console.log("📋 1. Checking v_lvmdp_1 view structure and latest data...\n");
  try {
    const result = await db.execute(
      sql.raw(`SELECT * FROM public."v_lvmdp_1" ORDER BY waktu DESC LIMIT 1`)
    );
    const row = (result as any)[0] || (result as any).rows?.[0];
    if (row) {
      console.log("✅ v_lvmdp_1 Latest Data:");
      console.log("Columns available:");
      Object.keys(row).forEach((key) => {
        console.log(`  - ${key}: ${row[key]}`);
      });
    }
  } catch (err) {
    console.log("❌ Error querying v_lvmdp_1:", String(err).slice(0, 150));
  }

  console.log(
    "\n📋 2. Checking lvmdp_hmi table structure and latest data...\n"
  );
  try {
    const result = await db.execute(
      sql.raw(
        `SELECT * FROM public."lvmdp_hmi" ORDER BY datetimefield DESC LIMIT 1`
      )
    );
    const row = (result as any)[0] || (result as any).rows?.[0];
    if (row) {
      console.log("✅ lvmdp_hmi Latest Data:");
      console.log("Columns available:");
      Object.keys(row).forEach((key) => {
        console.log(`  - ${key}: ${row[key]}`);
      });
    } else {
      console.log("❌ No data in lvmdp_hmi table");
    }
  } catch (err) {
    console.log("❌ Error querying lvmdp_hmi:", String(err).slice(0, 150));
  }

  console.log(
    "\n📋 3. Checking all LVMDP views (v_lvmdp_1 through v_lvmdp_4)...\n"
  );
  for (let i = 1; i <= 4; i++) {
    try {
      const result = await db.execute(
        sql.raw(
          `SELECT COUNT(*) as cnt, MAX(waktu) as latest_time FROM public."v_lvmdp_${i}"`
        )
      );
      const row = (result as any)[0] || (result as any).rows?.[0];
      console.log(
        `v_lvmdp_${i}: ${row?.cnt || 0} records, Latest: ${
          row?.latest_time || "N/A"
        }`
      );
    } catch (err) {
      console.log(`v_lvmdp_${i}: Error`);
    }
  }

  process.exit(0);
}

checkLVMDPData().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});
