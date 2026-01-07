"use strict";
// src/packing/packing.services.ts
// Service layer for Packing Module - wraps simulation service
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMachineState = getMachineState;
exports.getAllMachineStates = getAllMachineStates;
exports.getAvailableMachineIds = getAvailableMachineIds;
exports.calculateEfficiency = calculateEfficiency;
exports.getPackingSummary = getPackingSummary;
const simulation = __importStar(require("./packingSimulation.service"));
/**
 * Get state for a specific machine
 */
function getMachineState(machineId) {
    return simulation.getMachineState(machineId);
}
/**
 * Get all machine states
 */
function getAllMachineStates() {
    return simulation.getAllMachineStates();
}
/**
 * Get available machine IDs
 */
function getAvailableMachineIds() {
    return simulation.getAvailableMachineIds();
}
/**
 * Calculate efficiency for packing line
 */
function calculateEfficiency(actual, target) {
    if (target === 0)
        return 0;
    return (actual / target) * 100;
}
/**
 * Get packing summary for a machine
 */
function getPackingSummary(machineId) {
    const state = simulation.getMachineState(machineId);
    if (!state)
        return null;
    const runningWeighers = state.weighers.filter(w => w.status === 'RUNNING').length;
    const runningBagmakers = state.bagmakers.filter(b => b.status === 'RUNNING').length;
    const avgBpm = state.weighers.length > 0
        ? state.weighers.reduce((sum, w) => sum + w.bpm, 0) / state.weighers.length
        : 0;
    const totalGoodBags = state.bagmakers.reduce((sum, b) => sum + b.bag_counts.good, 0);
    const totalBadBags = state.bagmakers.reduce((sum, b) => sum + b.bag_counts.bad, 0);
    return {
        machine_id: state.machine_id,
        last_updated: state.last_updated,
        weighers: {
            total: state.weighers.length,
            running: runningWeighers,
        },
        bagmakers: {
            total: state.bagmakers.length,
            running: runningBagmakers,
        },
        production: {
            avg_bpm: Math.round(avgBpm * 10) / 10,
            total_good_bags: totalGoodBags,
            total_bad_bags: totalBadBags,
        },
    };
}
