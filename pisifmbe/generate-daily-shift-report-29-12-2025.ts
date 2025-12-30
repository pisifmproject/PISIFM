// Generate manual daily shift report for date 29-12-2025
// This script generates daily shift reports for all LVMDP panels (1, 2, 3, 4)

import { generateAndSaveDailyReport as generateLVMDP1 } from "./src/lvmdp/LVMDP_1/lvmdp_1.dailyReport.services";
import { generateAndSaveDailyReport as generateLVMDP2 } from "./src/lvmdp/LVMDP_2/lvmdp_2.dailyReport.services";
import { generateAndSaveDailyReport as generateLVMDP3 } from "./src/lvmdp/LVMDP_3/lvmdp_3.dailyReport.services";
import { generateAndSaveDailyReport as generateLVMDP4 } from "./src/lvmdp/LVMDP_4/lvmdp_4.dailyReport.services";

const TARGET_DATE = "2025-12-29";

interface PanelConfig {
  panelId: string;
  generateFn: (dateStr: string) => Promise<any>;
}

const PANELS: PanelConfig[] = [
  { panelId: "LVMDP_1", generateFn: generateLVMDP1 },
  { panelId: "LVMDP_2", generateFn: generateLVMDP2 },
  { panelId: "LVMDP_3", generateFn: generateLVMDP3 },
  { panelId: "LVMDP_4", generateFn: generateLVMDP4 },
];

/**
 * Validate date format (YYYY-MM-DD)
 */
function isValidDateFormat(dateStr: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) return false;
  const [Y, M, D] = dateStr.split("-").map(Number);
  return (
    !isNaN(Y) &&
    !isNaN(M) &&
    !isNaN(D) &&
    M >= 1 &&
    M <= 12 &&
    D >= 1 &&
    D <= 31
  );
}

/**
 * Generate daily shift report for all panels
 */
async function generateDailyShiftReport(dateStr: string) {
  if (!isValidDateFormat(dateStr)) {
    throw new Error(`Invalid date format: ${dateStr}. Expected YYYY-MM-DD`);
  }

  console.log(`\n🔄 Generating daily shift reports for ${dateStr}...\n`);

  const results: Array<{
    panelId: string;
    success: boolean;
    error?: string;
  }> = [];

  for (const panel of PANELS) {
    try {
      console.log(`📊 Processing ${panel.panelId}...`);
      const report = await panel.generateFn(dateStr);

      if (report) {
        console.log(`✅ ${panel.panelId}: Successfully generated report`);
        console.log(
          `   - Shift 1: ${report.shift1Count || 0} samples, ${(
            report.shift1TotalKwh || 0
          ).toFixed(2)} kWh`
        );
        console.log(
          `   - Shift 2: ${report.shift2Count || 0} samples, ${(
            report.shift2TotalKwh || 0
          ).toFixed(2)} kWh`
        );
        console.log(
          `   - Shift 3: ${report.shift3Count || 0} samples, ${(
            report.shift3TotalKwh || 0
          ).toFixed(2)} kWh`
        );
        results.push({ panelId: panel.panelId, success: true });
      } else {
        console.log(`⚠️  ${panel.panelId}: No data found for this date`);
        results.push({
          panelId: panel.panelId,
          success: false,
          error: "No data",
        });
      }
    } catch (error: any) {
      console.error(`❌ ${panel.panelId}: Error -`, error.message || error);
      results.push({
        panelId: panel.panelId,
        success: false,
        error: error.message || String(error),
      });
    }
    console.log(""); // Empty line for readability
  }

  // Summary
  console.log("=".repeat(60));
  console.log("📈 Summary:");
  const successCount = results.filter((r) => r.success).length;
  const failCount = results.filter((r) => !r.success).length;
  console.log(`✅ Success: ${successCount}/${PANELS.length}`);
  console.log(`❌ Failed: ${failCount}/${PANELS.length}`);

  if (failCount > 0) {
    console.log("\nFailed panels:");
    results
      .filter((r) => !r.success)
      .forEach((r) => {
        console.log(`  - ${r.panelId}: ${r.error}`);
      });
  }
  console.log("=".repeat(60));

  return results;
}

/**
 * Main execution
 */
async function main() {
  try {
    console.log("🚀 Starting manual daily shift report generation");
    console.log(`📅 Target Date: ${TARGET_DATE}\n`);

    await generateDailyShiftReport(TARGET_DATE);

    console.log("\n✨ Process completed!");
    process.exit(0);
  } catch (error: any) {
    console.error("\n❌ Fatal error:", error.message || error);
    process.exit(1);
  }
}

// Run the script
main();
