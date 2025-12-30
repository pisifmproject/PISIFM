// Check November data detail
import { db } from "./src/db/index";
import { sql } from "drizzle-orm";

async function checkNovemberDetail() {
  console.log("=== Checking November 2025 Detail ===\n");

  for (let panelId = 1; panelId <= 4; panelId++) {
    console.log(`\n--- LVMDP ${panelId} ---`);

    const query = sql`
      SELECT 
        report_date,
        shift1_total_kwh,
        shift2_total_kwh,
        shift3_total_kwh,
        (shift1_total_kwh + shift2_total_kwh + shift3_total_kwh) as daily_total
      FROM daily_report_lvmdp_${sql.raw(panelId.toString())}
      WHERE report_date >= '2025-11-01' AND report_date <= '2025-11-30'
      ORDER BY report_date ASC
    `;

    const result = await db.execute(query);
    
    console.log(`Total records: ${result.rows.length}\n`);
    
    result.rows.forEach((row: any) => {
      const total = Number(row.daily_total);
      const flag = total > 50000 ? " ⚠️ ANOMALY!" : "";
      console.log(
        `${row.report_date}: S1=${Number(row.shift1_total_kwh).toFixed(
          2
        )} S2=${Number(row.shift2_total_kwh).toFixed(2)} S3=${Number(
          row.shift3_total_kwh
        ).toFixed(2)} Total=${total.toFixed(2)} kWh${flag}`
      );
    });

    const totalQuery = sql`
      SELECT SUM(shift1_total_kwh + shift2_total_kwh + shift3_total_kwh) as total
      FROM daily_report_lvmdp_${sql.raw(panelId.toString())}
      WHERE report_date >= '2025-11-01' AND report_date <= '2025-11-30'
    `;

    const totalResult = await db.execute(totalQuery);
    console.log(
      `\nNovember Total: ${Number(totalResult.rows[0].total).toFixed(2)} kWh`
    );
  }

  process.exit(0);
}

checkNovemberDetail().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
