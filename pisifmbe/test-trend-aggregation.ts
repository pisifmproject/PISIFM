// Test trend aggregation after filtering anomalies
import { db } from "./src/db/index";
import { sql } from "drizzle-orm";
import {
  getCurrentIndofoodWeek,
  getCurrentIndofoodMonth,
  getIndofoodYearRange,
  getIndofoodMonthByNumber,
} from "./src/utils/indofoodCalendar";

async function testAggregation() {
  console.log("=== Testing Trend Aggregation (After Filtering Anomalies) ===\n");

  const panelId = 1; // Test with LVMDP 1

  // Helper to filter anomalies
  const filterAnomalies = (reports: any[]) => {
    return reports.filter((r: any) => {
      const total =
        (r.shift1_total_kwh || 0) +
        (r.shift2_total_kwh || 0) +
        (r.shift3_total_kwh || 0);
      return total <= 50000;
    });
  };

  // Get all reports
  const allQuery = sql`
    SELECT 
      report_date,
      shift1_total_kwh,
      shift2_total_kwh,
      shift3_total_kwh
    FROM daily_report_lvmdp_${sql.raw(panelId.toString())}
    ORDER BY report_date DESC
    LIMIT 50
  `;

  const allResult = await db.execute(allQuery);
  const allReports = allResult.rows;
  const filteredReports = filterAnomalies(allReports);

  console.log(`Total reports: ${allReports.length}`);
  console.log(`After filtering anomalies: ${filteredReports.length}\n`);

  // Test Week aggregation
  console.log("--- WEEK AGGREGATION ---");
  const week = getCurrentIndofoodWeek();
  if (week) {
    console.log(`Current Week: ${week.week} (${week.startDate} to ${week.endDate})`);

    const weekReports = filteredReports.filter(
      (r: any) =>
        r.report_date >= week.startDate && r.report_date <= week.endDate
    );

    let weekTotal = 0;
    weekReports.forEach((r: any) => {
      const daily =
        Number(r.shift1_total_kwh || 0) +
        Number(r.shift2_total_kwh || 0) +
        Number(r.shift3_total_kwh || 0);
      weekTotal += daily;
      console.log(`  ${r.report_date}: ${daily.toFixed(2)} kWh`);
    });

    console.log(`\nWeek Total: ${weekTotal.toFixed(2)} kWh\n`);
  }

  // Test Month aggregation
  console.log("--- MONTH AGGREGATION ---");
  const month = getCurrentIndofoodMonth();
  if (month) {
    console.log(
      `Current Month: ${month.month} (${month.startDate} to ${month.endDate})`
    );

    for (const week of month.weeks) {
      const weekReports = filteredReports.filter(
        (r: any) =>
          r.report_date >= week.startDate && r.report_date <= week.endDate
      );

      let weekTotal = 0;
      for (const report of weekReports) {
        weekTotal +=
          Number(report.shift1_total_kwh || 0) +
          Number(report.shift2_total_kwh || 0) +
          Number(report.shift3_total_kwh || 0);
      }

      console.log(`  Week ${week.week}: ${weekTotal.toFixed(2)} kWh`);
    }

    const monthTotal = filteredReports
      .filter(
        (r: any) =>
          r.report_date >= month.startDate && r.report_date <= month.endDate
      )
      .reduce((sum, r: any) => {
        return (
          sum +
          Number(r.shift1_total_kwh || 0) +
          Number(r.shift2_total_kwh || 0) +
          Number(r.shift3_total_kwh || 0)
        );
      }, 0);

    console.log(`\nMonth Total: ${monthTotal.toFixed(2)} kWh\n`);
  }

  // Test Year aggregation
  console.log("--- YEAR AGGREGATION ---");
  const year = 2025;
  const yearRange = getIndofoodYearRange(year);
  console.log(`Year ${year}: ${yearRange.startDate} to ${yearRange.endDate}`);

  const yearReports = filteredReports.filter(
    (r: any) =>
      r.report_date >= yearRange.startDate && r.report_date <= yearRange.endDate
  );

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  let yearTotal = 0;
  for (let monthNum = 1; monthNum <= 12; monthNum++) {
    const indofoodMonth = getIndofoodMonthByNumber(year, monthNum);
    if (!indofoodMonth) continue;

    const monthReports = yearReports.filter(
      (r: any) =>
        r.report_date >= indofoodMonth.startDate &&
        r.report_date <= indofoodMonth.endDate
    );

    let monthTotal = 0;
    for (const report of monthReports) {
      monthTotal +=
        Number(report.shift1_total_kwh || 0) +
        Number(report.shift2_total_kwh || 0) +
        Number(report.shift3_total_kwh || 0);
    }

    yearTotal += monthTotal;
    if (monthTotal > 0) {
      console.log(`  ${monthNames[monthNum - 1]}: ${monthTotal.toFixed(2)} kWh`);
    }
  }

  console.log(`\nYear Total: ${yearTotal.toFixed(2)} kWh`);

  process.exit(0);
}

testAggregation().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
