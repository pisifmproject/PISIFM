"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/lvmdp.router.ts
const express_1 = require("express");
const lvmdp_1_repository_1 = require("../lvmdp/LVMDP_1/lvmdp_1.repository");
const lvmdp_2_repository_1 = require("../lvmdp/LVMDP_2/lvmdp_2.repository");
const lvmdp_3_repository_1 = require("../lvmdp/LVMDP_3/lvmdp_3.repository");
const lvmdp_4_repository_1 = require("../lvmdp/LVMDP_4/lvmdp_4.repository");
const r = (0, express_1.Router)();
// Peta fungsi repository per panel
const REPO_FUNCTIONS = {
    1: lvmdp_1_repository_1.findLatestLVMDP1,
    2: lvmdp_2_repository_1.findLatestLVMDP2,
    3: lvmdp_3_repository_1.findLatestLVMDP3,
    4: lvmdp_4_repository_1.findLatestLVMDP4,
};
// Test endpoint to check database connection
r.get("/test", async (req, res) => {
    try {
        const result = await (0, lvmdp_1_repository_1.findLatestLVMDP1)();
        if (result) {
            return res.json({
                success: true,
                message: "Database connection OK",
                sampleData: {
                    power: result.realPower,
                    current: result.avgCurrent,
                    voltage: result.avgLineLine,
                    timestamp: result.waktu,
                },
            });
        }
        else {
            return res.json({
                success: false,
                message: "No data found in database",
            });
        }
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            message: "Database error",
            error: String(err),
        });
    }
});
// GET /api/lvmdp/:id/latest
r.get("/:id/latest", async (req, res) => {
    const startTime = Date.now();
    try {
        const id = Number(req.params.id);
        if (![1, 2, 3, 4].includes(id)) {
            return res.status(400).json({ message: "Bad id (must be 1..4)" });
        }
        const findLatest = REPO_FUNCTIONS[id];
        if (!findLatest) {
            return res.status(500).json({ message: "Repository not found" });
        }
        const row = await findLatest();
        if (!row) {
            return res.status(404).json({ message: "No data" });
        }
        return res.json({
            waktu: row.waktu,
            totalKwh: row.totalKwh,
            realPower: row.realPower,
            cosPhi: row.cosPhi,
            freq: row.freq,
            avgLineLine: row.avgLineLine,
            avgLineNeut: row.avgLineNeut,
            avgCurrent: row.avgCurrent,
            currentR: row.currentR,
            currentS: row.currentS,
            currentT: row.currentT,
            voltageRS: row.voltageRS,
            voltageST: row.voltageST,
            voltageTR: row.voltageTR,
        });
    }
    catch (err) {
        return res
            .status(500)
            .json({ message: "Internal server error", error: String(err) });
    }
});
exports.default = r;
