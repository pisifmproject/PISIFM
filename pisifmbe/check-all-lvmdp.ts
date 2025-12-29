import { findLatestLVMDP1 } from "./src/lvmdp/LVMDP_1/lvmdp_1.repository";
import { findLatestLVMDP2 } from "./src/lvmdp/LVMDP_2/lvmdp_2.repository";
import { findLatestLVMDP3 } from "./src/lvmdp/LVMDP_3/lvmdp_3.repository";
import { findLatestLVMDP4 } from "./src/lvmdp/LVMDP_4/lvmdp_4.repository";

async function checkAllPanels() {
  console.log("\n🔍 Checking all LVMDP panels from backend...\n");

  const panels = [
    { id: 1, name: "LVMDP 1 (Cikupa)", fn: findLatestLVMDP1 },
    { id: 2, name: "LVMDP 2 (Semarang)", fn: findLatestLVMDP2 },
    { id: 3, name: "LVMDP 3 (Cikokol)", fn: findLatestLVMDP3 },
    { id: 4, name: "LVMDP 4 (Agro)", fn: findLatestLVMDP4 },
  ];

  for (const panel of panels) {
    try {
      const data = await panel.fn();
      console.log(`✅ ${panel.name}:`);
      if (data) {
        console.log(`   Power: ${data.realPower?.toFixed(2) || "N/A"} kW`);
        console.log(`   Current: ${data.avgCurrent?.toFixed(2) || "N/A"} A`);
        console.log(`   Voltage: ${data.avgLineLine?.toFixed(2) || "N/A"} V`);
        console.log(`   PF: ${data.cosPhi?.toFixed(4) || "N/A"}`);
        console.log(`   Timestamp: ${data.waktu}\n`);
      } else {
        console.log("   ⚠️  No data found\n");
      }
    } catch (e) {
      console.log(`   ❌ Error: ${e instanceof Error ? e.message : e}\n`);
    }
  }
  process.exit(0);
}

checkAllPanels();
