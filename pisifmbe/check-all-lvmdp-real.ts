import { db } from "./src/db";
import { sql } from "drizzle-orm";

async function checkLVMDP() {
  console.log("=== Checking LVMDP Views ===\n");

  for (let i = 1; i <= 4; i++) {
    const view = `v_lvmdp_${i}`;
    try {
      const result = await db.execute(
        sql.raw(
          `SELECT real_power, avg_current, avg_line_line, cos_phi FROM public."${view}" ORDER BY waktu DESC LIMIT 1`
        )
      );
      const row = (result as any)[0];
      if (row) {
        console.log(`📊 LVMDP ${i}:`);
        console.log(`   Real Power: ${row.real_power} kW`);
        console.log(`   Current: ${row.avg_current} A`);
        console.log(`   Voltage: ${row.avg_line_line} V`);
        console.log(`   PF: ${row.cos_phi}\n`);
      } else {
        console.log(`❌ LVMDP ${i}: No data\n`);
      }
    } catch (err) {
      console.log(`❌ LVMDP ${i}: Error -`, String(err).slice(0, 100), "\n");
    }
  }
  process.exit(0);
}

checkLVMDP().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});
