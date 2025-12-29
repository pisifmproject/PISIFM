# LVMDP Implementation Summary

## Status: ✅ Complete

### Plants LVMDP Configuration

#### Plant 1: Cikupa (LVMDP Panel 1) - **REAL DATA**

- **Data Source**: `v_lvmdp_1` database view (real LVMDP hardware data)
- **Status**: ✅ Queries real data from database
- **Implementation**: [src/lvmdp/LVMDP_1/lvmdp_1.repository.ts](pisifmbe/src/lvmdp/LVMDP_1/lvmdp_1.repository.ts)
- **Endpoints**:
  - `GET /api/lvmdp/1/latest` - Real-time latest data
  - `GET /api/lvmdp/1/shift-avg` - Shift averages
  - `GET /api/lvmdp/1` - Historical data

#### Plant 2: Semarang (LVMDP Panel 2) - **DUMMY DATA (Realistic)**

- **Data Source**: Generated realistic dummy data with time-based load variations
- **Status**: ✅ Falls back to dummy data when real data unavailable
- **Implementation**: [src/lvmdp/LVMDP_2/lvmdp_2.repository.ts](pisifmbe/src/lvmdp/LVMDP_2/lvmdp_2.repository.ts)
- **Features**:
  - Time-based load simulation (Shift 1: 75%, Shift 2: 80%, Shift 3: 40%)
  - Realistic current values (1200-2400A based on load)
  - Voltage variations (380V ± 10V)
  - Power factor variation (0.81-0.95)
  - Frequency variation (49.75-50.25 Hz)

#### Plant 3: Cikokol (LVMDP Panel 3) - **DUMMY DATA (Realistic)**

- **Data Source**: Generated realistic dummy data with time-based load variations
- **Status**: ✅ Falls back to dummy data when real data unavailable
- **Implementation**: [src/lvmdp/LVMDP_3/lvmdp_3.repository.ts](pisifmbe/src/lvmdp/LVMDP_3/lvmdp_3.repository.ts)
- **Features**:
  - Time-based load simulation (Shift 1: 70%, Shift 2: 75%, Shift 3: 35%)
  - Realistic current values (1000-2000A based on load)
  - Voltage variations (380V ± 12V)
  - Power factor variation (0.80-0.94)
  - Frequency variation (49.70-50.30 Hz)

#### Plant 4: Agro (LVMDP Panel 4) - **DUMMY DATA (Realistic)**

- **Data Source**: Generated realistic dummy data with time-based load variations
- **Status**: ✅ Falls back to dummy data when real data unavailable
- **Implementation**: [src/lvmdp/LVMDP_4/lvmdp_4.repository.ts](pisifmbe/src/lvmdp/LVMDP_4/lvmdp_4.repository.ts)
- **Features**:
  - Time-based load simulation (Shift 1: 72%, Shift 2: 78%, Shift 3: 32%)
  - Realistic current values (900-1800A based on load)
  - Voltage variations (380V ± 11V)
  - Power factor variation (0.79-0.94)
  - Frequency variation (49.725-50.275 Hz)

### Data Flow Architecture

```
Frontend (Vue.js)
    ↓
useLvmdpLive(panelId)
    ↓
getLvmdpLatest(panelId)
    ↓
/api/lvmdp/:id/latest (Express Router)
    ↓
findLatestLVMDP[1-4]() (Repository)
    ↓
├─ Try: Query from v_lvmdp_[1-4] (Real Data)
│  └─ Success: Return mapped database row
│
└─ Catch: Generate dummy data
   └─ Return realistic dummy data with time-based variations
    ↓
Socket.IO polling (1 second interval)
    ↓
Real-time gauge updates on frontend
```

### Dummy Data Characteristics

All dummy plants generate **realistic non-zero values** with:

1. **Time-Based Load Variation**

   - Shift 1 (07:00-14:30): 70-75% load
   - Shift 2 (14:31-22:00): 75-80% load
   - Shift 3 (22:01-07:00): 32-40% load (minimal operations)

2. **Random Variations** (±5-12% fluctuation)

   - Prevents monotonous data
   - Simulates real-world equipment variability

3. **Cross-Phase Balance** (±12% per phase)

   - Realistic three-phase current distribution
   - 33% ± variation per phase

4. **Parameter Ranges**
   - Current: 900-2400A (varies by plant)
   - Voltage: 370-390V line-to-line
   - Power Factor: 0.79-0.95 (industrial standard)
   - Frequency: 49.5-50.5 Hz (within tolerance)
   - Power: 500-1800 kW (varies by plant capacity)

### Backend Server Initialization

The server automatically:

1. ✅ Runs all LVMDP polling on startup
2. ✅ Connects Socket.IO for real-time updates
3. ✅ Gracefully handles missing database views (fallback to dummy data)
4. ✅ Maintains 1-second polling interval for all 4 panels

### Testing the Implementation

```bash
# Backend
cd pisifmbe
npm run dev  # Starts polling for all 4 LVMDP panels

# Frontend
cd pisifmfe/frontend
npm run dev  # Connects and displays real/dummy data

# Test endpoints
curl http://localhost:3001/api/lvmdp/1/latest  # Cikupa (real)
curl http://localhost:3001/api/lvmdp/2/latest  # Semarang (dummy)
curl http://localhost:3001/api/lvmdp/3/latest  # Cikokol (dummy)
curl http://localhost:3001/api/lvmdp/4/latest  # Agro (dummy)
```

### Future Enhancements

- [ ] Connect actual LVMDP hardware for Panels 2-4
- [ ] Add data persistence for dummy data in database
- [ ] Add configurable dummy data parameters per plant
- [ ] Implement data quality indicators (real vs. simulated)
- [ ] Add historical dummy data generation for reports
