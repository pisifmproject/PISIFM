const { db } = require("../config/database");
const { jobAssignments } = require("../models/schema");
const { eq } = require("drizzle-orm");

class JobService {
  async getAllJobs() {
    return await db.select().from(jobAssignments);
  }

  async getJobById(id) {
    const result = await db
      .select()
      .from(jobAssignments)
      .where(eq(jobAssignments.id, id));
    return result.length > 0 ? result[0] : null;
  }

  async createJob(jobData) {
    const newJob = await db
      .insert(jobAssignments)
      .values({
        ...jobData,
        id: jobData.id || `JOB-${Date.now()}`,
      })
      .returning();
    return newJob[0];
  }

  async updateJob(id, jobData) {
    const result = await db
      .update(jobAssignments)
      .set(jobData)
      .where(eq(jobAssignments.id, id))
      .returning();
    return result.length > 0 ? result[0] : null;
  }

  async deleteJob(id) {
    const result = await db
      .delete(jobAssignments)
      .where(eq(jobAssignments.id, id))
      .returning();
    return result.length > 0;
  }
}

module.exports = new JobService();
