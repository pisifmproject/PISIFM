const { db } = require("../config/database");
const { plants } = require("../models/schema");
const { eq } = require("drizzle-orm");

class PlantService {
  async getAllPlants() {
    return await db.select().from(plants);
  }

  async getPlantById(id) {
    const result = await db.select().from(plants).where(eq(plants.id, id));
    return result.length > 0 ? result[0] : null;
  }

  async createPlant(plantData) {
    const newPlant = await db
      .insert(plants)
      .values({
        ...plantData,
        id: plantData.id || `PLT-${Date.now()}`,
      })
      .returning();
    return newPlant[0];
  }

  async updatePlant(id, plantData) {
    const result = await db
      .update(plants)
      .set(plantData)
      .where(eq(plants.id, id))
      .returning();
    return result.length > 0 ? result[0] : null;
  }

  async deletePlant(id) {
    const result = await db.delete(plants).where(eq(plants.id, id)).returning();
    return result.length > 0;
  }
}

module.exports = new PlantService();
