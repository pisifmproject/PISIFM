import { findLatestLVMDP1 } from "./src/lvmdp/LVMDP_1/lvmdp_1.repository";
import { findLatestLVMDP2 } from "./src/lvmdp/LVMDP_2/lvmdp_2.repository";
import { findLatestLVMDP3 } from "./src/lvmdp/LVMDP_3/lvmdp_3.repository";
import { findLatestLVMDP4 } from "./src/lvmdp/LVMDP_4/lvmdp_4.repository";

async function testLVMDP() {
  console.log("=== Testing All LVMDP Data from HMI Table ===\n");

  const repos = [
    { name: "LVMDP 1", fn: findLatestLVMDP1 },
    { name: "LVMDP 2", fn: findLatestLVMDP2 },
    { name: "LVMDP 3", fn: findLatestLVMDP3 },
    { name: "LVMDP 4", fn: findLatestLVMDP4 },
  ];

  for (const { name, fn } of repos) {
    try {
      const data = await fn();
      if (data) {
        console.log(`✅ ${name}:`);
        console.log(`   Power: ${data.realPower.toFixed(1)} kW`);
        console.log(`   Current: ${data.avgCurrent.toFixed(1)} A`);
        console.log(`   Voltage LL: ${data.avgLineLine.toFixed(1)} V`);
        console.log(`   PF: ${data.cosPhi.toFixed(4)}`);
        console.log(`   Energy: ${data.totalKwh.toFixed(2)} kWh`);
        console.log(`   Freq: ${data.freq.toFixed(2)} Hz`);
        console.log();
      } else {
        console.log(`❌ ${name}: No data returned\n`);
      }
    } catch (err) {
      console.log(`❌ ${name}: Error - ${String(err).slice(0, 100)}\n`);
    }
  }

  process.exit(0);
}

testLVMDP().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});
