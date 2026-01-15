const { db } = require("../config/database");
const { projects } = require("../models/schema");
const { eq } = require("drizzle-orm");

class ProjectService {
  /**
   * Calculate project status based on progress and target date
   * Rules:
   * - 0% progress → "Planning"
   * - >0% and <100% progress, not past target → "In Progress"
   * - 100% progress → "Completed"
   * - <100% progress and past target → "Delayed"
   */
  calculateStatus(progress, dueDate) {
    const progressNum = parseInt(progress) || 0;

    // Completed: 100% progress
    if (progressNum >= 100) {
      return "Completed";
    }

    // Planning: 0% progress
    if (progressNum === 0) {
      return "Planning";
    }

    // Check if past due date
    if (dueDate) {
      const targetDate = new Date(dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      targetDate.setHours(0, 0, 0, 0);

      // Delayed: progress <100% and past target
      if (today > targetDate) {
        return "Delayed";
      }
    }

    // In Progress: progress >0% and <100%, not past target
    return "In Progress";
  }

  async getAllProjects() {
    const allProjects = await db.select().from(projects);

    // Calculate status for each project
    return allProjects.map((project) => ({
      ...project,
      status: this.calculateStatus(project.progress, project.dueDate),
    }));
  }

  async getProjectById(id) {
    const result = await db.select().from(projects).where(eq(projects.id, id));
    if (result.length === 0) return null;

    const project = result[0];
    return {
      ...project,
      status: this.calculateStatus(project.progress, project.dueDate),
    };
  }

  async createProject(projectData) {
    // Calculate status automatically - ignore status from client
    const calculatedStatus = this.calculateStatus(
      projectData.progress || 0,
      projectData.dueDate
    );

    const newProject = await db
      .insert(projects)
      .values({
        ...projectData,
        id: projectData.id || `PRJ-${Date.now()}`,
        status: calculatedStatus,
        progress: projectData.progress || 0,
      })
      .returning();

    return {
      ...newProject[0],
      status: calculatedStatus,
    };
  }

  async updateProject(id, projectData) {
    // Get existing project to calculate new status
    const existing = await this.getProjectById(id);
    if (!existing) return null;

    // Calculate new status based on updated progress/dueDate
    const newProgress =
      projectData.progress !== undefined
        ? projectData.progress
        : existing.progress;
    const newDueDate =
      projectData.dueDate !== undefined
        ? projectData.dueDate
        : existing.dueDate;

    const calculatedStatus = this.calculateStatus(newProgress, newDueDate);

    const result = await db
      .update(projects)
      .set({
        ...projectData,
        status: calculatedStatus,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, id))
      .returning();

    if (result.length === 0) return null;

    return {
      ...result[0],
      status: calculatedStatus,
    };
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
