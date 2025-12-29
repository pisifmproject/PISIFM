# LVMDP Dummy Data Generator - Technical Reference

## Overview

The dummy data generator provides realistic electrical parameter simulation for LVMDP panels when real hardware data is unavailable.

## Implementation Details

### Dummy Data Generator Code Pattern

```typescript
/**
 * Generate realistic dummy data untuk plant yang tidak punya real LVMDP data
 */
function generateDummyLvmdp[N]Data(): Lvmdp[N]Row {
  const now = new Date();
  const baseHour = now.getHours();

  // Simulasi beban yang bervariasi berdasarkan waktu operasi
  let loadFactor = 0.6; // default 60% load
  if (baseHour >= 7 && baseHour < 15) loadFactor = 0.XX; // shift 1
  else if (baseHour >= 15 && baseHour < 22) loadFactor = 0.XX; // shift 2
  else if (baseHour >= 22 || baseHour < 7) loadFactor = 0.XX; // shift 3

  // Add small random variation (±10%)
  loadFactor += (Math.random() - 0.5) * 0.XX;
  loadFactor = Math.max(0.2, Math.min(1.0, loadFactor));

  const avgCurrent = BASE_CURRENT + (BASE_CURRENT * loadFactor) + (Math.random() - 0.5) * VARIATION;
  const avgLineLine = 380 + (Math.random() - 0.5) * VOLTAGE_VAR;
  const cosPhi = 0.87 + (Math.random() - 0.5) * PF_VAR;
  const freq = 50 + (Math.random() - 0.5) * FREQ_VAR;

  return {
    waktu: now,
    totalKwh: BASE_KWH + Math.random() * KWH_VARIATION,
    realPower: (Math.sqrt(3) * avgLineLine * avgCurrent * cosPhi) / 1000 + (Math.random() - 0.5) * POWER_VAR,
    cosPhi: cosPhi,
    freq: freq,
    avgLineLine: avgLineLine,
    avgLineNeut: 220 + (Math.random() - 0.5) * NEUTRAL_VAR,
    avgCurrent: avgCurrent,
    currentR: avgCurrent * (0.33 + (Math.random() - 0.5) * 0.12),
    currentS: avgCurrent * (0.33 + (Math.random() - 0.5) * 0.12),
    currentT: avgCurrent * (0.34 + (Math.random() - 0.5) * 0.12),
    voltageRS: avgLineLine + (Math.random() - 0.5) * LINE_VAR,
    voltageST: avgLineLine + (Math.random() - 0.5) * LINE_VAR,
    voltageTR: avgLineLine + (Math.random() - 0.5) * LINE_VAR,
  };
}
```

## Plant-Specific Parameters

### Plant 1: Cikupa (Panel 1)

- **Configuration**: Real Data from Database
- **Fallback**: None (queries v_lvmdp_1 directly)
- **Status**: Production

### Plant 2: Semarang (Panel 2)

- **Base Current**: 1200 A
- **Current Range**: 1200-2400 A
- **Shift 1 Load**: 75%
- **Shift 2 Load**: 80%
- **Shift 3 Load**: 40%
- **Current Variation**: ±100 A
- **Voltage Variation**: ±10 V
- **Power Factor Range**: 0.81-0.93
- **Frequency Variation**: ±0.5 Hz
- **Total kWh Range**: 125,000-135,000
- **Files**: [LVMDP_2/lvmdp_2.repository.ts](pisifmbe/src/lvmdp/LVMDP_2/lvmdp_2.repository.ts)

### Plant 3: Cikokol (Panel 3)

- **Base Current**: 1000 A
- **Current Range**: 1000-2000 A
- **Shift 1 Load**: 70%
- **Shift 2 Load**: 75%
- **Shift 3 Load**: 35%
- **Current Variation**: ±80 A
- **Voltage Variation**: ±12 V
- **Power Factor Range**: 0.80-0.94
- **Frequency Variation**: ±0.6 Hz
- **Total kWh Range**: 98,000-106,000
- **Files**: [LVMDP_3/lvmdp_3.repository.ts](pisifmbe/src/lvmdp/LVMDP_3/lvmdp_3.repository.ts)

### Plant 4: Agro (Panel 4)

- **Base Current**: 900 A
- **Current Range**: 900-1800 A
- **Shift 1 Load**: 72%
- **Shift 2 Load**: 78%
- **Shift 3 Load**: 32%
- **Current Variation**: ±70 A
- **Voltage Variation**: ±11 V
- **Power Factor Range**: 0.79-0.94
- **Frequency Variation**: ±0.55 Hz
- **Total kWh Range**: 87,000-94,000
- **Files**: [LVMDP_4/lvmdp_4.repository.ts](pisifmbe/src/lvmdp/LVMDP_4/lvmdp_4.repository.ts)

## Key Features

### 1. No Zero Values

- Minimum current: 500 A (even during night shift)
- Ensures realistic visualization on gauges
- Avoids misleading "no data" perception

### 2. Three-Phase Simulation

- Each phase gets ~33% of total current (±12% variation)
- Balances L1, L2, L3 current distribution
- Realistic voltage drop patterns

### 3. Load Factor Adaptation

```
Operating Hours    Load Factor    Use Case
7:00 - 14:30       70-80%        Peak production shift
14:30 - 22:00      75-80%        2nd shift (high production)
22:00 - 7:00       32-40%        Night shift (minimal ops)
```

### 4. Real-Time Variation

- ±5-12% random fluctuation every second
- Simulates equipment variability
- Prevents monotonous gauge behavior

### 5. Power Calculation

Formula: `P = √3 × VLL × I × cos(φ) / 1000` (watts to kW)

Example for Plant 2:

- VLL: 380V
- I: 1800A (75% load)
- cos(φ): 0.88
- P = 1.732 × 380 × 1800 × 0.88 / 1000 ≈ 1050 kW

## Integration Points

### In Server Startup

```typescript
// src/server.ts
startLvmdpPolling(1, findLatestLVMDP1, 1000);
startLvmdpPolling(2, findLatestLVMDP2, 1000);
startLvmdpPolling(3, findLatestLVMDP3, 1000);
startLvmdpPolling(4, findLatestLVMDP4, 1000);
```

### In Repository

```typescript
export async function findLatestLVMDP2() {
  try {
    const result = await db.execute(
      sql`SELECT * FROM public.v_lvmdp_2 ORDER BY waktu DESC LIMIT 1`
    );
    const rows = (result as any).rows || result;
    const row = Array.isArray(rows) ? rows[0] : null;
    if (row) return mapRow(row);
  } catch (error) {
    console.warn("[LVMDP2] Real data not available, using dummy data");
  }

  // Return dummy data jika real data tidak tersedia
  return generateDummyLvmdp2Data();
}
```

## Frontend Consumption

### Via useLvmdpLive Composable

```typescript
const { power, apparentPower, voltage, avgCurrent, cosPhi } =
  useLvmdpLive(panelId);

// Automatic calculations:
// S = √3 × VLL × I / 1000 (kVA)
// P = S × cos(φ) (kW)
// Q = √(S² - P²) (kVAR)
```

### API Endpoints

```
GET /api/lvmdp/1/latest  → Real data from v_lvmdp_1
GET /api/lvmdp/2/latest  → Dummy data (fallback)
GET /api/lvmdp/3/latest  → Dummy data (fallback)
GET /api/lvmdp/4/latest  → Dummy data (fallback)
```

## Customization Guide

To adjust dummy data for a specific plant:

1. **Modify Load Factors**

   ```typescript
   if (baseHour >= 7 && baseHour < 15) loadFactor = 0.XX; // Change 0.XX to desired %
   ```

2. **Adjust Current Range**

   ```typescript
   const avgCurrent = NEW_BASE + NEW_BASE * loadFactor + variation;
   ```

3. **Modify Voltage Variation**

   ```typescript
   const avgLineLine = DESIRED_V + (Math.random() - 0.5) * NEW_VAR;
   ```

4. **Update Power Factor**
   ```typescript
   const cosPhi = DESIRED_PF + (Math.random() - 0.5) * NEW_VAR;
   ```

## Performance Notes

- **Update Frequency**: 1 second (configurable in lvmdpPoller.ts)
- **Memory Impact**: Negligible (single row object per panel)
- **CPU Impact**: <0.1% per panel (simple calculations)
- **Network**: ~1 KB per update × 4 panels = ~4 KB/s

## Troubleshooting

### Dummy data not appearing

1. Check if v*lvmdp*[N] view doesn't exist in database
2. Verify no database connection errors in server logs
3. Confirm dummy data generator function is called

### Values seem unrealistic

1. Verify load factors match your shift schedule
2. Check power calculation formula
3. Ensure no hardcoded limits are blocking values

### Gauges show zero

1. Verify `toNumber()` function handles null/undefined
2. Check minimum value constraints in gauge component
3. Confirm dummy data minimum values > 0
