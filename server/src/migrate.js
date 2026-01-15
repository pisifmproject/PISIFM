const { db, client } = require("./config/database");
const { sql } = require("drizzle-orm");
const bcrypt = require("bcryptjs");
const { users } = require("./models/schema");

async function migrate() {
  try {
    console.log("🔄 Starting database migration...");

    // Create tables using Drizzle schema
    console.log("📋 Creating tables...");

    // Drop existing tables (optional - comment out if you want to preserve data)
    await client`DROP TABLE IF EXISTS evaluation_realizations CASCADE`;
    await client`DROP TABLE IF EXISTS monthly_evaluations CASCADE`;
    await client`DROP TABLE IF EXISTS chat_messages CASCADE`;
    await client`DROP TABLE IF EXISTS job_assignments CASCADE`;
    await client`DROP TABLE IF EXISTS submissions CASCADE`;
    await client`DROP TABLE IF EXISTS plants CASCADE`;
    await client`DROP TABLE IF EXISTS projects CASCADE`;
    await client`DROP TABLE IF EXISTS users CASCADE`;

    // Create users table
    await client`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role VARCHAR(50) NOT NULL,
        job_title VARCHAR(255),
        department VARCHAR(255),
        avatar VARCHAR(10),
        profile_photo_url TEXT,
        birth_place VARCHAR(255),
        birth_date DATE,
        gender VARCHAR(20),
        marital_status VARCHAR(50),
        address TEXT,
        phone_number VARCHAR(50),
        personal_email VARCHAR(255),
        company_email VARCHAR(255),
        join_date DATE,
        employment_status VARCHAR(50),
        job_history JSONB DEFAULT '[]',
        education_history JSONB DEFAULT '[]',
        emergency_contact JSONB DEFAULT '{}',
        languages TEXT[],
        allowed_modules TEXT[],
        skills JSONB DEFAULT '[]',
        assignments JSONB DEFAULT '[]',
        workload_score INTEGER DEFAULT 0,
        job_grade VARCHAR(50),
        job_role VARCHAR(255),
        motto TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create projects table
    await client`
      CREATE TABLE IF NOT EXISTS projects (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        location VARCHAR(255),
        status VARCHAR(50),
        progress INTEGER DEFAULT 0,
        budget NUMERIC DEFAULT 0,
        spent NUMERIC DEFAULT 0,
        committed NUMERIC DEFAULT 0,
        assignee_id VARCHAR(50) REFERENCES users(id),
        due_date DATE,
        priority VARCHAR(20),
        risk_level VARCHAR(20),
        capex_category VARCHAR(100),
        target_roi NUMERIC,
        lifecycle JSONB DEFAULT '[]',
        documents JSONB DEFAULT '[]',
        planned_progress JSONB DEFAULT '[]',
        actual_progress JSONB DEFAULT '[]',
        capex_items JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create submissions table
    await client`
      CREATE TABLE IF NOT EXISTS submissions (
        id VARCHAR(50) PRIMARY KEY,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'Pending',
        details JSONB,
        flow_id VARCHAR(50),
        current_step_index INTEGER DEFAULT 0,
        user_id VARCHAR(50) REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create job_assignments table
    await client`
      CREATE TABLE IF NOT EXISTS job_assignments (
        id VARCHAR(50) PRIMARY KEY,
        project_name VARCHAR(255),
        project_id VARCHAR(50) REFERENCES projects(id),
        location VARCHAR(255),
        description TEXT,
        category VARCHAR(100),
        duration VARCHAR(50),
        priority VARCHAR(20),
        required_documents TEXT[],
        material_list TEXT[],
        assignee_id VARCHAR(50) REFERENCES users(id),
        status VARCHAR(50) DEFAULT 'Draft',
        flow_id VARCHAR(50),
        current_step_index INTEGER DEFAULT 0,
        approval_history JSONB DEFAULT '[]',
        due_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create chat_messages table
    await client`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id SERIAL PRIMARY KEY,
        sender_id VARCHAR(50) REFERENCES users(id),
        content TEXT,
        channel_id VARCHAR(50),
        recipient_id VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create plants table
    await client`
      CREATE TABLE IF NOT EXISTS plants (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(50),
        location VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create monthly_evaluations table
    await client`
      CREATE TABLE IF NOT EXISTS monthly_evaluations (
        id VARCHAR(50) PRIMARY KEY,
        user_id VARCHAR(50) REFERENCES users(id),
        evaluator_id VARCHAR(50) REFERENCES users(id),
        month VARCHAR(7) NOT NULL,
        total_score NUMERIC DEFAULT 0,
        status VARCHAR(50) DEFAULT 'Draft',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create evaluation_realizations table
    await client`
      CREATE TABLE IF NOT EXISTS evaluation_realizations (
        id SERIAL PRIMARY KEY,
        evaluation_id VARCHAR(50) REFERENCES monthly_evaluations(id) ON DELETE CASCADE,
        criterion_id VARCHAR(50) NOT NULL,
        realization_value NUMERIC,
        calculated_score NUMERIC DEFAULT 0,
        weight_score NUMERIC DEFAULT 0,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    console.log("✅ Tables created successfully");

    // Create default admin user
    console.log("👤 Creating default admin user...");
    const hashedPassword = await bcrypt.hash("admin123", 10);

    await db
      .insert(users)
      .values({
        id: "ADM-001",
        name: "Administrator",
        email: "admin@pisifm.com",
        password: hashedPassword,
        role: "admin",
        jobTitle: "System Administrator",
        department: "IT",
      })
      .onConflictDoNothing();

    console.log("✅ Default admin user created");
    console.log("📧 Email: admin@pisifm.com");
    console.log("🔑 Password: admin123");

    console.log("🎉 Migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

migrate();
