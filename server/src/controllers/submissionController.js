const submissionService = require("../services/submissionService");

class SubmissionController {
  async getAll(req, res) {
    try {
      const submissions = await submissionService.getAllSubmissions();
      res.json({
        success: true,
        data: submissions,
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
      const submission = await submissionService.getSubmissionById(
        req.params.id
      );
      if (!submission) {
        return res.status(404).json({
          success: false,
          message: "Submission not found",
        });
      }
      res.json({
        success: true,
        data: submission,
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
      const submission = await submissionService.createSubmission(req.body);
      res.status(201).json({
        success: true,
        message: "Submission created successfully",
        data: submission,
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
      const submission = await submissionService.updateSubmission(
        req.params.id,
        req.body
      );
      if (!submission) {
        return res.status(404).json({
          success: false,
          message: "Submission not found",
        });
      }
      res.json({
        success: true,
        message: "Submission updated successfully",
        data: submission,
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
      const deleted = await submissionService.deleteSubmission(req.params.id);
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "Submission not found",
        });
      }
      res.json({
        success: true,
        message: "Submission deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new SubmissionController();
