const { db } = require("../config/database");
const { projects } = require("../models/schema");
const { eq } = require("drizzle-orm");

class ProjectService {
  async getAllProjects() {
    return await db.select().from(projects);
  }

  async getProjectById(id) {
    const result = await db.select().from(projects).where(eq(projects.id, id));
    return result.length > 0 ? result[0] : null;
  }

  async createProject(projectData) {
    const newProject = await db
      .insert(projects)
      .values({
        ...projectData,
        id: projectData.id || `PRJ-${Date.now()}`,
      })
      .returning();
    return newProject[0];
  }

  async updateProject(id, projectData) {
    const result = await db
      .update(projects)
      .set({ ...projectData, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return result.length > 0 ? result[0] : null;
  }

  async deleteProject(id) {
    const result = await db
      .delete(projects)
      .where(eq(projects.id, id))
      .returning();
    return result.length > 0;
  }
}

module.exports = new ProjectService();
