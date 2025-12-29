import { db } from "./src/db";
import { sql } from "drizzle-orm";

async function checkTables() {
  console.log("=== Checking Tables ===\n");

  const tables = ["lvmdp_1", "lvmdp_2", "lvmdp_3", "lvmdp_4"];

  for (const table of tables) {
    try {
      const result = await db.execute(
        sql.raw(`SELECT COUNT(*) as cnt FROM public."${table}"`)
      );
      const row = (result as any)[0];
      console.log(`📊 ${table}: ${row?.cnt || 0} records`);

      if (row?.cnt > 0) {
        const latest = await db.execute(
          sql.raw(
            `SELECT real_power, avg_current, avg_line_line, cos_phi, waktu FROM public."${table}" ORDER BY waktu DESC LIMIT 1`
          )
        );
        const data = (latest as any)[0];
        console.log(
          `   Latest: Power=${data?.real_power}, Current=${data?.avg_current}, Voltage=${data?.avg_line_line}, PF=${data?.cos_phi}`
        );
      }
    } catch (err) {
      console.log(`❌ ${table}: Error`);
    }
  }
  process.exit(0);
}

checkTables().catch((e) => {
  console.error("Error:", e);
  process.exit(1);
});
