// src/modules/admin/services/plantService.ts
import { PLANTS } from '@/config/app.config';
import type { PlantInfo } from '../types';

class PlantService {
  getAllPlants(): PlantInfo[] {
    return Object.values(PLANTS).map(plant => ({
      id: plant.id,
      name: plant.name,
      machines: plant.machines.map(m => ({ id: m.id, name: m.name })),
      lvmdps: [
        { id: `${plant.id}_lvmdp_1`, name: 'LVMDP 1' },
        { id: `${plant.id}_lvmdp_2`, name: 'LVMDP 2' },
        { id: `${plant.id}_lvmdp_3`, name: 'LVMDP 3' },
        { id: `${plant.id}_lvmdp_4`, name: 'LVMDP 4' },
      ],
    }));
  }

  getPlantById(plantId: string): PlantInfo | undefined {
    const plant = PLANTS[plantId as keyof typeof PLANTS];
    if (!plant) return undefined;
    
    return {
      id: plant.id,
      name: plant.name,
      machines: plant.machines.map(m => ({ id: m.id, name: m.name })),
      lvmdps: [
        { id: `${plant.id}_lvmdp_1`, name: 'LVMDP 1' },
        { id: `${plant.id}_lvmdp_2`, name: 'LVMDP 2' },
        { id: `${plant.id}_lvmdp_3`, name: 'LVMDP 3' },
        { id: `${plant.id}_lvmdp_4`, name: 'LVMDP 4' },
      ],
    };
  }
}

export const plantService = new PlantService();
