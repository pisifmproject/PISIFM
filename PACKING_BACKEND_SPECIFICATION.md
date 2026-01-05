# Packing Module - Backend Specification & Simulation Guide

This document outlines the detailed backend specifications for the Packing Module. The primary goal is to provide a robust, machine-isolated architecture where each production line (PC14, PC39, etc.) operates independently with its own set of variables. 

Additionally, this spec includes logic for a **Simulation Engine** to generate "alive" dummy data, ensuring the frontend displays realistic, fluctuating values.

---

## 1. Architecture: Machine Isolation

To ensure that PC14 does not affect PC39, and variables are distinct, the backend must use a **Machine-Centric Data Model**.

### 1.1 Data Structure (Schema)
Avoid a flat table. Use a hierarchical structure where the `machine_id` is the root key.

**Recommended Database Schema (PostgreSQL/NoSQL):**

```json
// Table: packing_machine_states
{
  "machine_id": "pc14", // PRIMARY KEY (VARCHAR)
  "last_updated": "2026-01-05T10:30:00Z",
  "config": {
    "weighers_count": 5,
    "bagmakers_count": 10
  },
  // Weigher State: Array of objects, distinct by index/id
  "weighers": [
    {
      "id": 1,
      "status": "RUNNING", 
      "bpm": 85.2,
      "total_weight": 12500,
      "giveaway_percent": 1.4,
      "std_dev": 0.5
    },
    // ... weigher 2, 3, 4, 5
  ],
  // Bagmaker State
  "bagmakers": [
    {
      "id": 1,
      "weigher_ref_id": 1, // Logical link
      "status": "RUNNING",
      "efficiency": {
        "total": 92.5,
        "weigher": 95.0,
        "bagmaker": 91.0
      },
      "bag_counts": {
        "good": 15400,
        "bad": 230
      },
      "alarms": {
        "metal_detect": 0,
        "printer_error": false,
        "product_in_seal": false,
        "splice_detect": false
      },
      "wasted_film_percent": 0.8
    }
    // ... bagmaker 2 to 10
  ]
}
```

### 1.2 Isolation Principle
*   **API Separation**: Requests should always be scoped: `/api/plant/:plantId/machine/:machineId/packing`.
*   **State Separation**: The background worker updating dummy data must iterate through machines and update them individually. An error in generating data for "PC39" must **not** crash the status of "PC14".

---

## 2. API Endpoints

### 2.1 Get Packing State
**GET** `/api/plant/:plantId/machine/:machineId/packing`

*   **Request**: `GET /api/plant/cikupa/machine/pc14/packing`
*   **Response**: Returns the full JSON object described in 1.1 for that specific machine.
*   **Logic**: 
    1.  Look up DB for `machine_id = 'pc14'`.
    2.  If missing, return 404 or (if simulation enabled) initialize default state.
    3.  Return JSON.

---

## 3. Simulation Engine ("Alive" Dummy Data)

To make the dashboard look real, we need a **Background Service** (using `setInterval` or Cron) that runs every **1-2 seconds**. This service updates the state of each machine in memory/database.

### 3.1 Simulation Rules (Per Machine)

For each supported machine (PC14: 5W/10BM, PC39: 11W/22BM, etc.), apply the following logic loop:

#### A. Status State Machine
Values shouldn't flow randomly. They should follow operational logic.
*   **Running (85% prob)**: Most units stay RUNNING.
*   **Simulate Downtime**:
    *   Every tick, there is a **0.5% chance** a unit goes `OFF` or `ON` (Idle).
    *   If `OFF`, there is a **5% chance** it turns back `ON` -> `RUNNING`.
*   **Cascade Effect**: If Weigher #1 goes `OFF`, connected Bagmakers (#1 & #2) should effectively go `IDLE` (Status 'ON') because they have no product flow.

#### B. Fluctuation Logic (Making it look "Alive")
Static numbers look fake. Use **Random Walk** or **Perlin Noise** logic.

*   **BPM (Speed)**:
    *   Target: 80 BPM.
    *   Logic: `current_bpm = current_bpm + (Math.random() - 0.5) * 2`.
    *   Clamp: Keep between 75 and 85.
*   **Total Weight / Bag Counts**:
    *   Must **increment** continuously if Status == RUNNING.
    *   `total_weight += (bpm * average_bag_weight / 60) * time_delta`.
*   **Efficiency**:
    *   Slowly drift. `eff = eff + (Math.random() - 0.5) * 0.1`.
    *   Clamp between 85% and 99%.

#### C. Alarms & Errors (Random Events)
*   **Metal Detect**:
    *   0.01% chance per tick to increment count.
*   **Printer Error / Product In Seal**:
    *   0.1% chance to toggle `true`.
    *   If `true`, 10% chance to resolve (toggle `false`) on next tick.

### 3.2 Machine-Specific Configurations
The simulation must respect these exact configurations. Do not use generic loops.

| Machine ID | Weighers | Bagmakers | Simulation Profile |
| :--- | :--- | :--- | :--- |
| **PC39** | 11 | 22 | High Speed (Target 90 BPM) |
| **PC14** | 5 | 10 | Standard (Target 80 BPM) |
| **Tortilla** | 7 | 14 | Low Speed (Target 60 BPM) |
| **TWS56** | 5 | 10 | Standard |
| **FCP** | 6 | 12 | Standard |
| **TWS72** | 10 | 20 | High Volume |
| **Copack** | 3 | 6 | Variable (Stop/Start often) |
| **Inhouse** | 5 | 10 | Standard |

---

## 4. Implementation Steps for Backend Developer

1.  **Create Service**: `src/services/packingSimulation.service.ts`
    *   Define `interface PackingState`.
    *   Create a `Map<string, PackingState>` to hold in-memory state for all machines.
    *   Implement `initializeMachines()` to populate the Map based on the config table above.
2.  **Simulation Loop**:
    *   `setInterval(() => updateStates(), 2000);`
    *   Inside `updateStates()`: Loop through every ID in the Map. Apply "Fluctuation Logic" (3.1.B).
3.  **Persistence (Optional)**:
    *   Every 1 minute, save the in-memory state to the Database (PostgreSQL) so data isn't lost on restart.
4.  **Route Integration**:
    *   In `lvmdp.router.ts` (or new `packing.router.ts`), connect the GET endpoint to return the current state from the Map.

---

### Example Dummy Data Generator Code (Snippet)

```typescript
function updateWeigher(weigher) {
  if (weigher.status === 'RUNNING') {
     // Drift BPM
     const drift = (Math.random() - 0.5) * 2;
     weigher.bpm = Math.max(70, Math.min(95, weigher.bpm + drift));
     
     // Increment Weight (assuming 2 seconds passed)
     // 80 bpm * 0.05kg chip bag * (2/60 minutes)
     weigher.total_weight += (weigher.bpm * 0.05 * (2/60)); 
  }
  
  // Random shutdown (rare)
  if (Math.random() > 0.999) weigher.status = 'OFF';
  else if (weigher.status === 'OFF' && Math.random() > 0.95) weigher.status = 'RUNNING';
  
  return weigher;
}
```
