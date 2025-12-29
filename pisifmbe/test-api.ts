import axios from "axios";

async function testAPI() {
  console.log("Testing API endpoints...\n");

  const baseURL = "http://localhost:3001/api";

  for (let i = 1; i <= 4; i++) {
    try {
      console.log(`Fetching /lvmdp/${i}/latest...`);
      const response = await axios.get(`${baseURL}/lvmdp/${i}/latest`);
      console.log(`✅ Success:`, {
        power: response.data.realPower,
        current: response.data.avgCurrent,
        voltage: response.data.avgLineLine,
        pf: response.data.cosPhi,
        status: response.status,
      });
    } catch (err: any) {
      console.log(`❌ Error:`, {
        status: err.response?.status,
        message: err.response?.data?.message || err.message,
      });
    }
    console.log();
  }

  process.exit(0);
}

testAPI().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
