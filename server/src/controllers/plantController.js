const plantService = require("../services/plantService");

class PlantController {
  async getAll(req, res) {
    try {
      const plants = await plantService.getAllPlants();
      res.json({
        success: true,
        data: plants,
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
      const plant = await plantService.getPlantById(req.params.id);
      if (!plant) {
        return res.status(404).json({
          success: false,
          message: "Plant not found",
        });
      }
      res.json({
        success: true,
        data: plant,
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
      const plant = await plantService.createPlant(req.body);
      res.status(201).json({
        success: true,
        message: "Plant created successfully",
        data: plant,
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
      const plant = await plantService.updatePlant(req.params.id, req.body);
      if (!plant) {
        return res.status(404).json({
          success: false,
          message: "Plant not found",
        });
      }
      res.json({
        success: true,
        message: "Plant updated successfully",
        data: plant,
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
      const deleted = await plantService.deletePlant(req.params.id);
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "Plant not found",
        });
      }
      res.json({
        success: true,
        message: "Plant deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new PlantController();
