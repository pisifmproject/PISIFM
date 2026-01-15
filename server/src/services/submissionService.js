const { db } = require("../config/database");
const { submissions } = require("../models/schema");
const { eq } = require("drizzle-orm");

class SubmissionService {
  async getAllSubmissions() {
    return await db.select().from(submissions);
  }

  async getSubmissionById(id) {
    const result = await db
      .select()
      .from(submissions)
      .where(eq(submissions.id, id));
    return result.length > 0 ? result[0] : null;
  }

  async createSubmission(submissionData) {
    const newSubmission = await db
      .insert(submissions)
      .values({
        ...submissionData,
        id: submissionData.id || `SUB-${Date.now()}`,
      })
      .returning();
    return newSubmission[0];
  }

  async updateSubmission(id, submissionData) {
    const result = await db
      .update(submissions)
      .set(submissionData)
      .where(eq(submissions.id, id))
      .returning();
    return result.length > 0 ? result[0] : null;
  }

  async deleteSubmission(id) {
    const result = await db
      .delete(submissions)
      .where(eq(submissions.id, id))
      .returning();
    return result.length > 0;
  }
}

module.exports = new SubmissionService();
