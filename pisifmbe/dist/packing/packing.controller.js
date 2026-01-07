"use strict";
// src/packing/packing.controller.ts
// Packing Module API Controller - Machine-Isolated Architecture
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const simulation = __importStar(require("./packingSimulation.service"));
const r = express_1.default.Router();
/* ===========================
   MACHINE STATE ENDPOINTS
   (Machine-Centric Data Model)
=========================== */
/**
 * GET /api/packing/machines
 * Get list of all available packing machines
 */
r.get('/machines', (_req, res) => {
    try {
        const machineIds = simulation.getAvailableMachineIds();
        const states = simulation.getAllMachineStates();
        const machines = machineIds.map(id => {
            const state = states.find(s => s.machine_id === id);
            return {
                machine_id: id,
                config: state?.config || null,
                last_updated: state?.last_updated || null,
                status: state ? 'active' : 'inactive',
            };
        });
        res.json({
            success: true,
            simulation_running: simulation.isSimulationRunning(),
            machines,
        });
    }
    catch (err) {
        console.error('GET /packing/machines error:', err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});
/**
 * GET /api/packing/machine/:machineId
 * Get full packing state for a specific machine
 * This is the main endpoint as per spec: /api/plant/:plantId/machine/:machineId/packing
 */
r.get('/machine/:machineId', (req, res) => {
    try {
        const { machineId } = req.params;
        const state = simulation.getMachineState(machineId);
        if (!state) {
            return res.status(404).json({
                success: false,
                message: `Machine '${machineId}' not found`,
                available_machines: simulation.getAvailableMachineIds(),
            });
        }
        res.json({
            success: true,
            data: state,
        });
    }
    catch (err) {
        console.error(`GET /packing/machine/${req.params.machineId} error:`, err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});
/**
 * GET /api/packing/machine/:machineId/weighers
 * Get only weigher data for a specific machine
 */
r.get('/machine/:machineId/weighers', (req, res) => {
    try {
        const { machineId } = req.params;
        const state = simulation.getMachineState(machineId);
        if (!state) {
            return res.status(404).json({
                success: false,
                message: `Machine '${machineId}' not found`,
            });
        }
        res.json({
            success: true,
            machine_id: state.machine_id,
            last_updated: state.last_updated,
            weighers: state.weighers,
        });
    }
    catch (err) {
        console.error(`GET /packing/machine/${req.params.machineId}/weighers error:`, err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});
/**
 * GET /api/packing/machine/:machineId/bagmakers
 * Get only bagmaker data for a specific machine
 */
r.get('/machine/:machineId/bagmakers', (req, res) => {
    try {
        const { machineId } = req.params;
        const state = simulation.getMachineState(machineId);
        if (!state) {
            return res.status(404).json({
                success: false,
                message: `Machine '${machineId}' not found`,
            });
        }
        res.json({
            success: true,
            machine_id: state.machine_id,
            last_updated: state.last_updated,
            bagmakers: state.bagmakers,
        });
    }
    catch (err) {
        console.error(`GET /packing/machine/${req.params.machineId}/bagmakers error:`, err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});
/**
 * GET /api/packing/machine/:machineId/summary
 * Get summary statistics for a specific machine
 */
r.get('/machine/:machineId/summary', (req, res) => {
    try {
        const { machineId } = req.params;
        const state = simulation.getMachineState(machineId);
        if (!state) {
            return res.status(404).json({
                success: false,
                message: `Machine '${machineId}' not found`,
            });
        }
        // Calculate summary statistics
        const runningWeighers = state.weighers.filter(w => w.status === 'RUNNING').length;
        const runningBagmakers = state.bagmakers.filter(b => b.status === 'RUNNING').length;
        const avgBpm = state.weighers.length > 0
            ? state.weighers.reduce((sum, w) => sum + w.bpm, 0) / state.weighers.length
            : 0;
        const totalWeight = state.weighers.reduce((sum, w) => sum + w.total_weight, 0);
        const totalGoodBags = state.bagmakers.reduce((sum, b) => sum + b.bag_counts.good, 0);
        const totalBadBags = state.bagmakers.reduce((sum, b) => sum + b.bag_counts.bad, 0);
        const avgEfficiency = state.bagmakers.length > 0
            ? state.bagmakers.reduce((sum, b) => sum + b.efficiency.total, 0) / state.bagmakers.length
            : 0;
        // Count active alarms
        const activeAlarms = state.bagmakers.reduce((count, b) => {
            let alarmCount = 0;
            if (b.alarms.metal_detect > 0)
                alarmCount++;
            if (b.alarms.printer_error)
                alarmCount++;
            if (b.alarms.product_in_seal)
                alarmCount++;
            if (b.alarms.splice_detect)
                alarmCount++;
            return count + alarmCount;
        }, 0);
        res.json({
            success: true,
            machine_id: state.machine_id,
            last_updated: state.last_updated,
            summary: {
                weighers: {
                    total: state.weighers.length,
                    running: runningWeighers,
                    stopped: state.weighers.length - runningWeighers,
                    avg_bpm: Math.round(avgBpm * 10) / 10,
                    total_weight_kg: Math.round(totalWeight * 100) / 100,
                },
                bagmakers: {
                    total: state.bagmakers.length,
                    running: runningBagmakers,
                    stopped: state.bagmakers.length - runningBagmakers,
                    avg_efficiency: Math.round(avgEfficiency * 10) / 10,
                    total_good_bags: totalGoodBags,
                    total_bad_bags: totalBadBags,
                    reject_rate: totalGoodBags > 0
                        ? Math.round((totalBadBags / (totalGoodBags + totalBadBags)) * 10000) / 100
                        : 0,
                },
                alarms: {
                    active_count: activeAlarms,
                },
            },
        });
    }
    catch (err) {
        console.error(`GET /packing/machine/${req.params.machineId}/summary error:`, err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});
/* ===========================
   SIMULATION CONTROL ENDPOINTS
=========================== */
/**
 * GET /api/packing/simulation/status
 * Get simulation status
 */
r.get('/simulation/status', (_req, res) => {
    res.json({
        success: true,
        running: simulation.isSimulationRunning(),
        machines_count: simulation.getAllMachineStates().length,
    });
});
/**
 * POST /api/packing/simulation/start
 * Start the simulation engine
 */
r.post('/simulation/start', (_req, res) => {
    try {
        simulation.startSimulation();
        res.json({
            success: true,
            message: 'Simulation started',
            running: simulation.isSimulationRunning(),
        });
    }
    catch (err) {
        console.error('POST /packing/simulation/start error:', err);
        res.status(500).json({ success: false, message: 'Failed to start simulation' });
    }
});
/**
 * POST /api/packing/simulation/stop
 * Stop the simulation engine
 */
r.post('/simulation/stop', (_req, res) => {
    try {
        simulation.stopSimulation();
        res.json({
            success: true,
            message: 'Simulation stopped',
            running: simulation.isSimulationRunning(),
        });
    }
    catch (err) {
        console.error('POST /packing/simulation/stop error:', err);
        res.status(500).json({ success: false, message: 'Failed to stop simulation' });
    }
});
/**
 * POST /api/packing/simulation/reset
 * Reset all machines to initial state
 */
r.post('/simulation/reset', (_req, res) => {
    try {
        simulation.resetAllMachines();
        res.json({
            success: true,
            message: 'All machines reset to initial state',
        });
    }
    catch (err) {
        console.error('POST /packing/simulation/reset error:', err);
        res.status(500).json({ success: false, message: 'Failed to reset machines' });
    }
});
/**
 * POST /api/packing/machine/:machineId/reset
 * Reset a specific machine to initial state
 */
r.post('/machine/:machineId/reset', (req, res) => {
    try {
        const { machineId } = req.params;
        const success = simulation.resetMachine(machineId);
        if (!success) {
            return res.status(404).json({
                success: false,
                message: `Machine '${machineId}' not found`,
            });
        }
        res.json({
            success: true,
            message: `Machine '${machineId}' reset to initial state`,
        });
    }
    catch (err) {
        console.error(`POST /packing/machine/${req.params.machineId}/reset error:`, err);
        res.status(500).json({ success: false, message: 'Failed to reset machine' });
    }
});
/* ===========================
   PLANT-SCOPED ENDPOINTS
   (As per spec: /api/plant/:plantId/machine/:machineId/packing)
=========================== */
/**
 * GET /api/packing/plant/:plantId/machine/:machineId
 * Plant-scoped endpoint for machine state (spec compliant)
 */
r.get('/plant/:plantId/machine/:machineId', (req, res) => {
    try {
        const { plantId, machineId } = req.params;
        const state = simulation.getMachineState(machineId);
        if (!state) {
            return res.status(404).json({
                success: false,
                message: `Machine '${machineId}' not found in plant '${plantId}'`,
                available_machines: simulation.getAvailableMachineIds(),
            });
        }
        // Add plant context to response
        res.json({
            success: true,
            plant_id: plantId,
            data: state,
        });
    }
    catch (err) {
        console.error(`GET /packing/plant/${req.params.plantId}/machine/${req.params.machineId} error:`, err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});
exports.default = r;
