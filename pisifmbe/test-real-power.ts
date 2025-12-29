import { findLatestLVMDP1 } from "./src/lvmdp/LVMDP_1/lvmdp_1.repository";
import { findLatestLVMDP2 } from "./src/lvmdp/LVMDP_2/lvmdp_2.repository";
import { findLatestLVMDP3 } from "./src/lvmdp/LVMDP_3/lvmdp_3.repository";
import { findLatestLVMDP4 } from "./src/lvmdp/LVMDP_4/lvmdp_4.repository";

async function testAll() {
  const repos = [
    { name: "LVMDP 1 (Cikupa)", fn: findLatestLVMDP1 },
    { name: "LVMDP 2 (Semarang)", fn: findLatestLVMDP2 },
    { name: "LVMDP 3 (Cikokol)", fn: findLatestLVMDP3 },
    { name: "LVMDP 4 (Agro)", fn: findLatestLVMDP4 },
  ];

  for (const { name, fn } of repos) {
    const row = await fn();
    if (!row) {
      console.log(`❌ ${name}: No data`);
      continue;
    }
    console.log(`✅ ${name}:`);
    console.log(`   realPower: ${row.realPower} kW`);
    console.log(`   avgCurrent: ${row.avgCurrent} A`);
    console.log(`   avgLineLine: ${row.avgLineLine} V`);
    console.log(`   cosPhi: ${row.cosPhi}`);
  }
  process.exit(0);
}

testAll().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
