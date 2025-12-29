export type PlantId = 'cikokol' | 'semarang' | 'cikupa' | 'agro';

export interface MachineConfig {
  id: string;
  name: string;
}

export interface PlantConfig {
  id: PlantId;
  name: string;
  useRealData: boolean;
  machines: MachineConfig[];
}

export const PLANTS: Record<PlantId, PlantConfig> = {
  cikokol: {
    id: 'cikokol',
    name: 'Plant Cikokol',
    useRealData: false,
    machines: [
      { id: 'baked-corn-puff', name: 'Baked Corn Puff' },
      { id: 'pc14', name: 'Potato Chips Line PC14' },
      { id: 'cassava-inhouse', name: 'Cassava Inhouse' },
      { id: 'cassava-copack', name: 'Cassava Copack' },
      { id: 'tempe', name: 'Tempe' },
      { id: 'batch-fryer', name: 'Batch Fryer' },
      { id: 'continuous-fryer', name: 'Continuous Fryer' },
    ],
  },
  semarang: {
    id: 'semarang',
    name: 'Plant Semarang',
    useRealData: false,
    machines: [
      { id: 'pc14', name: 'PC 14' },
      { id: 'pc32', name: 'PC 32' },
      { id: 'cassava-inhouse', name: 'Cassava Inhouse' },
      { id: 'cassava-copack', name: 'Cassava Copack' },
      { id: 'tempe', name: 'Tempe' },
      { id: 'tortilla', name: 'Tortilla' },
      { id: 'fcp', name: 'FCP' },
      { id: 'extrude-pellet', name: 'Extrude Pellet' },
      { id: 'sheeted-e250', name: 'Sheeted Pellet E250' },
      { id: 'sheeted-e500-1', name: 'Sheeted Pellet E500 1' },
      { id: 'sheeted-e500-2', name: 'Sheeted Pellet E500 2' },
      { id: 'batch-fryer', name: 'Batch Fryer' },
      { id: 'continuous-fryer', name: 'Continuous Fryer' },
    ],
  },
  cikupa: {
    id: 'cikupa',
    name: 'Plant Cikupa',
    useRealData: true,
    machines: [
      { id: 'pc14', name: 'PC 14' },
      { id: 'pc39', name: 'PC 39' },
      { id: 'cassava-inhouse', name: 'Cassava Inhouse' },
      { id: 'cassava-copack', name: 'Cassava Copack' },
      { id: 'tortilla', name: 'Tortilla' },
      { id: 'fcp', name: 'FCP' },
      { id: 'tws56', name: 'TWS 5.6' },
      { id: 'tws72', name: 'TWS 7.2' },
      { id: 'packing-pouch', name: 'Packing Pouch Promina Puff' },
      { id: 'vacuum-fryer-1', name: 'Vacuum Fryer 1' },
    ],
  },
  agro: {
    id: 'agro',
    name: 'Plant Agro',
    useRealData: false,
    machines: [
      { id: 'baked-corn-puff', name: 'Baked Corn Puff' },
      { id: 'pc14', name: 'Potato Chips Line PC14' },
      { id: 'cassava-inhouse', name: 'Cassava Inhouse' },
      { id: 'cassava-copack', name: 'Cassava Copack' },
      { id: 'tempe', name: 'Tempe' },
      { id: 'batch-fryer', name: 'Batch Fryer' },
      { id: 'continuous-fryer', name: 'Continuous Fryer' },
    ],
  },
};

export const API_BASE_URL = '/api';
