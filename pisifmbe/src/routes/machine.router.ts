// Machine data router - Generate unique live data per machine
import { Router } from "express";

const r = Router();

// Helper to generate random value with variance
function randomValue(base: number, variance: number): number {
  return base + (Math.random() * variance * 2 - variance);
}

// Seeded random for consistent base values per machine
function seededRandom(seed: string, min: number, max: number): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash = hash & hash;
  }
  const normalized = Math.abs(Math.sin(hash)) * 10000;
  return min + (normalized % (max - min));
}

// Generate unique base configuration for each machine
// Each machine has completely independent variables with professional naming
function getMachineProcessConfig(plantId: string, machineId: string) {
  const seed = `${plantId}-${machineId}`;
  
  return {
    // Product Information
    productName: seededRandom(seed + "prodName", 1, 10) > 5 ? "WAVY" : "REGULAR",
    operatingMode: seededRandom(seed + "opMode", 1, 10) > 1 ? "NORMAL MODE" : "MAINTENANCE MODE",
    systemStatus: seededRandom(seed + "sysStatus", 1.5, 2.5),
    systemStatusVariance: 0.15,
    plcCommsStatus: seededRandom(seed + "plcComms", 1, 10) > 0.5 ? "OK" : "WARNING",
    
    // Prep / Slicing Systems
    feedFromCratesStatus: seededRandom(seed + "feedCrates", 1, 10) > 2 ? "ON" : "OFF",
    peelerOperationalStatus: seededRandom(seed + "peelerStat", 1, 10) > 1 ? "ACTIVE" : "STANDBY",
    potatoPrepControlMode: seededRandom(seed + "potatoPrep", 1, 10) > 1 ? "AUTO" : "MANUAL",
    slicersControlMode: seededRandom(seed + "slicersCtrl", 1, 10) > 1 ? "AUTO" : "MANUAL",
    washerDrivesControlMode: seededRandom(seed + "washerCtrl", 1, 10) > 1 ? "AUTO" : "MANUAL",
    potatoFeedOperationalStatus: seededRandom(seed + "potatoFeed", 1, 10) > 2 ? "ON" : "OFF",
    slicersInclinePercentage: seededRandom(seed + "slicersIncl", 20.0, 25.0),
    slicersInclineVariance: 1.5,
    headTemperature: seededRandom(seed + "headTemp", 35, 42),
    headTemperatureVariance: 2.0,
    peelerRotationalSpeed: seededRandom(seed + "peelerRpm", 1400, 1500),
    peelerRotationalSpeedVariance: 50,
    peelerLoadPercentage: seededRandom(seed + "peelerLoad", 65, 80),
    peelerLoadVariance: 5.0,
    washerLevelPercentage: seededRandom(seed + "washerLvl", 75, 90),
    washerLevelVariance: 5.0,
    washerFlowRate: seededRandom(seed + "washerFlow", 10.0, 15.0),
    washerFlowVariance: 1.5,
    
    // Oil Flow Control
    mainOilCirculationRate: seededRandom(seed + "oilCirc", 4.0, 5.0),
    mainOilCirculationVariance: 0.2,
    oilCirculationControlValue: seededRandom(seed + "oilCtrl", 90, 100),
    oilCirculationControlVariance: 5,
    
    // Fryer Inlet Temperature Control
    fryerInletTemperature: seededRandom(seed + "fryerInlet", 175.0, 180.0),
    fryerInletTemperatureVariance: 2.0,
    fryerInletSetpoint: seededRandom(seed + "fryerSet", 177.0, 179.0),
    fryerOutletTemperature: seededRandom(seed + "fryerOutlet", 150.0, 156.0),
    fryerOutletTemperatureVariance: 2.5,
    temperatureDelta: seededRandom(seed + "tempDelta", 20.0, 30.0),
    temperatureDeltaVariance: 3.0,
    burnerOutputPercentage: seededRandom(seed + "burnerOut", 40.0, 50.0),
    burnerOutputVariance: 4.0,
    
    // Oil Make-up System
    usedOilPercentage: seededRandom(seed + "usedOil", 0, 5),
    usedOilVariance: 1.0,
    newOilPercentage: seededRandom(seed + "newOil", 95, 100),
    newOilVariance: 2.0,
    oilLevelMillimeters: seededRandom(seed + "oilLevel", 140, 155),
    oilLevelVariance: 5.0,
    oilQualityStatus: seededRandom(seed + "oilQual", 1, 10) > 1 ? "FRESH" : "USED",
    valveOutputPercentage: seededRandom(seed + "valveOut", 50.0, 60.0),
    valveOutputVariance: 3.0,
    
    // Moisture Control System
    actualMoistureContent: seededRandom(seed + "moisture", 1.80, 2.00),
    actualMoistureContentVariance: 0.15,
    moistureSetpoint: seededRandom(seed + "moistSet", 1.30, 1.40),
    actualOilContent: seededRandom(seed + "oilCont", 25.0, 28.0),
    actualOilContentVariance: 1.5,
    oilContentSetpoint: seededRandom(seed + "oilSet", 34.0, 36.0),
    
    // Other Systems / Drives
    masterSpeedPercentage: seededRandom(seed + "masterSpd", 68.0, 72.0),
    masterSpeedVariance: 2.0,
    masterSpeedLinearValue: seededRandom(seed + "masterLin", 65, 75),
    masterSpeedLinearVariance: 5,
    paddleSpeedPercentage: seededRandom(seed + "paddleSpd", 38, 45),
    paddleSpeedVariance: 3.0,
    submergerSpeedPercentage: seededRandom(seed + "submergerSpd", 48, 55),
    submergerSpeedVariance: 3.0,
    takeoutSpeedPercentage: seededRandom(seed + "takeoutSpd", 42, 48),
    takeoutSpeedVariance: 3.0,
    fryerOutfeedControlMode: seededRandom(seed + "fryerOutfeed", 1, 10) > 1 ? "AUTO" : "MANUAL",
    takeoutConveyorStatus: seededRandom(seed + "takeoutConv", 1, 10) > 2 ? "ON" : "OFF",
    postFryerControlMode: seededRandom(seed + "postFryer", 1, 10) > 1 ? "AUTO" : "MANUAL",
    
    // Quality Specifications
    sliceThickness: seededRandom(seed + "sliceThick", 1.700, 1.800),
    sliceThicknessVariance: 0.05,
    potatoSolidsPercentage: seededRandom(seed + "potatoSolids", 19.0, 21.0),
    potatoSolidsVariance: 0.8,
  };
}

// Legacy config for backward compatibility (performance and utility endpoints)
function getMachineConfig(plantId: string, machineId: string) {
  const seed = `${plantId}-${machineId}`;
  
  return {
    // Production Variables
    productionRate: seededRandom(seed + "prodRate", 350, 650),
    productionRateVariance: 30,
    
    extruderSpeed: seededRandom(seed + "extSpeed", 250, 350),
    extruderSpeedVariance: 20,
    
    extruderTemperature: seededRandom(seed + "extTemp", 135, 165),
    extruderTemperatureVariance: 5,
    
    mixerSpeed: seededRandom(seed + "mixSpeed", 180, 280),
    mixerSpeedVariance: 15,
    
    conveyorSpeed: seededRandom(seed + "convSpeed", 45, 85),
    conveyorSpeedVariance: 8,
    
    // Temperature Variables
    fryerTemperature: seededRandom(seed + "fryTemp", 170, 185),
    fryerTemperatureVariance: 4,
    
    ovenTemperature: seededRandom(seed + "ovenTemp", 200, 240),
    ovenTemperatureVariance: 8,
    
    dryerTemperature: seededRandom(seed + "dryTemp", 85, 115),
    dryerTemperatureVariance: 6,
    
    coolingTemperature: seededRandom(seed + "coolTemp", 25, 35),
    coolingTemperatureVariance: 3,
    
    // Pressure Variables
    hydraulicPressure: seededRandom(seed + "hydPress", 120, 180),
    hydraulicPressureVariance: 10,
    
    airPressure: seededRandom(seed + "airPress", 5.5, 7.5),
    airPressureVariance: 0.4,
    
    steamPressure: seededRandom(seed + "steamPress", 4.5, 6.5),
    steamPressureVariance: 0.3,
    
    // Flow Variables
    oilFlowRate: seededRandom(seed + "oilFlow", 3500, 5500),
    oilFlowRateVariance: 300,
    
    waterFlowRate: seededRandom(seed + "waterFlow", 8, 25),
    waterFlowRateVariance: 2,
    
    steamFlowRate: seededRandom(seed + "steamFlow", 60, 120),
    steamFlowRateVariance: 10,
    
    // Quality Variables
    moistureContent: seededRandom(seed + "moisture", 1.5, 3.5),
    moistureContentVariance: 0.3,
    
    oilContent: seededRandom(seed + "oilCont", 24, 32),
    oilContentVariance: 1.5,
    
    productThickness: seededRandom(seed + "thick", 1.2, 2.5),
    productThicknessVariance: 0.15,
    
    productWeight: seededRandom(seed + "weight", 18, 28),
    productWeightVariance: 1.2,
    
    saltContent: seededRandom(seed + "salt", 1.8, 2.8),
    saltContentVariance: 0.2,
    
    // Utility Consumption Variables
    electricalPower: seededRandom(seed + "elecPow", 3200, 6800),
    electricalPowerVariance: 350,
    
    steamConsumption: seededRandom(seed + "steamCons", 45, 135),
    steamConsumptionVariance: 12,
    
    waterConsumption: seededRandom(seed + "waterCons", 6, 22),
    waterConsumptionVariance: 2,
    
    compressedAirConsumption: seededRandom(seed + "airCons", 4500, 8500),
    compressedAirConsumptionVariance: 500,
    
    naturalGasConsumption: seededRandom(seed + "gasCons", 15, 45),
    naturalGasConsumptionVariance: 4,
    
    // Performance Variables
    oeePercentage: seededRandom(seed + "oee", 68, 88),
    oeePercentageVariance: 4,
    
    availabilityPercentage: seededRandom(seed + "avail", 82, 96),
    availabilityPercentageVariance: 3,
    
    performancePercentage: seededRandom(seed + "perf", 78, 94),
    performancePercentageVariance: 4,
    
    qualityPercentage: seededRandom(seed + "qual", 94, 99),
    qualityPercentageVariance: 1.5,
    
    rejectRate: seededRandom(seed + "reject", 0.5, 4.5),
    rejectRateVariance: 0.8,
    
    downtimeMinutes: seededRandom(seed + "downtime", 5, 35),
    downtimeMinutesVariance: 8,
    
    cycleTime: seededRandom(seed + "cycle", 12, 28),
    cycleTimeVariance: 3,
    
    // Motor Variables
    mainMotorCurrent: seededRandom(seed + "mainCurr", 45, 95),
    mainMotorCurrentVariance: 8,
    
    mainMotorVoltage: seededRandom(seed + "mainVolt", 375, 395),
    mainMotorVoltageVariance: 5,
    
    mainMotorFrequency: seededRandom(seed + "mainFreq", 48, 52),
    mainMotorFrequencyVariance: 1,
    
    auxiliaryMotorCurrent: seededRandom(seed + "auxCurr", 15, 35),
    auxiliaryMotorCurrentVariance: 4,
    
    // Vibration & Maintenance Variables
    vibrationLevel: seededRandom(seed + "vib", 2.5, 6.5),
    vibrationLevelVariance: 0.8,
    
    bearingTemperature: seededRandom(seed + "bearing", 45, 75),
    bearingTemperatureVariance: 5,
    
    lubricationPressure: seededRandom(seed + "lube", 2.5, 4.5),
    lubricationPressureVariance: 0.3,
    
    filterPressureDrop: seededRandom(seed + "filter", 0.8, 2.2),
    filterPressureDropVariance: 0.2,
  };
}

// GET /api/machine/:plantId/:machineId/process
r.get("/:plantId/:machineId/process", async (req, res) => {
  try {
    const { plantId, machineId } = req.params;
    const config = getMachineProcessConfig(plantId, machineId);
    
    // Calculate dynamic values with variance
    const processData = {
      // Product Information
      productName: config.productName,
      operatingMode: config.operatingMode,
      systemStatus: parseFloat(randomValue(config.systemStatus, config.systemStatusVariance).toFixed(2)),
      plcCommsStatus: config.plcCommsStatus,
      
      // Prep / Slicing Systems
      feedFromCratesStatus: config.feedFromCratesStatus,
      peelerOperationalStatus: config.peelerOperationalStatus,
      potatoPrepControlMode: config.potatoPrepControlMode,
      slicersControlMode: config.slicersControlMode,
      washerDrivesControlMode: config.washerDrivesControlMode,
      potatoFeedOperationalStatus: config.potatoFeedOperationalStatus,
      slicersInclinePercentage: parseFloat(randomValue(config.slicersInclinePercentage, config.slicersInclineVariance).toFixed(1)),
      headTemperature: Math.floor(randomValue(config.headTemperature, config.headTemperatureVariance)),
      peelerRotationalSpeed: Math.floor(randomValue(config.peelerRotationalSpeed, config.peelerRotationalSpeedVariance)),
      peelerLoadPercentage: Math.floor(randomValue(config.peelerLoadPercentage, config.peelerLoadVariance)),
      washerLevelPercentage: Math.floor(randomValue(config.washerLevelPercentage, config.washerLevelVariance)),
      washerFlowRate: parseFloat(randomValue(config.washerFlowRate, config.washerFlowVariance).toFixed(1)),
      
      // Oil Flow Control
      mainOilCirculationRate: parseFloat(randomValue(config.mainOilCirculationRate, config.mainOilCirculationVariance).toFixed(3)),
      oilCirculationControlValue: Math.floor(randomValue(config.oilCirculationControlValue, config.oilCirculationControlVariance)),
      
      // Fryer Inlet Temperature Control
      fryerInletTemperature: parseFloat(randomValue(config.fryerInletTemperature, config.fryerInletTemperatureVariance).toFixed(1)),
      fryerInletSetpoint: parseFloat(config.fryerInletSetpoint.toFixed(1)),
      fryerOutletTemperature: parseFloat(randomValue(config.fryerOutletTemperature, config.fryerOutletTemperatureVariance).toFixed(1)),
      temperatureDelta: parseFloat(randomValue(config.temperatureDelta, config.temperatureDeltaVariance).toFixed(1)),
      burnerOutputPercentage: parseFloat(randomValue(config.burnerOutputPercentage, config.burnerOutputVariance).toFixed(1)),
      
      // Oil Make-up System
      usedOilPercentage: Math.floor(randomValue(config.usedOilPercentage, config.usedOilVariance)),
      newOilPercentage: Math.floor(randomValue(config.newOilPercentage, config.newOilVariance)),
      oilLevelMillimeters: Math.floor(randomValue(config.oilLevelMillimeters, config.oilLevelVariance)),
      oilQualityStatus: config.oilQualityStatus,
      valveOutputPercentage: parseFloat(randomValue(config.valveOutputPercentage, config.valveOutputVariance).toFixed(1)),
      
      // Moisture Control System
      actualMoistureContent: parseFloat(randomValue(config.actualMoistureContent, config.actualMoistureContentVariance).toFixed(2)),
      moistureSetpoint: parseFloat(config.moistureSetpoint.toFixed(2)),
      actualOilContent: parseFloat(randomValue(config.actualOilContent, config.actualOilContentVariance).toFixed(1)),
      oilContentSetpoint: parseFloat(config.oilContentSetpoint.toFixed(1)),
      
      // Other Systems / Drives
      masterSpeedPercentage: parseFloat(randomValue(config.masterSpeedPercentage, config.masterSpeedVariance).toFixed(1)),
      masterSpeedLinearValue: Math.floor(randomValue(config.masterSpeedLinearValue, config.masterSpeedLinearVariance)),
      paddleSpeedPercentage: Math.floor(randomValue(config.paddleSpeedPercentage, config.paddleSpeedVariance)),
      submergerSpeedPercentage: Math.floor(randomValue(config.submergerSpeedPercentage, config.submergerSpeedVariance)),
      takeoutSpeedPercentage: Math.floor(randomValue(config.takeoutSpeedPercentage, config.takeoutSpeedVariance)),
      fryerOutfeedControlMode: config.fryerOutfeedControlMode,
      takeoutConveyorStatus: config.takeoutConveyorStatus,
      postFryerControlMode: config.postFryerControlMode,
      
      // Quality Specifications
      sliceThickness: parseFloat(randomValue(config.sliceThickness, config.sliceThicknessVariance).toFixed(3)),
      potatoSolidsPercentage: parseFloat(randomValue(config.potatoSolidsPercentage, config.potatoSolidsVariance).toFixed(1)),
      
      timestamp: new Date().toISOString(),
    };

    return res.json(processData);
  } catch (err) {
    return res.status(500).json({ message: "Internal server error", error: String(err) });
  }
});

// GET /api/machine/:plantId/:machineId/utility
r.get("/:plantId/:machineId/utility", async (req, res) => {
  try {
    const { plantId, machineId } = req.params;
    const config = getMachineConfig(plantId, machineId);
    
    const utilityData = {
      electricalPower: parseFloat(randomValue(config.electricalPower, config.electricalPowerVariance).toFixed(0)),
      electricalPowerUnit: "kW",
      electricalPowerCost: parseFloat((randomValue(config.electricalPower, config.electricalPowerVariance) * 1.2).toFixed(0)),
      electricalPowerCostUnit: "IDR/hr",
      
      steamConsumption: parseFloat(randomValue(config.steamConsumption, config.steamConsumptionVariance).toFixed(1)),
      steamConsumptionUnit: "kg/hr",
      steamConsumptionCost: parseFloat((randomValue(config.steamConsumption, config.steamConsumptionVariance) * 85).toFixed(0)),
      steamConsumptionCostUnit: "IDR/hr",
      
      waterConsumption: parseFloat(randomValue(config.waterConsumption, config.waterConsumptionVariance).toFixed(1)),
      waterConsumptionUnit: "m³/hr",
      waterConsumptionCost: parseFloat((randomValue(config.waterConsumption, config.waterConsumptionVariance) * 12).toFixed(0)),
      waterConsumptionCostUnit: "IDR/hr",
      
      compressedAirConsumption: parseFloat(randomValue(config.compressedAirConsumption, config.compressedAirConsumptionVariance).toFixed(0)),
      compressedAirConsumptionUnit: "L/min",
      compressedAirConsumptionCost: parseFloat((randomValue(config.compressedAirConsumption, config.compressedAirConsumptionVariance) * 0.15).toFixed(0)),
      compressedAirConsumptionCostUnit: "IDR/hr",
      
      naturalGasConsumption: parseFloat(randomValue(config.naturalGasConsumption, config.naturalGasConsumptionVariance).toFixed(1)),
      naturalGasConsumptionUnit: "m³/hr",
      naturalGasConsumptionCost: parseFloat((randomValue(config.naturalGasConsumption, config.naturalGasConsumptionVariance) * 4500).toFixed(0)),
      naturalGasConsumptionCostUnit: "IDR/hr",
      
      timestamp: new Date().toISOString(),
    };

    return res.json(utilityData);
  } catch (err) {
    return res.status(500).json({ message: "Internal server error", error: String(err) });
  }
});

// GET /api/machine/:plantId/:machineId/performance
r.get("/:plantId/:machineId/performance", async (req, res) => {
  try {
    const { plantId, machineId } = req.params;
    const config = getMachineConfig(plantId, machineId);
    
    const actualProduction = randomValue(config.productionRate * 8, config.productionRateVariance * 8);
    const targetProduction = config.productionRate * 8 * 1.15;
    const runRate = actualProduction / 8; // kg/hr
    
    const performanceData = {
      oeePercentage: parseFloat(randomValue(config.oeePercentage, config.oeePercentageVariance).toFixed(1)),
      oeePercentageUnit: "%",
      
      availabilityPercentage: parseFloat(randomValue(config.availabilityPercentage, config.availabilityPercentageVariance).toFixed(1)),
      availabilityPercentageUnit: "%",
      
      performancePercentage: parseFloat(randomValue(config.performancePercentage, config.performancePercentageVariance).toFixed(1)),
      performancePercentageUnit: "%",
      
      qualityPercentage: parseFloat(randomValue(config.qualityPercentage, config.qualityPercentageVariance).toFixed(1)),
      qualityPercentageUnit: "%",
      
      rejectRate: parseFloat(randomValue(config.rejectRate, config.rejectRateVariance).toFixed(2)),
      rejectRateUnit: "%",
      
      downtimeMinutes: parseFloat(randomValue(config.downtimeMinutes, config.downtimeMinutesVariance).toFixed(0)),
      downtimeMinutesUnit: "min",
      
      cycleTime: parseFloat(randomValue(config.cycleTime, config.cycleTimeVariance).toFixed(1)),
      cycleTimeUnit: "sec",
      
      actualProduction: parseFloat(actualProduction.toFixed(0)),
      actualProductionUnit: "kg/shift",
      
      targetProduction: parseFloat(targetProduction.toFixed(0)),
      targetProductionUnit: "kg/shift",
      
      runRate: parseFloat(runRate.toFixed(0)),
      runRateUnit: "kg/hr",
      
      productionEfficiency: parseFloat(randomValue(85, 6).toFixed(1)),
      productionEfficiencyUnit: "%",
      
      energyEfficiency: parseFloat(randomValue(config.electricalPower / config.productionRate, 0.5).toFixed(2)),
      energyEfficiencyUnit: "kWh/kg",
      
      timestamp: new Date().toISOString(),
    };

    return res.json(performanceData);
  } catch (err) {
    return res.status(500).json({ message: "Internal server error", error: String(err) });
  }
});

export default r;
