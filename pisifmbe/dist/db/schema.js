"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dailyElectricalReports = exports.visibilitySettings = exports.productionIHP = exports.productionCOPACK = exports.productionTWS72 = exports.productionTWS56 = exports.productionFCP = exports.productionTS1000 = exports.productionPC14 = exports.productionLineAPC39 = exports.hourlyReportLVMDP4 = exports.hourlyReportLVMDP3 = exports.hourlyReportLVMDP2 = exports.hourlyReportLVMDP1 = exports.dailyReportLVMDP4 = exports.dailyReportLVMDP3 = exports.dailyReportLVMDP2 = exports.dailyReportLVMDP1 = exports.machines = exports.plants = exports.user = void 0;
// src/db/schema.ts
const pg_core_1 = require("drizzle-orm/pg-core");
/* ===========================
   USER TABLE
=========================== */
exports.user = (0, pg_core_1.pgTable)("User", {
    id: (0, pg_core_1.text)("id").primaryKey().notNull(),
    email: (0, pg_core_1.text)("email").notNull(),
    name: (0, pg_core_1.text)("name"),
});
/* ===========================
   MULTI-PLANT TABLES
=========================== */
/** Plants table - stores the four plants */
exports.plants = (0, pg_core_1.pgTable)("plants", {
    plantId: (0, pg_core_1.text)("plant_id").primaryKey().notNull(),
    displayName: (0, pg_core_1.text)("display_name").notNull(),
    location: (0, pg_core_1.text)("location"),
    status: (0, pg_core_1.text)("status").default("active").notNull(),
    hasRealData: (0, pg_core_1.boolean)("has_real_data").default(false).notNull(),
    installedCapacityKva: (0, pg_core_1.doublePrecision)("installed_capacity_kva").default(0),
    metadata: (0, pg_core_1.jsonb)("metadata"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
/** Machines table - stores all machines across all plants */
exports.machines = (0, pg_core_1.pgTable)("machines", {
    machineId: (0, pg_core_1.text)("machine_id").primaryKey().notNull(),
    plantId: (0, pg_core_1.text)("plant_id").notNull().references(() => exports.plants.plantId, { onDelete: "cascade" }),
    machineName: (0, pg_core_1.text)("machine_name").notNull(),
    machineType: (0, pg_core_1.text)("machine_type"), // 'production', 'packing', etc.
    lineCategory: (0, pg_core_1.text)("line_category"), // optional grouping
    status: (0, pg_core_1.text)("status").default("active").notNull(),
    metadata: (0, pg_core_1.jsonb)("metadata"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
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
exports.dailyReportLVMDP1 = (0, pg_core_1.pgTable)("daily_report_lvmdp_1", {
    id: (0, pg_core_1.text)("id").primaryKey(),
    reportDate: (0, pg_core_1.date)("report_date").notNull().unique(),
    shift1Count: (0, pg_core_1.integer)("shift1_count").default(0),
    shift1TotalKwh: (0, pg_core_1.doublePrecision)("shift1_total_kwh").default(0),
    shift1AvgKwh: (0, pg_core_1.doublePrecision)("shift1_avg_kwh").default(0),
    shift1AvgCurrent: (0, pg_core_1.doublePrecision)("shift1_avg_current").default(0),
    shift1MinCurrent: (0, pg_core_1.doublePrecision)("shift1_min_current").default(0),
    shift1MaxCurrent: (0, pg_core_1.doublePrecision)("shift1_max_current").default(0),
    shift1AvgCosPhi: (0, pg_core_1.doublePrecision)("shift1_avg_cos_phi").default(0),
    shift2Count: (0, pg_core_1.integer)("shift2_count").default(0),
    shift2TotalKwh: (0, pg_core_1.doublePrecision)("shift2_total_kwh").default(0),
    shift2AvgKwh: (0, pg_core_1.doublePrecision)("shift2_avg_kwh").default(0),
    shift2AvgCurrent: (0, pg_core_1.doublePrecision)("shift2_avg_current").default(0),
    shift2MinCurrent: (0, pg_core_1.doublePrecision)("shift2_min_current").default(0),
    shift2MaxCurrent: (0, pg_core_1.doublePrecision)("shift2_max_current").default(0),
    shift2AvgCosPhi: (0, pg_core_1.doublePrecision)("shift2_avg_cos_phi").default(0),
    shift3Count: (0, pg_core_1.integer)("shift3_count").default(0),
    shift3TotalKwh: (0, pg_core_1.doublePrecision)("shift3_total_kwh").default(0),
    shift3AvgKwh: (0, pg_core_1.doublePrecision)("shift3_avg_kwh").default(0),
    shift3AvgCurrent: (0, pg_core_1.doublePrecision)("shift3_avg_current").default(0),
    shift3MinCurrent: (0, pg_core_1.doublePrecision)("shift3_min_current").default(0),
    shift3MaxCurrent: (0, pg_core_1.doublePrecision)("shift3_max_current").default(0),
    shift3AvgCosPhi: (0, pg_core_1.doublePrecision)("shift3_avg_cos_phi").default(0),
    createdAt: (0, pg_core_1.timestamp)("created_at"),
    updatedAt: (0, pg_core_1.timestamp)("updated_at"),
});
/** Daily Report LVMDP 2 */
exports.dailyReportLVMDP2 = (0, pg_core_1.pgTable)("daily_report_lvmdp_2", {
    id: (0, pg_core_1.text)("id").primaryKey(),
    reportDate: (0, pg_core_1.date)("report_date").notNull().unique(),
    shift1Count: (0, pg_core_1.integer)("shift1_count").default(0),
    shift1TotalKwh: (0, pg_core_1.doublePrecision)("shift1_total_kwh").default(0),
    shift1AvgKwh: (0, pg_core_1.doublePrecision)("shift1_avg_kwh").default(0),
    shift1AvgCurrent: (0, pg_core_1.doublePrecision)("shift1_avg_current").default(0),
    shift1MinCurrent: (0, pg_core_1.doublePrecision)("shift1_min_current").default(0),
    shift1MaxCurrent: (0, pg_core_1.doublePrecision)("shift1_max_current").default(0),
    shift1AvgCosPhi: (0, pg_core_1.doublePrecision)("shift1_avg_cos_phi").default(0),
    shift2Count: (0, pg_core_1.integer)("shift2_count").default(0),
    shift2TotalKwh: (0, pg_core_1.doublePrecision)("shift2_total_kwh").default(0),
    shift2AvgKwh: (0, pg_core_1.doublePrecision)("shift2_avg_kwh").default(0),
    shift2AvgCurrent: (0, pg_core_1.doublePrecision)("shift2_avg_current").default(0),
    shift2MinCurrent: (0, pg_core_1.doublePrecision)("shift2_min_current").default(0),
    shift2MaxCurrent: (0, pg_core_1.doublePrecision)("shift2_max_current").default(0),
    shift2AvgCosPhi: (0, pg_core_1.doublePrecision)("shift2_avg_cos_phi").default(0),
    shift3Count: (0, pg_core_1.integer)("shift3_count").default(0),
    shift3TotalKwh: (0, pg_core_1.doublePrecision)("shift3_total_kwh").default(0),
    shift3AvgKwh: (0, pg_core_1.doublePrecision)("shift3_avg_kwh").default(0),
    shift3AvgCurrent: (0, pg_core_1.doublePrecision)("shift3_avg_current").default(0),
    shift3MinCurrent: (0, pg_core_1.doublePrecision)("shift3_min_current").default(0),
    shift3MaxCurrent: (0, pg_core_1.doublePrecision)("shift3_max_current").default(0),
    shift3AvgCosPhi: (0, pg_core_1.doublePrecision)("shift3_avg_cos_phi").default(0),
    createdAt: (0, pg_core_1.timestamp)("created_at"),
    updatedAt: (0, pg_core_1.timestamp)("updated_at"),
});
/** Daily Report LVMDP 3 */
exports.dailyReportLVMDP3 = (0, pg_core_1.pgTable)("daily_report_lvmdp_3", {
    id: (0, pg_core_1.text)("id").primaryKey(),
    reportDate: (0, pg_core_1.date)("report_date").notNull().unique(),
    shift1Count: (0, pg_core_1.integer)("shift1_count").default(0),
    shift1TotalKwh: (0, pg_core_1.doublePrecision)("shift1_total_kwh").default(0),
    shift1AvgKwh: (0, pg_core_1.doublePrecision)("shift1_avg_kwh").default(0),
    shift1AvgCurrent: (0, pg_core_1.doublePrecision)("shift1_avg_current").default(0),
    shift1MinCurrent: (0, pg_core_1.doublePrecision)("shift1_min_current").default(0),
    shift1MaxCurrent: (0, pg_core_1.doublePrecision)("shift1_max_current").default(0),
    shift1AvgCosPhi: (0, pg_core_1.doublePrecision)("shift1_avg_cos_phi").default(0),
    shift2Count: (0, pg_core_1.integer)("shift2_count").default(0),
    shift2TotalKwh: (0, pg_core_1.doublePrecision)("shift2_total_kwh").default(0),
    shift2AvgKwh: (0, pg_core_1.doublePrecision)("shift2_avg_kwh").default(0),
    shift2AvgCurrent: (0, pg_core_1.doublePrecision)("shift2_avg_current").default(0),
    shift2MinCurrent: (0, pg_core_1.doublePrecision)("shift2_min_current").default(0),
    shift2MaxCurrent: (0, pg_core_1.doublePrecision)("shift2_max_current").default(0),
    shift2AvgCosPhi: (0, pg_core_1.doublePrecision)("shift2_avg_cos_phi").default(0),
    shift3Count: (0, pg_core_1.integer)("shift3_count").default(0),
    shift3TotalKwh: (0, pg_core_1.doublePrecision)("shift3_total_kwh").default(0),
    shift3AvgKwh: (0, pg_core_1.doublePrecision)("shift3_avg_kwh").default(0),
    shift3AvgCurrent: (0, pg_core_1.doublePrecision)("shift3_avg_current").default(0),
    shift3MinCurrent: (0, pg_core_1.doublePrecision)("shift3_min_current").default(0),
    shift3MaxCurrent: (0, pg_core_1.doublePrecision)("shift3_max_current").default(0),
    shift3AvgCosPhi: (0, pg_core_1.doublePrecision)("shift3_avg_cos_phi").default(0),
    createdAt: (0, pg_core_1.timestamp)("created_at"),
    updatedAt: (0, pg_core_1.timestamp)("updated_at"),
});
/** Daily Report LVMDP 4 */
exports.dailyReportLVMDP4 = (0, pg_core_1.pgTable)("daily_report_lvmdp_4", {
    id: (0, pg_core_1.text)("id").primaryKey(),
    reportDate: (0, pg_core_1.date)("report_date").notNull().unique(),
    shift1Count: (0, pg_core_1.integer)("shift1_count").default(0),
    shift1TotalKwh: (0, pg_core_1.doublePrecision)("shift1_total_kwh").default(0),
    shift1AvgKwh: (0, pg_core_1.doublePrecision)("shift1_avg_kwh").default(0),
    shift1AvgCurrent: (0, pg_core_1.doublePrecision)("shift1_avg_current").default(0),
    shift1MinCurrent: (0, pg_core_1.doublePrecision)("shift1_min_current").default(0),
    shift1MaxCurrent: (0, pg_core_1.doublePrecision)("shift1_max_current").default(0),
    shift1AvgCosPhi: (0, pg_core_1.doublePrecision)("shift1_avg_cos_phi").default(0),
    shift2Count: (0, pg_core_1.integer)("shift2_count").default(0),
    shift2TotalKwh: (0, pg_core_1.doublePrecision)("shift2_total_kwh").default(0),
    shift2AvgKwh: (0, pg_core_1.doublePrecision)("shift2_avg_kwh").default(0),
    shift2AvgCurrent: (0, pg_core_1.doublePrecision)("shift2_avg_current").default(0),
    shift2MinCurrent: (0, pg_core_1.doublePrecision)("shift2_min_current").default(0),
    shift2MaxCurrent: (0, pg_core_1.doublePrecision)("shift2_max_current").default(0),
    shift2AvgCosPhi: (0, pg_core_1.doublePrecision)("shift2_avg_cos_phi").default(0),
    shift3Count: (0, pg_core_1.integer)("shift3_count").default(0),
    shift3TotalKwh: (0, pg_core_1.doublePrecision)("shift3_total_kwh").default(0),
    shift3AvgKwh: (0, pg_core_1.doublePrecision)("shift3_avg_kwh").default(0),
    shift3AvgCurrent: (0, pg_core_1.doublePrecision)("shift3_avg_current").default(0),
    shift3MinCurrent: (0, pg_core_1.doublePrecision)("shift3_min_current").default(0),
    shift3MaxCurrent: (0, pg_core_1.doublePrecision)("shift3_max_current").default(0),
    shift3AvgCosPhi: (0, pg_core_1.doublePrecision)("shift3_avg_cos_phi").default(0),
    createdAt: (0, pg_core_1.timestamp)("created_at"),
    updatedAt: (0, pg_core_1.timestamp)("updated_at"),
});
/* ===========================
   HOURLY REPORT TABLES
   (Menyimpan agregasi per jam - optimasi untuk performa)
   Index pada (report_date, hour) untuk query cepat
=========================== */
/** Hourly Report LVMDP 1 */
exports.hourlyReportLVMDP1 = (0, pg_core_1.pgTable)("hourly_report_lvmdp_1", {
    id: (0, pg_core_1.text)("id").primaryKey(),
    reportDate: (0, pg_core_1.date)("report_date").notNull(),
    hour: (0, pg_core_1.integer)("hour").notNull(), // 0-23
    count: (0, pg_core_1.integer)("count").default(0),
    totalKwh: (0, pg_core_1.doublePrecision)("total_kwh").default(0),
    avgKwh: (0, pg_core_1.doublePrecision)("avg_kwh").default(0),
    avgCurrent: (0, pg_core_1.doublePrecision)("avg_current").default(0),
    minCurrent: (0, pg_core_1.doublePrecision)("min_current").default(0),
    maxCurrent: (0, pg_core_1.doublePrecision)("max_current").default(0),
    avgCosPhi: (0, pg_core_1.doublePrecision)("avg_cos_phi").default(0),
    createdAt: (0, pg_core_1.timestamp)("created_at"),
    updatedAt: (0, pg_core_1.timestamp)("updated_at"),
});
/** Hourly Report LVMDP 2 */
exports.hourlyReportLVMDP2 = (0, pg_core_1.pgTable)("hourly_report_lvmdp_2", {
    id: (0, pg_core_1.text)("id").primaryKey(),
    reportDate: (0, pg_core_1.date)("report_date").notNull(),
    hour: (0, pg_core_1.integer)("hour").notNull(), // 0-23
    count: (0, pg_core_1.integer)("count").default(0),
    totalKwh: (0, pg_core_1.doublePrecision)("total_kwh").default(0),
    avgKwh: (0, pg_core_1.doublePrecision)("avg_kwh").default(0),
    avgCurrent: (0, pg_core_1.doublePrecision)("avg_current").default(0),
    minCurrent: (0, pg_core_1.doublePrecision)("min_current").default(0),
    maxCurrent: (0, pg_core_1.doublePrecision)("max_current").default(0),
    avgCosPhi: (0, pg_core_1.doublePrecision)("avg_cos_phi").default(0),
    createdAt: (0, pg_core_1.timestamp)("created_at"),
    updatedAt: (0, pg_core_1.timestamp)("updated_at"),
});
/** Hourly Report LVMDP 3 */
exports.hourlyReportLVMDP3 = (0, pg_core_1.pgTable)("hourly_report_lvmdp_3", {
    id: (0, pg_core_1.text)("id").primaryKey(),
    reportDate: (0, pg_core_1.date)("report_date").notNull(),
    hour: (0, pg_core_1.integer)("hour").notNull(), // 0-23
    count: (0, pg_core_1.integer)("count").default(0),
    totalKwh: (0, pg_core_1.doublePrecision)("total_kwh").default(0),
    avgKwh: (0, pg_core_1.doublePrecision)("avg_kwh").default(0),
    avgCurrent: (0, pg_core_1.doublePrecision)("avg_current").default(0),
    minCurrent: (0, pg_core_1.doublePrecision)("min_current").default(0),
    maxCurrent: (0, pg_core_1.doublePrecision)("max_current").default(0),
    avgCosPhi: (0, pg_core_1.doublePrecision)("avg_cos_phi").default(0),
    createdAt: (0, pg_core_1.timestamp)("created_at"),
    updatedAt: (0, pg_core_1.timestamp)("updated_at"),
});
/** Hourly Report LVMDP 4 */
exports.hourlyReportLVMDP4 = (0, pg_core_1.pgTable)("hourly_report_lvmdp_4", {
    id: (0, pg_core_1.text)("id").primaryKey(),
    reportDate: (0, pg_core_1.date)("report_date").notNull(),
    hour: (0, pg_core_1.integer)("hour").notNull(), // 0-23
    count: (0, pg_core_1.integer)("count").default(0),
    totalKwh: (0, pg_core_1.doublePrecision)("total_kwh").default(0),
    avgKwh: (0, pg_core_1.doublePrecision)("avg_kwh").default(0),
    avgCurrent: (0, pg_core_1.doublePrecision)("avg_current").default(0),
    minCurrent: (0, pg_core_1.doublePrecision)("min_current").default(0),
    maxCurrent: (0, pg_core_1.doublePrecision)("max_current").default(0),
    avgCosPhi: (0, pg_core_1.doublePrecision)("avg_cos_phi").default(0),
    createdAt: (0, pg_core_1.timestamp)("created_at"),
    updatedAt: (0, pg_core_1.timestamp)("updated_at"),
});
/* ===========================
   PRODUCTION LINE TABLES
   (Menyimpan data production line)
=========================== */
/** Production Line A - PC39 */
exports.productionLineAPC39 = (0, pg_core_1.pgTable)("production_line_a_pc39", {
    id: (0, pg_core_1.text)("id").primaryKey(),
    timestamp: (0, pg_core_1.timestamp)("timestamp").notNull(),
    lineId: (0, pg_core_1.text)("line_id").notNull().default("LINE_A_PC39"),
    // Production Metrics
    targetProduction: (0, pg_core_1.integer)("target_production").default(0),
    actualProduction: (0, pg_core_1.integer)("actual_production").default(0),
    defectCount: (0, pg_core_1.integer)("defect_count").default(0),
    // Machine Status
    status: (0, pg_core_1.text)("status").default("idle"), // running, idle, maintenance, down
    oeePercentage: (0, pg_core_1.doublePrecision)("oee_percentage").default(0),
    availability: (0, pg_core_1.doublePrecision)("availability").default(0),
    performance: (0, pg_core_1.doublePrecision)("performance").default(0),
    quality: (0, pg_core_1.doublePrecision)("quality").default(0),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
/* ===========================
   PRODUCTION TABLES
   (Menyimpan data production per mesin)
   Nama tabel: production_<nama_mesin>
=========================== */
// Production PC14
exports.productionPC14 = (0, pg_core_1.pgTable)("production_pc14", {
    id: (0, pg_core_1.text)("id").primaryKey(),
    timestamp: (0, pg_core_1.timestamp)("timestamp").notNull(),
    machineId: (0, pg_core_1.text)("machine_id").notNull().default("PC14"),
    targetProduction: (0, pg_core_1.integer)("target_production").default(0),
    actualProduction: (0, pg_core_1.integer)("actual_production").default(0),
    defectCount: (0, pg_core_1.integer)("defect_count").default(0),
    status: (0, pg_core_1.text)("status").default("idle"),
    oeePercentage: (0, pg_core_1.doublePrecision)("oee_percentage").default(0),
    availability: (0, pg_core_1.doublePrecision)("availability").default(0),
    performance: (0, pg_core_1.doublePrecision)("performance").default(0),
    quality: (0, pg_core_1.doublePrecision)("quality").default(0),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Production TS1000
exports.productionTS1000 = (0, pg_core_1.pgTable)("production_ts1000", {
    id: (0, pg_core_1.text)("id").primaryKey(),
    timestamp: (0, pg_core_1.timestamp)("timestamp").notNull(),
    machineId: (0, pg_core_1.text)("machine_id").notNull().default("TS1000"),
    targetProduction: (0, pg_core_1.integer)("target_production").default(0),
    actualProduction: (0, pg_core_1.integer)("actual_production").default(0),
    defectCount: (0, pg_core_1.integer)("defect_count").default(0),
    status: (0, pg_core_1.text)("status").default("idle"),
    oeePercentage: (0, pg_core_1.doublePrecision)("oee_percentage").default(0),
    availability: (0, pg_core_1.doublePrecision)("availability").default(0),
    performance: (0, pg_core_1.doublePrecision)("performance").default(0),
    quality: (0, pg_core_1.doublePrecision)("quality").default(0),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Production FCP
exports.productionFCP = (0, pg_core_1.pgTable)("production_fcp", {
    id: (0, pg_core_1.text)("id").primaryKey(),
    timestamp: (0, pg_core_1.timestamp)("timestamp").notNull(),
    machineId: (0, pg_core_1.text)("machine_id").notNull().default("FCP"),
    targetProduction: (0, pg_core_1.integer)("target_production").default(0),
    actualProduction: (0, pg_core_1.integer)("actual_production").default(0),
    defectCount: (0, pg_core_1.integer)("defect_count").default(0),
    status: (0, pg_core_1.text)("status").default("idle"),
    oeePercentage: (0, pg_core_1.doublePrecision)("oee_percentage").default(0),
    availability: (0, pg_core_1.doublePrecision)("availability").default(0),
    performance: (0, pg_core_1.doublePrecision)("performance").default(0),
    quality: (0, pg_core_1.doublePrecision)("quality").default(0),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Production TWS56
exports.productionTWS56 = (0, pg_core_1.pgTable)("production_tws56", {
    id: (0, pg_core_1.text)("id").primaryKey(),
    timestamp: (0, pg_core_1.timestamp)("timestamp").notNull(),
    machineId: (0, pg_core_1.text)("machine_id").notNull().default("TWS56"),
    targetProduction: (0, pg_core_1.integer)("target_production").default(0),
    actualProduction: (0, pg_core_1.integer)("actual_production").default(0),
    defectCount: (0, pg_core_1.integer)("defect_count").default(0),
    status: (0, pg_core_1.text)("status").default("idle"),
    oeePercentage: (0, pg_core_1.doublePrecision)("oee_percentage").default(0),
    availability: (0, pg_core_1.doublePrecision)("availability").default(0),
    performance: (0, pg_core_1.doublePrecision)("performance").default(0),
    quality: (0, pg_core_1.doublePrecision)("quality").default(0),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Production TWS72
exports.productionTWS72 = (0, pg_core_1.pgTable)("production_tws72", {
    id: (0, pg_core_1.text)("id").primaryKey(),
    timestamp: (0, pg_core_1.timestamp)("timestamp").notNull(),
    machineId: (0, pg_core_1.text)("machine_id").notNull().default("TWS72"),
    targetProduction: (0, pg_core_1.integer)("target_production").default(0),
    actualProduction: (0, pg_core_1.integer)("actual_production").default(0),
    defectCount: (0, pg_core_1.integer)("defect_count").default(0),
    status: (0, pg_core_1.text)("status").default("idle"),
    oeePercentage: (0, pg_core_1.doublePrecision)("oee_percentage").default(0),
    availability: (0, pg_core_1.doublePrecision)("availability").default(0),
    performance: (0, pg_core_1.doublePrecision)("performance").default(0),
    quality: (0, pg_core_1.doublePrecision)("quality").default(0),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Production COPACK
exports.productionCOPACK = (0, pg_core_1.pgTable)("production_copack", {
    id: (0, pg_core_1.text)("id").primaryKey(),
    timestamp: (0, pg_core_1.timestamp)("timestamp").notNull(),
    machineId: (0, pg_core_1.text)("machine_id").notNull().default("COPACK"),
    targetProduction: (0, pg_core_1.integer)("target_production").default(0),
    actualProduction: (0, pg_core_1.integer)("actual_production").default(0),
    defectCount: (0, pg_core_1.integer)("defect_count").default(0),
    status: (0, pg_core_1.text)("status").default("idle"),
    oeePercentage: (0, pg_core_1.doublePrecision)("oee_percentage").default(0),
    availability: (0, pg_core_1.doublePrecision)("availability").default(0),
    performance: (0, pg_core_1.doublePrecision)("performance").default(0),
    quality: (0, pg_core_1.doublePrecision)("quality").default(0),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Production IHP
exports.productionIHP = (0, pg_core_1.pgTable)("production_ihp", {
    id: (0, pg_core_1.text)("id").primaryKey(),
    timestamp: (0, pg_core_1.timestamp)("timestamp").notNull(),
    machineId: (0, pg_core_1.text)("machine_id").notNull().default("IHP"),
    targetProduction: (0, pg_core_1.integer)("target_production").default(0),
    actualProduction: (0, pg_core_1.integer)("actual_production").default(0),
    defectCount: (0, pg_core_1.integer)("defect_count").default(0),
    status: (0, pg_core_1.text)("status").default("idle"),
    oeePercentage: (0, pg_core_1.doublePrecision)("oee_percentage").default(0),
    availability: (0, pg_core_1.doublePrecision)("availability").default(0),
    performance: (0, pg_core_1.doublePrecision)("performance").default(0),
    quality: (0, pg_core_1.doublePrecision)("quality").default(0),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
/* ===========================
   VISIBILITY SETTINGS TABLE
   (Persistent role-based UI visibility settings)
=========================== */
exports.visibilitySettings = (0, pg_core_1.pgTable)("visibility_settings", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    role: (0, pg_core_1.text)("role").notNull(),
    scopeKey: (0, pg_core_1.text)("scope_key").notNull(),
    itemKey: (0, pg_core_1.text)("item_key").notNull(),
    visible: (0, pg_core_1.boolean)("visible").notNull().default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
}, (table) => ({
    uniqueVisibilitySetting: (0, pg_core_1.unique)().on(table.role, table.scopeKey, table.itemKey),
}));
/* ===========================
   ELECTRICAL REPORTING TABLES
   (Professional energy monitoring - ISO 50001 compliant)
=========================== */
/**
 * Daily Electrical Reports - Aggregated per panel per day
 * Used for historical reporting (daily, weekly, monthly)
 */
exports.dailyElectricalReports = (0, pg_core_1.pgTable)("daily_electrical_reports", {
    id: (0, pg_core_1.text)("id").primaryKey(),
    panelId: (0, pg_core_1.text)("panel_id").notNull(), // LVMDP_1, LVMDP_2, etc.
    reportDate: (0, pg_core_1.date)("report_date").notNull(),
    // Energy metrics
    energyKwh: (0, pg_core_1.doublePrecision)("energy_kwh").notNull(),
    // Power metrics
    avgLoadKw: (0, pg_core_1.doublePrecision)("avg_load_kw").notNull(),
    peakDemandKw: (0, pg_core_1.doublePrecision)("peak_demand_kw").notNull(),
    peakDemandTime: (0, pg_core_1.timestamp)("peak_demand_time"),
    // Voltage quality
    avgVoltage: (0, pg_core_1.doublePrecision)("avg_voltage").notNull(),
    minVoltage: (0, pg_core_1.doublePrecision)("min_voltage").notNull(),
    maxVoltage: (0, pg_core_1.doublePrecision)("max_voltage").notNull(),
    // Current
    avgCurrent: (0, pg_core_1.doublePrecision)("avg_current").notNull(),
    maxCurrent: (0, pg_core_1.doublePrecision)("max_current").notNull(),
    // Power factor
    avgPowerFactor: (0, pg_core_1.doublePrecision)("avg_power_factor").notNull(),
    // Data quality
    sampleCount: (0, pg_core_1.integer)("sample_count").notNull(),
    dataCompletenessPercent: (0, pg_core_1.doublePrecision)("data_completeness_percent").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
