# Workspace Structure V2

## Frontend Structure (Vue 3 + TypeScript)

The frontend has been refactored into a domain-driven modular architecture to support dynamic multi-plant rendering.

### Key Directories & Files

- **`src/config/app.config.ts`**: The single source of truth for Plant and Machine configurations. It defines the 4 plants (Cikokol, Semarang, Cikupa, Agro) and their respective machines. It also controls the `useRealData` flag per plant.

- **`src/modules/`**: Feature-based modules containing views, services, and models.
  - **`global/`**: Contains the Corporate Dashboard (`GlobalDashboard.vue`) which aggregates data from all plants.
  - **`plant/`**: Contains the Plant Dashboard (`PlantDashboard.vue`) acting as the landing page for each plant.
  - **`energy/`**: Handles all Energy & Utility features.
    - `views/ElectricalDashboard.vue`: Summary of LVMDPs.
    - `views/LVMDPDetail.vue`: Dynamic detail view for specific LVMDP panels (Real/Dummy).
    - `services/lvmdp.service.ts`: Service handling real-time polling and dummy data generation.
  - **`production/`**: Handles Production Line monitoring.
    - `views/ProductionDashboard.vue`: List of machines per plant.
    - `views/MachineDetail.vue`: Dynamic detail view for machines.

- **`src/shared/`**: Shared resources.
  - **`components/`**: Reusable UI components like `AppSidebar.vue` (dynamic navigation), `AppHeader.vue` (breadcrumbs), and `GaugeSimple.vue`.
  - **`layouts/`**: `MainLayout.vue` provides the shell (Sidebar + Header + Content Area) for authenticated pages.

- **`src/router/index.ts`**: Completely rewritten router using nested routes and route parameters (`:plantId`) to dynamically render views based on the selected plant. It enforces authentication guards.

- **`src/lib/api.ts`**: Axios instance configured to communicate with the Backend API on port 3000.

- **`src/style.css`**: Defines the "Corporate Dark Theme" using CSS variables for consistent coloring (Slate/Blue palette) and global styles.

### Entry Points
- **`main.ts`**: Bootstraps the Vue app, Pinia, Router, and global styles.
- **`App.vue`**: Root component rendering the router view.

---

## Backend Structure (Node.js + TypeScript + Express + Drizzle ORM)

The backend has been refactored to support a **dynamic multi-plant architecture** with four plants: **semarang**, **cikokol**, **cikupa**, and **agro**. Only **cikupa** uses real LVMDP data from the database; other plants return structured dummy data with identical schemas.

### Core Principles
- **Port 3000**: Backend runs exclusively on port 3000 (port 2000 removed)
- **Plant-centric routing**: All endpoints accept `plantId` parameter validated against the four allowed values
- **Backward compatibility**: Existing Cikupa LVMDP real-time data pipeline remains intact
- **Database-driven metadata**: Plants and machines are stored in database tables, making the frontend dynamic
- **Idempotent seeding**: Plant and machine data is automatically seeded on server startup if not present

---

### Entry Points

#### **`src/server.ts`**
Main server entry point. Creates HTTP server, initializes WebSocket (Socket.IO), starts cron schedulers (hourly, daily, electrical reports), starts LVMDP real-time polling for panels 1-4, and seeds plants/machines on startup. **Runs on port 3000**.

#### **`src/index.ts`**
Express app configuration. Sets up CORS, middleware, and registers all route modules including the new multi-plant routes (`/api/metadata`, `/api/global`, `/api/plants`).

#### **`src/socket.ts`**
WebSocket (Socket.IO) initialization. Manages room-based subscriptions for LVMDP panels (`lvmdp:1` through `lvmdp:4`). Clients join rooms to receive real-time updates.

---

### Multi-Plant Core

#### **`src/shared/types/plant.types.ts`**
TypeScript types and constants for the four plant IDs. Exports `PlantId` type, `VALID_PLANT_IDS` array, and `isValidPlantId()` validation helper.

#### **`src/shared/middleware/plantValidator.ts`**
Express middleware for validating `plantId` and `machineId` route parameters. Returns 400 error if invalid plant/machine ID is provided.

#### **`src/shared/services/plant.service.ts`**
Service layer for querying plant and machine metadata from database. Functions: `getAllPlants()`, `getPlantById()`, `getMachinesByPlant()`, `getMachineById()`, `getAllMachines()`.

#### **`src/db/seedPlantsAndMachines.ts`**
Idempotent seed script that inserts the four plants and their machines into the database if they don't exist. Runs automatically on server startup. Machine IDs are deterministic slugs: `{plantId}-{machine-name-kebab}`.

---

### Database Schema & Migrations

#### **`src/db/schema.ts`**
Drizzle ORM schema definitions. Includes:
- **`plants`** table: Stores plantId, displayName, location, status, hasRealData flag, installedCapacityKva
- **`machines`** table: Stores machineId, plantId (FK), machineName, machineType, status
- **`user`** table: User authentication
- **`dailyReportLVMDP1-4`** tables: Shift-based daily aggregations for LVMDP panels
- **`hourlyReportLVMDP1-4`** tables: Hourly aggregations for performance
- **`dailyElectricalReports`** table: ISO 50001 compliant electrical reporting
- Production/packing line tables (existing)

#### **`src/db/index.ts`**
Database connection using Drizzle ORM with PostgreSQL driver.

#### **`drizzle/0014_add_plants_and_machines.sql`**
Migration file that creates `plants` and `machines` tables with proper indexes and foreign key constraints.

---

### API Routes

#### **`src/routes/metadata.router.ts`**
Exposes plant and machine metadata to frontend:
- `GET /api/metadata/plants` - List all plants
- `GET /api/metadata/plants/:plantId` - Get single plant
- `GET /api/metadata/plants/:plantId/machines` - Get machines for a plant
- `GET /api/metadata/machines` - Get all machines across all plants

#### **`src/routes/global.router.ts`**
Global corporate dashboard aggregating metrics across all four plants:
- `GET /api/global/dashboard` - Returns summary (total energy, avg utilization, active alarms) and per-plant summaries

#### **`src/routes/plant.router.ts`**
Plant-specific dashboard with comprehensive metrics:
- `GET /api/plants/:plantId/dashboard` - Returns plant summary, utilities consumption (electricity, steam, water, compressed air, nitrogen, gas), shift performance, active alarms, production lines, and packing lines

#### **`src/routes/lvmdp.router.ts`**
LVMDP real-time data endpoint (Cikupa only):
- `GET /api/lvmdp/:id/latest` - Get latest data for LVMDP panel 1-4 (real data for Cikupa)

#### **`src/routes/summary.router.ts`**
Electrical summary endpoint:
- `GET /api/summary/electrical` - Real-time summary from all LVMDP panels with kVA calculations

#### **`src/routes/dailyReport.router.ts`**
Daily report endpoints for LVMDP panels (shift-based aggregations).

#### **`src/routes/hourlyReport.router.ts`**
Hourly report endpoints for LVMDP panels (hourly aggregations).

#### **`src/routes/electricalReport.router.ts`**
Professional electrical reporting system (ISO 50001 compliant).

---

### LVMDP Real-Time Data Pipeline (Cikupa)

#### **`src/lvmdp/LVMDP_1/` through `LVMDP_4/`**
Each LVMDP panel has its own module with:
- **`lvmdp_X.repository.ts`**: Raw SQL queries against database views (`v_lvmdp_1` through `v_lvmdp_4`)
- **`lvmdp_X.services.ts`**: Business logic and data transformation
- **`lvmdp_X.controller.ts`**: Express route handlers
- **`lvmdp_X.dailyReport.*`**: Daily report generation (shift-based)
- **`lvmdp_X.hourlyReport.*`**: Hourly report generation

#### **`src/lvmdp/lvmdpPoller.ts`**
Real-time polling service that fetches latest LVMDP data every second and emits to WebSocket rooms. Only emits when data changes to reduce network traffic.

---

### Cron Jobs

#### **`src/cron/hourlyReportScheduler.ts`**
Runs every hour at :05 to generate hourly aggregation reports for all LVMDP panels.

#### **`src/cron/dailyReportScheduler.ts`**
Runs daily at 00:05 to generate shift-based daily reports for previous day.

#### **`src/cron/electricalReportScheduler.ts`**
Runs daily at 00:05 to aggregate electrical data for ISO 50001 compliance reporting.

#### **`src/cron/electricalReportAggregation.ts`**
Business logic for electrical report aggregation using trapezoid integration for energy calculations.

---

### Other Modules

#### **`src/user/`**
User authentication module (controller, service, repository).

#### **`src/utility/`**
Utility consumption tracking (electricity, water, steam, air, nitrogen, gas). Currently returns mock data for all plants except where LVMDP provides real electrical data.

#### **`src/production/`**
Production line monitoring (OEE, availability, performance, quality metrics). Returns mock data.

#### **`src/packing/`**
Packing line monitoring (efficiency, pack counts, weight metrics). Returns mock data.

#### **`src/electricalReport/`**
Professional electrical reporting service with ISO 50001 compliance.

#### **`src/utils/pgTimezoneFix.ts`**
PostgreSQL timezone handling fix to ensure consistent date/time handling.

---

### Configuration Files

#### **`package.json`**
Dependencies: Express, Socket.IO, Drizzle ORM, node-cron, pg, nanoid, cors, dotenv.
Scripts: `dev` (ts-node-dev), `build` (tsc), `start` (node dist/server.js).

#### **`tsconfig.json`**
TypeScript compiler configuration.

#### **`drizzle.config.ts`**
Drizzle Kit configuration for migrations and schema management.

#### **`.env`**
Environment variables (DATABASE_URL, PORT). **Port must be 3000**.

---

## Complete Workspace Tree

```
NewSmartMonitoringPlant/
├── Documentation/
│   └── WORKSPACE_STRUCTURE_V2.md          # This file
├── apache-config/
│   └── pisifm.conf                         # Apache reverse proxy config (port 3000)
├── pisifmbe/                               # Backend
│   ├── drizzle/                            # Database migrations
│   │   ├── 0014_add_plants_and_machines.sql
│   │   └── ... (other migrations)
│   ├── src/
│   │   ├── server.ts                       # Main entry point
│   │   ├── index.ts                        # Express app setup
│   │   ├── socket.ts                       # WebSocket initialization
│   │   ├── shared/                         # Shared multi-plant code
│   │   │   ├── types/
│   │   │   │   └── plant.types.ts          # Plant type definitions
│   │   │   ├── middleware/
│   │   │   │   └── plantValidator.ts       # Plant/machine validation
│   │   │   └── services/
│   │   │       └── plant.service.ts        # Plant metadata service
│   │   ├── routes/                         # API routes
│   │   │   ├── metadata.router.ts          # Plant/machine metadata
│   │   │   ├── global.router.ts            # Global dashboard
│   │   │   ├── plant.router.ts             # Plant-specific dashboard
│   │   │   ├── lvmdp.router.ts             # LVMDP real-time data
│   │   │   ├── summary.router.ts           # Electrical summary
│   │   │   ├── dailyReport.router.ts       # Daily reports
│   │   │   ├── hourlyReport.router.ts      # Hourly reports
│   │   │   └── electricalReport.router.ts  # Electrical reports
│   │   ├── lvmdp/                          # LVMDP modules (Cikupa real data)
│   │   │   ├── LVMDP_1/                    # Panel 1
│   │   │   ├── LVMDP_2/                    # Panel 2
│   │   │   ├── LVMDP_3/                    # Panel 3
│   │   │   ├── LVMDP_4/                    # Panel 4
│   │   │   └── lvmdpPoller.ts              # Real-time polling service
│   │   ├── cron/                           # Scheduled jobs
│   │   │   ├── hourlyReportScheduler.ts
│   │   │   ├── dailyReportScheduler.ts
│   │   │   ├── electricalReportScheduler.ts
│   │   │   └── electricalReportAggregation.ts
│   │   ├── db/                             # Database
│   │   │   ├── index.ts                    # DB connection
│   │   │   ├── schema.ts                   # Drizzle schema
│   │   │   └── seedPlantsAndMachines.ts    # Seed script
│   │   ├── user/                           # User auth module
│   │   ├── utility/                        # Utility consumption
│   │   ├── production/                     # Production monitoring
│   │   ├── packing/                        # Packing monitoring
│   │   ├── electricalReport/               # Electrical reporting
│   │   ├── dailyReport/                    # Daily report logic
│   │   └── utils/                          # Utilities
│   ├── package.json
│   ├── tsconfig.json
│   └── drizzle.config.ts
└── pisifmfe/                               # Frontend (see above)
    └── frontend/
        ├── src/
        │   ├── main.ts
        │   ├── App.vue
        │   ├── router/index.ts
        │   ├── config/app.config.ts
        │   ├── modules/
        │   │   ├── global/                 # Global dashboard
        │   │   ├── plant/                  # Plant dashboard
        │   │   ├── energy/                 # Energy/LVMDP
        │   │   ├── production/             # Production
        │   │   └── auth/                   # Authentication
        │   ├── shared/
        │   │   ├── components/             # Reusable components
        │   │   └── layouts/                # Layout templates
        │   ├── lib/api.ts                  # Axios instance
        │   └── style.css                   # Global styles
        ├── package.json
        └── vite.config.ts
```

---

## Key Implementation Notes

### Multi-Plant Data Strategy
- **Cikupa (plantId: "cikupa")**: Uses real LVMDP data from database views `v_lvmdp_1` through `v_lvmdp_4`. Real-time WebSocket polling active.
- **Other plants (semarang, cikokol, agro)**: Return structured dummy data with identical field names and schemas as Cikupa, allowing frontend to render uniformly without conditional logic.

### WebSocket Rooms
- Rooms are named `lvmdp:1`, `lvmdp:2`, `lvmdp:3`, `lvmdp:4` for the four LVMDP panels
- Clients join rooms via `lvmdp:join` event with `{ id: 1-4 }`
- Server emits `lvmdp:raw` events with latest data when changes detected
- Backward compatible with existing Cikupa frontend

### API Consistency
All endpoints return consistent JSON structure:
```json
{
  "success": true,
  "data": { ... }
}
```

### Database Tables
- **plants**: 4 rows (semarang, cikokol, cikupa, agro)
- **machines**: ~35 rows total across all plants
- Machine IDs are stable slugs: e.g., `cikupa-pc-39`, `semarang-pc-14`

### Port Configuration
- Backend: **3000** (changed from 2000)
- Apache proxy: Forwards `/api` and `/socket.io` to `localhost:3000`
- All test files and scripts updated to reference port 3000

---

## Running the System

### Backend
```bash
cd pisifmbe
npm install
npm run dev          # Development with hot reload
npm run build        # Compile TypeScript
npm start            # Production (requires build first)
```

### Database Migration
```bash
cd pisifmbe
npm run drizzle:migrate    # Run pending migrations
```

### Seeding
Plants and machines are automatically seeded on server startup. To manually seed:
```bash
cd pisifmbe
npx ts-node src/db/seedPlantsAndMachines.ts
```

---

**Last Updated**: 2025-12-27  
**Architecture Version**: V2 (Multi-Plant)

