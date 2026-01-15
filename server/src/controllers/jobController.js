const jobService = require("../services/jobService");

class JobController {
  async getAll(req, res) {
    try {
      const jobs = await jobService.getAllJobs();
      res.json({
        success: true,
        data: jobs,
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
      const job = await jobService.getJobById(req.params.id);
      if (!job) {
        return res.status(404).json({
          success: false,
          message: "Job not found",
        });
      }
      res.json({
        success: true,
        data: job,
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
      const job = await jobService.createJob(req.body);
      res.status(201).json({
        success: true,
        message: "Job created successfully",
        data: job,
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
      const job = await jobService.updateJob(req.params.id, req.body);
      if (!job) {
        return res.status(404).json({
          success: false,
          message: "Job not found",
        });
      }
      res.json({
        success: true,
        message: "Job updated successfully",
        data: job,
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
      const deleted = await jobService.deleteJob(req.params.id);
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "Job not found",
        });
      }
      res.json({
        success: true,
        message: "Job deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new JobController();
