import { Router } from "express";
import { findLatestLVMDP1 } from "../lvmdp/LVMDP_1/lvmdp_1.repository";
import { findLatestLVMDP2 } from "../lvmdp/LVMDP_2/lvmdp_2.repository";
import { findLatestLVMDP3 } from "../lvmdp/LVMDP_3/lvmdp_3.repository";
import { findLatestLVMDP4 } from "../lvmdp/LVMDP_4/lvmdp_4.repository";

const r = Router();

/**
 * DEBUG endpoint untuk test repository data
 */
r.get("/debug/repo", async (req, res) => {
  try {
    const results = {
      lvmdp1: await findLatestLVMDP1(),
      lvmdp2: await findLatestLVMDP2(),
      lvmdp3: await findLatestLVMDP3(),
      lvmdp4: await findLatestLVMDP4(),
    };

    res.json({
      status: "ok",
      data: {
        lvmdp1: results.lvmdp1
          ? {
              power: results.lvmdp1.realPower,
              current: results.lvmdp1.avgCurrent,
              voltage: results.lvmdp1.avgLineLine,
            }
          : null,
        lvmdp2: results.lvmdp2
          ? {
              power: results.lvmdp2.realPower,
              current: results.lvmdp2.avgCurrent,
              voltage: results.lvmdp2.avgLineLine,
            }
          : null,
        lvmdp3: results.lvmdp3
          ? {
              power: results.lvmdp3.realPower,
              current: results.lvmdp3.avgCurrent,
              voltage: results.lvmdp3.avgLineLine,
            }
          : null,
        lvmdp4: results.lvmdp4
          ? {
              power: results.lvmdp4.realPower,
              current: results.lvmdp4.avgCurrent,
              voltage: results.lvmdp4.avgLineLine,
            }
          : null,
      },
    });
  } catch (err) {
    res.json({
      status: "error",
      error: String(err),
    });
  }
});

export default r;
