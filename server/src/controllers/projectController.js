const projectService = require("../services/projectService");

class ProjectController {
  async getAll(req, res) {
    try {
      const projects = await projectService.getAllProjects();
      res.json({
        success: true,
        data: projects,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getById(req, res) {
    try {
      const project = await projectService.getProjectById(req.params.id);
      if (!project) {
        return res.status(404).json({
          success: false,
          message: "Project not found",
        });
      }
      res.json({
        success: true,
        data: project,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async create(req, res) {
    try {
      const project = await projectService.createProject(req.body);
      res.status(201).json({
        success: true,
        message: "Project created successfully",
        data: project,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async update(req, res) {
    try {
      const project = await projectService.updateProject(
        req.params.id,
        req.body
      );
      if (!project) {
        return res.status(404).json({
          success: false,
          message: "Project not found",
        });
      }
      res.json({
        success: true,
        message: "Project updated successfully",
        data: project,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async delete(req, res) {
    try {
      const deleted = await projectService.deleteProject(req.params.id);
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "Project not found",
        });
      }
      res.json({
        success: true,
        message: "Project deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new ProjectController();
