// src/db/schema.ts
import {
  pgTable,
  text,
  timestamp,
  doublePrecision,
  date,
  integer,
  boolean,
  jsonb,
  serial,
  unique,
} from "drizzle-orm/pg-core";

/* ===========================
   USER TABLE
=========================== */
export const user = pgTable("User", {
  id: text("id").primaryKey().notNull(),
  email: text("email").notNull(),
  name: text("name"),
});

/* ===========================
   MULTI-PLANT TABLES
=========================== */

/** Plants table - stores the four plants */
export const plants = pgTable("plants", {
  plantId: text("plant_id").primaryKey().notNull(),
  displayName: text("display_name").notNull(),
  location: text("location"),
  status: text("status").default("active").notNull(),
  hasRealData: boolean("has_real_data").default(false).notNull(),
  installedCapacityKva: doublePrecision("installed_capacity_kva").default(0),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/** Machines table - stores all machines across all plants */
export const machines = pgTable("machines", {
  machineId: text("machine_id").primaryKey().notNull(),
  plantId: text("plant_id").notNull().references(() => plants.plantId, { onDelete: "cascade" }),
  machineName: text("machine_name").notNull(),
  machineType: text("machine_type"), // 'production', 'packing', etc.
  lineCategory: text("line_category"), // optional grouping
  status: text("status").default("active").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/* ===========================
      VIEW LVMDP_1..4
   (READ ONLY - Exist in DB, managed externally)
   Do not create/modify - only for reading data
=========================== */

// Views sudah ada di database, tidak perlu didefinisikan ulang di schema
// Kita hanya baca data dari views ini menggunakan raw SQL
// Lihat: lvmdp_1.repository.ts, lvmdp_2.repository.ts, etc

/* ===========================
   DAILY REPORT TABLES
   (Menyimpan avg per shift per hari)
=========================== */

/** Daily Report LVMDP 1 */
export const dailyReportLVMDP1 = pgTable("daily_report_lvmdp_1", {
  id: text("id").primaryKey(),

  reportDate: date("report_date").notNull().unique(),

  shift1Count: integer("shift1_count").default(0),
  shift1TotalKwh: doublePrecision("shift1_total_kwh").default(0),
  shift1AvgKwh: doublePrecision("shift1_avg_kwh").default(0),
  shift1AvgCurrent: doublePrecision("shift1_avg_current").default(0),
  shift1MinCurrent: doublePrecision("shift1_min_current").default(0),
  shift1MaxCurrent: doublePrecision("shift1_max_current").default(0),
  shift1AvgCosPhi: doublePrecision("shift1_avg_cos_phi").default(0),

  shift2Count: integer("shift2_count").default(0),
  shift2TotalKwh: doublePrecision("shift2_total_kwh").default(0),
  shift2AvgKwh: doublePrecision("shift2_avg_kwh").default(0),
  shift2AvgCurrent: doublePrecision("shift2_avg_current").default(0),
  shift2MinCurrent: doublePrecision("shift2_min_current").default(0),
  shift2MaxCurrent: doublePrecision("shift2_max_current").default(0),
  shift2AvgCosPhi: doublePrecision("shift2_avg_cos_phi").default(0),

  shift3Count: integer("shift3_count").default(0),
  shift3TotalKwh: doublePrecision("shift3_total_kwh").default(0),
  shift3AvgKwh: doublePrecision("shift3_avg_kwh").default(0),
  shift3AvgCurrent: doublePrecision("shift3_avg_current").default(0),
  shift3MinCurrent: doublePrecision("shift3_min_current").default(0),
  shift3MaxCurrent: doublePrecision("shift3_max_current").default(0),
  shift3AvgCosPhi: doublePrecision("shift3_avg_cos_phi").default(0),

  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

/** Daily Report LVMDP 2 */
export const dailyReportLVMDP2 = pgTable("daily_report_lvmdp_2", {
  id: text("id").primaryKey(),

  reportDate: date("report_date").notNull().unique(),

  shift1Count: integer("shift1_count").default(0),
  shift1TotalKwh: doublePrecision("shift1_total_kwh").default(0),
  shift1AvgKwh: doublePrecision("shift1_avg_kwh").default(0),
  shift1AvgCurrent: doublePrecision("shift1_avg_current").default(0),
  shift1MinCurrent: doublePrecision("shift1_min_current").default(0),
  shift1MaxCurrent: doublePrecision("shift1_max_current").default(0),
  shift1AvgCosPhi: doublePrecision("shift1_avg_cos_phi").default(0),

  shift2Count: integer("shift2_count").default(0),
  shift2TotalKwh: doublePrecision("shift2_total_kwh").default(0),
  shift2AvgKwh: doublePrecision("shift2_avg_kwh").default(0),
  shift2AvgCurrent: doublePrecision("shift2_avg_current").default(0),
  shift2MinCurrent: doublePrecision("shift2_min_current").default(0),
  shift2MaxCurrent: doublePrecision("shift2_max_current").default(0),
  shift2AvgCosPhi: doublePrecision("shift2_avg_cos_phi").default(0),

  shift3Count: integer("shift3_count").default(0),
  shift3TotalKwh: doublePrecision("shift3_total_kwh").default(0),
  shift3AvgKwh: doublePrecision("shift3_avg_kwh").default(0),
  shift3AvgCurrent: doublePrecision("shift3_avg_current").default(0),
  shift3MinCurrent: doublePrecision("shift3_min_current").default(0),
  shift3MaxCurrent: doublePrecision("shift3_max_current").default(0),
  shift3AvgCosPhi: doublePrecision("shift3_avg_cos_phi").default(0),

  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

/** Daily Report LVMDP 3 */
export const dailyReportLVMDP3 = pgTable("daily_report_lvmdp_3", {
  id: text("id").primaryKey(),

  reportDate: date("report_date").notNull().unique(),

  shift1Count: integer("shift1_count").default(0),
  shift1TotalKwh: doublePrecision("shift1_total_kwh").default(0),
  shift1AvgKwh: doublePrecision("shift1_avg_kwh").default(0),
  shift1AvgCurrent: doublePrecision("shift1_avg_current").default(0),
  shift1MinCurrent: doublePrecision("shift1_min_current").default(0),
  shift1MaxCurrent: doublePrecision("shift1_max_current").default(0),
  shift1AvgCosPhi: doublePrecision("shift1_avg_cos_phi").default(0),

  shift2Count: integer("shift2_count").default(0),
  shift2TotalKwh: doublePrecision("shift2_total_kwh").default(0),
  shift2AvgKwh: doublePrecision("shift2_avg_kwh").default(0),
  shift2AvgCurrent: doublePrecision("shift2_avg_current").default(0),
  shift2MinCurrent: doublePrecision("shift2_min_current").default(0),
  shift2MaxCurrent: doublePrecision("shift2_max_current").default(0),
  shift2AvgCosPhi: doublePrecision("shift2_avg_cos_phi").default(0),

  shift3Count: integer("shift3_count").default(0),
  shift3TotalKwh: doublePrecision("shift3_total_kwh").default(0),
  shift3AvgKwh: doublePrecision("shift3_avg_kwh").default(0),
  shift3AvgCurrent: doublePrecision("shift3_avg_current").default(0),
  shift3MinCurrent: doublePrecision("shift3_min_current").default(0),
  shift3MaxCurrent: doublePrecision("shift3_max_current").default(0),
  shift3AvgCosPhi: doublePrecision("shift3_avg_cos_phi").default(0),

  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

/** Daily Report LVMDP 4 */
export const dailyReportLVMDP4 = pgTable("daily_report_lvmdp_4", {
  id: text("id").primaryKey(),

  reportDate: date("report_date").notNull().unique(),

  shift1Count: integer("shift1_count").default(0),
  shift1TotalKwh: doublePrecision("shift1_total_kwh").default(0),
  shift1AvgKwh: doublePrecision("shift1_avg_kwh").default(0),
  shift1AvgCurrent: doublePrecision("shift1_avg_current").default(0),
  shift1MinCurrent: doublePrecision("shift1_min_current").default(0),
  shift1MaxCurrent: doublePrecision("shift1_max_current").default(0),
  shift1AvgCosPhi: doublePrecision("shift1_avg_cos_phi").default(0),

  shift2Count: integer("shift2_count").default(0),
  shift2TotalKwh: doublePrecision("shift2_total_kwh").default(0),
  shift2AvgKwh: doublePrecision("shift2_avg_kwh").default(0),
  shift2AvgCurrent: doublePrecision("shift2_avg_current").default(0),
  shift2MinCurrent: doublePrecision("shift2_min_current").default(0),
  shift2MaxCurrent: doublePrecision("shift2_max_current").default(0),
  shift2AvgCosPhi: doublePrecision("shift2_avg_cos_phi").default(0),

  shift3Count: integer("shift3_count").default(0),
  shift3TotalKwh: doublePrecision("shift3_total_kwh").default(0),
  shift3AvgKwh: doublePrecision("shift3_avg_kwh").default(0),
  shift3AvgCurrent: doublePrecision("shift3_avg_current").default(0),
  shift3MinCurrent: doublePrecision("shift3_min_current").default(0),
  shift3MaxCurrent: doublePrecision("shift3_max_current").default(0),
  shift3AvgCosPhi: doublePrecision("shift3_avg_cos_phi").default(0),

  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

/* ===========================
   HOURLY REPORT TABLES
   (Menyimpan agregasi per jam - optimasi untuk performa)
   Index pada (report_date, hour) untuk query cepat
=========================== */

/** Hourly Report LVMDP 1 */
export const hourlyReportLVMDP1 = pgTable("hourly_report_lvmdp_1", {
  id: text("id").primaryKey(),

  reportDate: date("report_date").notNull(),
  hour: integer("hour").notNull(), // 0-23

  count: integer("count").default(0),
  totalKwh: doublePrecision("total_kwh").default(0),
  avgKwh: doublePrecision("avg_kwh").default(0),
  avgCurrent: doublePrecision("avg_current").default(0),
  minCurrent: doublePrecision("min_current").default(0),
  maxCurrent: doublePrecision("max_current").default(0),
  avgCosPhi: doublePrecision("avg_cos_phi").default(0),

  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

/** Hourly Report LVMDP 2 */
export const hourlyReportLVMDP2 = pgTable("hourly_report_lvmdp_2", {
  id: text("id").primaryKey(),

  reportDate: date("report_date").notNull(),
  hour: integer("hour").notNull(), // 0-23

  count: integer("count").default(0),
  totalKwh: doublePrecision("total_kwh").default(0),
  avgKwh: doublePrecision("avg_kwh").default(0),
  avgCurrent: doublePrecision("avg_current").default(0),
  minCurrent: doublePrecision("min_current").default(0),
  maxCurrent: doublePrecision("max_current").default(0),
  avgCosPhi: doublePrecision("avg_cos_phi").default(0),

  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

/** Hourly Report LVMDP 3 */
export const hourlyReportLVMDP3 = pgTable("hourly_report_lvmdp_3", {
  id: text("id").primaryKey(),

  reportDate: date("report_date").notNull(),
  hour: integer("hour").notNull(), // 0-23

  count: integer("count").default(0),
  totalKwh: doublePrecision("total_kwh").default(0),
  avgKwh: doublePrecision("avg_kwh").default(0),
  avgCurrent: doublePrecision("avg_current").default(0),
  minCurrent: doublePrecision("min_current").default(0),
  maxCurrent: doublePrecision("max_current").default(0),
  avgCosPhi: doublePrecision("avg_cos_phi").default(0),

  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

/** Hourly Report LVMDP 4 */
export const hourlyReportLVMDP4 = pgTable("hourly_report_lvmdp_4", {
  id: text("id").primaryKey(),

  reportDate: date("report_date").notNull(),
  hour: integer("hour").notNull(), // 0-23

  count: integer("count").default(0),
  totalKwh: doublePrecision("total_kwh").default(0),
  avgKwh: doublePrecision("avg_kwh").default(0),
  avgCurrent: doublePrecision("avg_current").default(0),
  minCurrent: doublePrecision("min_current").default(0),
  maxCurrent: doublePrecision("max_current").default(0),
  avgCosPhi: doublePrecision("avg_cos_phi").default(0),

  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

/* ===========================
   PRODUCTION LINE TABLES
   (Menyimpan data production line)
=========================== */

/** Production Line A - PC39 */
export const productionLineAPC39 = pgTable("production_line_a_pc39", {
  id: text("id").primaryKey(),
  timestamp: timestamp("timestamp").notNull(),
  lineId: text("line_id").notNull().default("LINE_A_PC39"),

  // Production Metrics
  targetProduction: integer("target_production").default(0),
  actualProduction: integer("actual_production").default(0),
  defectCount: integer("defect_count").default(0),

  // Machine Status
  status: text("status").default("idle"), // running, idle, maintenance, down
  oeePercentage: doublePrecision("oee_percentage").default(0),
  availability: doublePrecision("availability").default(0),
  performance: doublePrecision("performance").default(0),
  quality: doublePrecision("quality").default(0),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/* ===========================
   PRODUCTION TABLES
   (Menyimpan data production per mesin)
   Nama tabel: production_<nama_mesin>
=========================== */

// Production PC14
export const productionPC14 = pgTable("production_pc14", {
  id: text("id").primaryKey(),
  timestamp: timestamp("timestamp").notNull(),
  machineId: text("machine_id").notNull().default("PC14"),
  targetProduction: integer("target_production").default(0),
  actualProduction: integer("actual_production").default(0),
  defectCount: integer("defect_count").default(0),
  status: text("status").default("idle"),
  oeePercentage: doublePrecision("oee_percentage").default(0),
  availability: doublePrecision("availability").default(0),
  performance: doublePrecision("performance").default(0),
  quality: doublePrecision("quality").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Production TS1000
export const productionTS1000 = pgTable("production_ts1000", {
  id: text("id").primaryKey(),
  timestamp: timestamp("timestamp").notNull(),
  machineId: text("machine_id").notNull().default("TS1000"),
  targetProduction: integer("target_production").default(0),
  actualProduction: integer("actual_production").default(0),
  defectCount: integer("defect_count").default(0),
  status: text("status").default("idle"),
  oeePercentage: doublePrecision("oee_percentage").default(0),
  availability: doublePrecision("availability").default(0),
  performance: doublePrecision("performance").default(0),
  quality: doublePrecision("quality").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Production FCP
export const productionFCP = pgTable("production_fcp", {
  id: text("id").primaryKey(),
  timestamp: timestamp("timestamp").notNull(),
  machineId: text("machine_id").notNull().default("FCP"),
  targetProduction: integer("target_production").default(0),
  actualProduction: integer("actual_production").default(0),
  defectCount: integer("defect_count").default(0),
  status: text("status").default("idle"),
  oeePercentage: doublePrecision("oee_percentage").default(0),
  availability: doublePrecision("availability").default(0),
  performance: doublePrecision("performance").default(0),
  quality: doublePrecision("quality").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Production TWS56
export const productionTWS56 = pgTable("production_tws56", {
  id: text("id").primaryKey(),
  timestamp: timestamp("timestamp").notNull(),
  machineId: text("machine_id").notNull().default("TWS56"),
  targetProduction: integer("target_production").default(0),
  actualProduction: integer("actual_production").default(0),
  defectCount: integer("defect_count").default(0),
  status: text("status").default("idle"),
  oeePercentage: doublePrecision("oee_percentage").default(0),
  availability: doublePrecision("availability").default(0),
  performance: doublePrecision("performance").default(0),
  quality: doublePrecision("quality").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Production TWS72
export const productionTWS72 = pgTable("production_tws72", {
  id: text("id").primaryKey(),
  timestamp: timestamp("timestamp").notNull(),
  machineId: text("machine_id").notNull().default("TWS72"),
  targetProduction: integer("target_production").default(0),
  actualProduction: integer("actual_production").default(0),
  defectCount: integer("defect_count").default(0),
  status: text("status").default("idle"),
  oeePercentage: doublePrecision("oee_percentage").default(0),
  availability: doublePrecision("availability").default(0),
  performance: doublePrecision("performance").default(0),
  quality: doublePrecision("quality").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Production COPACK
export const productionCOPACK = pgTable("production_copack", {
  id: text("id").primaryKey(),
  timestamp: timestamp("timestamp").notNull(),
  machineId: text("machine_id").notNull().default("COPACK"),
  targetProduction: integer("target_production").default(0),
  actualProduction: integer("actual_production").default(0),
  defectCount: integer("defect_count").default(0),
  status: text("status").default("idle"),
  oeePercentage: doublePrecision("oee_percentage").default(0),
  availability: doublePrecision("availability").default(0),
  performance: doublePrecision("performance").default(0),
  quality: doublePrecision("quality").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Production IHP
export const productionIHP = pgTable("production_ihp", {
  id: text("id").primaryKey(),
  timestamp: timestamp("timestamp").notNull(),
  machineId: text("machine_id").notNull().default("IHP"),
  targetProduction: integer("target_production").default(0),
  actualProduction: integer("actual_production").default(0),
  defectCount: integer("defect_count").default(0),
  status: text("status").default("idle"),
  oeePercentage: doublePrecision("oee_percentage").default(0),
  availability: doublePrecision("availability").default(0),
  performance: doublePrecision("performance").default(0),
  quality: doublePrecision("quality").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/* ===========================
   VISIBILITY SETTINGS TABLE
   (Persistent role-based UI visibility settings)
=========================== */

export const visibilitySettings = pgTable("visibility_settings", {
  id: serial("id").primaryKey(),
  role: text("role").notNull(),
  scopeKey: text("scope_key").notNull(),
  itemKey: text("item_key").notNull(),
  visible: boolean("visible").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  uniqueVisibilitySetting: unique().on(table.role, table.scopeKey, table.itemKey),
}));

/* ===========================
   ELECTRICAL REPORTING TABLES
   (Professional energy monitoring - ISO 50001 compliant)
=========================== */

/**
 * Daily Electrical Reports - Aggregated per panel per day
 * Used for historical reporting (daily, weekly, monthly)
 */
export const dailyElectricalReports = pgTable("daily_electrical_reports", {
  id: text("id").primaryKey(),
  panelId: text("panel_id").notNull(), // LVMDP_1, LVMDP_2, etc.
  reportDate: date("report_date").notNull(),

  // Energy metrics
  energyKwh: doublePrecision("energy_kwh").notNull(),

  // Power metrics
  avgLoadKw: doublePrecision("avg_load_kw").notNull(),
  peakDemandKw: doublePrecision("peak_demand_kw").notNull(),
  peakDemandTime: timestamp("peak_demand_time"),

  // Voltage quality
  avgVoltage: doublePrecision("avg_voltage").notNull(),
  minVoltage: doublePrecision("min_voltage").notNull(),
  maxVoltage: doublePrecision("max_voltage").notNull(),

  // Current
  avgCurrent: doublePrecision("avg_current").notNull(),
  maxCurrent: doublePrecision("max_current").notNull(),

  // Power factor
  avgPowerFactor: doublePrecision("avg_power_factor").notNull(),

  // Data quality
  sampleCount: integer("sample_count").notNull(),
  dataCompletenessPercent: doublePrecision(
    "data_completeness_percent"
  ).notNull(),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
