// Check LVMDP data range in database
import { db } from "./src/db/index";
import { sql } from "drizzle-orm";

async function checkDataRange() {
  console.log("=== Checking LVMDP Data Range ===\n");

  for (let panelId = 1; panelId <= 4; panelId++) {
    console.log(`\n--- LVMDP ${panelId} ---`);

    // Check daily reports
    const dailyQuery = sql`
      SELECT 
        MIN(report_date) as min_date,
        MAX(report_date) as max_date,
        COUNT(*) as total_records,
        SUM(shift1_total_kwh + shift2_total_kwh + shift3_total_kwh) as total_kwh
      FROM daily_report_lvmdp_${sql.raw(panelId.toString())}
    `;

    const dailyResult = await db.execute(dailyQuery);
    const dailyData = dailyResult.rows[0];

    console.log("Daily Reports:");
    console.log(`  Date Range: ${dailyData.min_date} to ${dailyData.max_date}`);
    console.log(`  Total Records: ${dailyData.total_records}`);
    console.log(`  Total kWh (All Time): ${Number(dailyData.total_kwh).toFixed(2)}`);

    // Check sample of recent daily reports
    const sampleQuery = sql`
      SELECT 
        report_date,
        shift1_total_kwh,
        shift2_total_kwh,
        shift3_total_kwh,
        (shift1_total_kwh + shift2_total_kwh + shift3_total_kwh) as daily_total
      FROM daily_report_lvmdp_${sql.raw(panelId.toString())}
      ORDER BY report_date DESC
      LIMIT 10
    `;

    const sampleResult = await db.execute(sampleQuery);
    console.log("\n  Recent 10 Days:");
    sampleResult.rows.forEach((row: any) => {
      console.log(
        `    ${row.report_date}: Shift1=${Number(row.shift1_total_kwh).toFixed(
          2
        )} Shift2=${Number(row.shift2_total_kwh).toFixed(2)} Shift3=${Number(
          row.shift3_total_kwh
        ).toFixed(2)} Total=${Number(row.daily_total).toFixed(2)} kWh`
      );
    });

    // Check November 2025 data
    const novQuery = sql`
      SELECT 
        COUNT(*) as records,
        SUM(shift1_total_kwh + shift2_total_kwh + shift3_total_kwh) as total_kwh
      FROM daily_report_lvmdp_${sql.raw(panelId.toString())}
      WHERE report_date >= '2025-11-03' AND report_date <= '2025-11-30'
    `;

    const novResult = await db.execute(novQuery);
    const novData = novResult.rows[0];
    console.log(
      `\n  November 2025: ${novData.records} records, Total: ${Number(
        novData.total_kwh
      ).toFixed(2)} kWh`
    );

    // Check December 2025 data
    const decQuery = sql`
      SELECT 
        COUNT(*) as records,
        SUM(shift1_total_kwh + shift2_total_kwh + shift3_total_kwh) as total_kwh
      FROM daily_report_lvmdp_${sql.raw(panelId.toString())}
      WHERE report_date >= '2025-12-01' AND report_date <= '2025-12-31'
    `;

    const decResult = await db.execute(decQuery);
    const decData = decResult.rows[0];
    console.log(
      `  December 2025: ${decData.records} records, Total: ${Number(
        decData.total_kwh
      ).toFixed(2)} kWh`
    );

    // Check hourly reports
    const hourlyQuery = sql`
      SELECT 
        MIN(report_date) as min_date,
        MAX(report_date) as max_date,
        COUNT(*) as total_records
      FROM hourly_report_lvmdp_${sql.raw(panelId.toString())}
    `;

    const hourlyResult = await db.execute(hourlyQuery);
    const hourlyData = hourlyResult.rows[0];

    console.log("\nHourly Reports:");
    console.log(`  Date Range: ${hourlyData.min_date} to ${hourlyData.max_date}`);
    console.log(`  Total Records: ${hourlyData.total_records}`);
  }

  process.exit(0);
}

checkDataRange().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
