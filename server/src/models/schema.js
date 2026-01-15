const {
  pgTable,
  varchar,
  integer,
  numeric,
  timestamp,
  date,
  jsonb,
  text,
  serial,
  boolean,
} = require("drizzle-orm/pg-core");
const { sql } = require("drizzle-orm");

// Users Table
const users = pgTable("users", {
  id: varchar("id", { length: 50 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  password: text("password").notNull(),
  role: varchar("role", { length: 50 }).notNull(),
  jobTitle: varchar("job_title", { length: 255 }),
  department: varchar("department", { length: 255 }),
  avatar: varchar("avatar", { length: 10 }),
  profilePhotoUrl: text("profile_photo_url"),
  birthPlace: varchar("birth_place", { length: 255 }),
  birthDate: date("birth_date"),
  gender: varchar("gender", { length: 20 }),
  maritalStatus: varchar("marital_status", { length: 50 }),
  address: text("address"),
  phoneNumber: varchar("phone_number", { length: 50 }),
  personalEmail: varchar("personal_email", { length: 255 }),
  companyEmail: varchar("company_email", { length: 255 }),
  joinDate: date("join_date"),
  employmentStatus: varchar("employment_status", { length: 50 }),
  jobHistory: jsonb("job_history").default(sql`'[]'`),
  educationHistory: jsonb("education_history").default(sql`'[]'`),
  emergencyContact: jsonb("emergency_contact").default(sql`'{}'`),
  languages: text("languages").array(),
  allowedModules: text("allowed_modules").array(),
  skills: jsonb("skills").default(sql`'[]'`),
  assignments: jsonb("assignments").default(sql`'[]'`),
  workloadScore: integer("workload_score").default(0),
  jobGrade: varchar("job_grade", { length: 50 }),
  jobRole: varchar("job_role", { length: 255 }),
  motto: text("motto"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Projects Table
const projects = pgTable("projects", {
  id: varchar("id", { length: 50 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  location: varchar("location", { length: 255 }),
  status: varchar("status", { length: 50 }),
  progress: integer("progress").default(0),
  budget: numeric("budget").default("0"),
  spent: numeric("spent").default("0"),
  committed: numeric("committed").default("0"),
  assigneeId: varchar("assignee_id", { length: 50 }).references(() => users.id),
  dueDate: date("due_date"),
  priority: varchar("priority", { length: 20 }),
  riskLevel: varchar("risk_level", { length: 20 }),
  capexCategory: varchar("capex_category", { length: 100 }),
  targetROI: numeric("target_roi"),
  lifecycle: jsonb("lifecycle").default(sql`'[]'`),
  documents: jsonb("documents").default(sql`'[]'`),
  plannedProgress: jsonb("planned_progress").default(sql`'[]'`),
  actualProgress: jsonb("actual_progress").default(sql`'[]'`),
  capexItems: jsonb("capex_items").default(sql`'[]'`),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Submissions Table
const submissions = pgTable("submissions", {
  id: varchar("id", { length: 50 }).primaryKey(),
  type: varchar("type", { length: 50 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  status: varchar("status", { length: 50 }).default("Pending"),
  details: jsonb("details"),
  flowId: varchar("flow_id", { length: 50 }),
  currentStepIndex: integer("current_step_index").default(0),
  userId: varchar("user_id", { length: 50 }).references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Job Assignments Table
const jobAssignments = pgTable("job_assignments", {
  id: varchar("id", { length: 50 }).primaryKey(),
  projectName: varchar("project_name", { length: 255 }),
  projectId: varchar("project_id", { length: 50 }).references(
    () => projects.id
  ),
  location: varchar("location", { length: 255 }),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  duration: varchar("duration", { length: 50 }),
  priority: varchar("priority", { length: 20 }),
  requiredDocuments: text("required_documents").array(),
  materialList: text("material_list").array(),
  assigneeId: varchar("assignee_id", { length: 50 }).references(() => users.id),
  status: varchar("status", { length: 50 }).default("Draft"),
  flowId: varchar("flow_id", { length: 50 }),
  currentStepIndex: integer("current_step_index").default(0),
  approvalHistory: jsonb("approval_history").default(sql`'[]'`),
  dueDate: date("due_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Chat Messages Table
const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  senderId: varchar("sender_id", { length: 50 }).references(() => users.id),
  content: text("content"),
  channelId: varchar("channel_id", { length: 50 }),
  recipientId: varchar("recipient_id", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Plants Table
const plants = pgTable("plants", {
  id: varchar("id", { length: 50 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 50 }),
  location: varchar("location", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Monthly Evaluations Table
const monthlyEvaluations = pgTable("monthly_evaluations", {
  id: varchar("id", { length: 50 }).primaryKey(),
  userId: varchar("user_id", { length: 50 }).references(() => users.id),
  evaluatorId: varchar("evaluator_id", { length: 50 }).references(
    () => users.id
  ),
  month: varchar("month", { length: 7 }).notNull(),
  totalScore: numeric("total_score").default("0"),
  status: varchar("status", { length: 50 }).default("Draft"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Evaluation Realizations Table
const evaluationRealizations = pgTable("evaluation_realizations", {
  id: serial("id").primaryKey(),
  evaluationId: varchar("evaluation_id", { length: 50 }).references(
    () => monthlyEvaluations.id,
    { onDelete: "cascade" }
  ),
  criterionId: varchar("criterion_id", { length: 50 }).notNull(),
  realizationValue: numeric("realization_value"),
  calculatedScore: numeric("calculated_score").default("0"),
  weightScore: numeric("weight_score").default("0"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

module.exports = {
  users,
  projects,
  submissions,
  jobAssignments,
  chatMessages,
  plants,
  monthlyEvaluations,
  evaluationRealizations,
};
