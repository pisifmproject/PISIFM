# Dokumentasi Variabel Data Dummy - PISIFM Smart Monitoring System

## Ringkasan Sistem

Sistem ini menggunakan generator data dummy terpusat yang berlokasi di `pisifmbe/src/generators/`. Setiap mesin memiliki state yang terisolasi penuh tanpa sharing reference atau global state.

**PENTING**: Modul LVMDP Electricity untuk Plant Cikupa menggunakan data REAL dari database dan TIDAK BOLEH dimodifikasi.

---

## Struktur File Generator

```
pisifmbe/src/generators/
├── index.ts                    # Export terpusat
├── types.ts                    # Definisi tipe data
├── config.ts                   # Konfigurasi variance dan base values
├── machineDataGenerator.ts     # Generator data mesin (process, utility, performance)
├── plantDataGenerator.ts       # Generator data dashboard plant
└── utilityDataGenerator.ts     # Generator data utility (steam, water, dll)
```

---

## Daftar Variabel Per Kategori

### 1. PROCESS DATA VARIABLES (Per Mesin)

Variabel ini di-generate setiap 3 detik dengan variance dari base value yang unik per mesin.

| Nama Variabel | Tipe | Unit | Base Value | Variance | Deskripsi |
|---------------|------|------|------------|----------|-----------|
| `productName` | string | - | WAVY/REGULAR | - | Nama produk yang sedang diproduksi |
| `operatingMode` | string | - | NORMAL MODE | - | Mode operasi mesin (NORMAL/MAINTENANCE) |
| `systemStatus` | number | - | 2.0 | ±0.15 | Status sistem PLC |
| `plcCommsStatus` | string | - | OK | - | Status komunikasi PLC |
| `feedFromCratesStatus` | string | - | ON/OFF | - | Status feed dari crates |
| `peelerOperationalStatus` | string | - | ACTIVE/STANDBY | - | Status operasional peeler |
| `potatoPrepControlMode` | string | - | AUTO/MANUAL | - | Mode kontrol potato prep |
| `slicersControlMode` | string | - | AUTO/MANUAL | - | Mode kontrol slicers |
| `washerDrivesControlMode` | string | - | AUTO/MANUAL | - | Mode kontrol washer drives |
| `potatoFeedOperationalStatus` | string | - | ON/OFF | - | Status operasional potato feed |
| `slicersInclinePercentage` | number | % | 22.5 | ±1.5 | Persentase kemiringan slicers |
| `headTemperature` | number | °C | 38 | ±2.0 | Suhu head |
| `peelerRotationalSpeed` | number | RPM | 1450 | ±50 | Kecepatan rotasi peeler |
| `peelerLoadPercentage` | number | % | 72 | ±5.0 | Persentase beban peeler |
| `washerLevelPercentage` | number | % | 82 | ±5.0 | Persentase level washer |
| `washerFlowRate` | number | m³/h | 12.5 | ±1.5 | Laju aliran washer |
| `mainOilCirculationRate` | number | L/M | 4.4 | ±0.3 | Laju sirkulasi minyak utama |
| `oilCirculationControlValue` | number | - | 97 | ±3 | Nilai kontrol sirkulasi minyak |
| `fryerInletTemperature` | number | °C | 178 | ±2.0 | Suhu inlet fryer |
| `fryerInletSetpoint` | number | °C | 178 | 0 | Setpoint suhu inlet fryer |
| `fryerOutletTemperature` | number | °C | 154 | ±3.0 | Suhu outlet fryer |
| `temperatureDelta` | number | °C | - | - | Selisih suhu inlet-outlet (calculated) |
| `burnerOutputPercentage` | number | % | 44 | ±5.0 | Persentase output burner |
| `usedOilPercentage` | number | % | 5 | ±5 | Persentase minyak bekas |
| `newOilPercentage` | number | % | 95 | ±5 | Persentase minyak baru |
| `oilLevelMillimeters` | number | mm | 150 | ±10 | Level minyak dalam mm |
| `oilQualityStatus` | string | - | FRESH/USED | - | Status kualitas minyak |
| `valveOutputPercentage` | number | % | 55 | ±8 | Persentase output valve |
| `actualMoistureContent` | number | % | 1.9 | ±0.15 | Kandungan kelembaban aktual |
| `moistureSetpoint` | number | % | 1.35 | 0 | Setpoint kelembaban |
| `actualOilContent` | number | % | 27 | ±2.0 | Kandungan minyak aktual |
| `oilContentSetpoint` | number | % | 35 | 0 | Setpoint kandungan minyak |
| `masterSpeedPercentage` | number | % | 70 | ±5.0 | Persentase kecepatan master |
| `masterSpeedLinearValue` | number | - | 67 | ±5 | Nilai linear kecepatan master |
| `paddleSpeedPercentage` | number | % | 42 | ±4.0 | Persentase kecepatan paddle |
| `submergerSpeedPercentage` | number | % | 52 | ±4.0 | Persentase kecepatan submerger |
| `takeoutSpeedPercentage` | number | % | 46 | ±4.0 | Persentase kecepatan takeout |
| `fryerOutfeedControlMode` | string | - | AUTO/MANUAL | - | Mode kontrol fryer outfeed |
| `takeoutConveyorStatus` | string | - | ON/OFF | - | Status conveyor takeout |
| `postFryerControlMode` | string | - | AUTO/MANUAL | - | Mode kontrol post fryer |
| `sliceThickness` | number | mm | 1.75 | ±0.05 | Ketebalan irisan |
| `potatoSolidsPercentage` | number | % | 20 | ±1.5 | Persentase padatan kentang |
| `timestamp` | string | ISO8601 | - | - | Waktu generate data |

---

### 2. UTILITY DATA VARIABLES (Per Mesin)

| Nama Variabel | Tipe | Unit | Base Value | Variance | Deskripsi |
|---------------|------|------|------------|----------|-----------|
| `electricalPower` | number | kW | 5200 | ±800 | Daya listrik yang dikonsumsi |
| `electricalPowerUnit` | string | - | kW | - | Unit daya listrik |
| `electricalPowerCost` | number | IDR/hr | - | - | Biaya listrik per jam |
| `electricalPowerCostUnit` | string | - | IDR/hr | - | Unit biaya listrik |
| `steamConsumption` | number | kg/hr | 85 | ±15 | Konsumsi steam |
| `steamConsumptionUnit` | string | - | kg/hr | - | Unit konsumsi steam |
| `steamConsumptionCost` | number | IDR/hr | - | - | Biaya steam per jam |
| `steamConsumptionCostUnit` | string | - | IDR/hr | - | Unit biaya steam |
| `waterConsumption` | number | m³/hr | 8.5 | ±2.0 | Konsumsi air |
| `waterConsumptionUnit` | string | - | m³/hr | - | Unit konsumsi air |
| `waterConsumptionCost` | number | IDR/hr | - | - | Biaya air per jam |
| `waterConsumptionCostUnit` | string | - | IDR/hr | - | Unit biaya air |
| `compressedAirConsumption` | number | L/min | 7500 | ±1500 | Konsumsi udara terkompresi |
| `compressedAirConsumptionUnit` | string | - | L/min | - | Unit konsumsi udara |
| `compressedAirConsumptionCost` | number | IDR/hr | - | - | Biaya udara per jam |
| `compressedAirConsumptionCostUnit` | string | - | IDR/hr | - | Unit biaya udara |
| `naturalGasConsumption` | number | m³/hr | 45 | ±10 | Konsumsi gas alam |
| `naturalGasConsumptionUnit` | string | - | m³/hr | - | Unit konsumsi gas |
| `naturalGasConsumptionCost` | number | IDR/hr | - | - | Biaya gas per jam |
| `naturalGasConsumptionCostUnit` | string | - | IDR/hr | - | Unit biaya gas |
| `timestamp` | string | ISO8601 | - | - | Waktu generate data |

---

### 3. PERFORMANCE DATA VARIABLES (Per Mesin)

| Nama Variabel | Tipe | Unit | Base Value | Variance | Deskripsi |
|---------------|------|------|------------|----------|-----------|
| `oeePercentage` | number | % | 78 | ±8 | Overall Equipment Effectiveness |
| `availabilityPercentage` | number | % | 88 | ±6 | Ketersediaan mesin |
| `performancePercentage` | number | % | 86 | ±6 | Performa mesin |
| `qualityPercentage` | number | % | 96 | ±2 | Kualitas produk |
| `actualProduction` | number | kg | - | - | Produksi aktual (calculated) |
| `targetProduction` | number | kg | - | - | Target produksi |
| `runRate` | number | kg/hr | 450 | ±80 | Laju produksi |
| `rejectRate` | number | % | 2.5 | ±1.5 | Tingkat reject |
| `downtimeMinutes` | number | min | 20 | ±15 | Waktu downtime |
| `cycleTime` | number | sec | 20 | ±5 | Waktu siklus |
| `mainMotorCurrent` | number | A | 70 | ±15 | Arus motor utama |
| `mainMotorVoltage` | number | V | 385 | ±8 | Tegangan motor utama |
| `mainMotorFrequency` | number | Hz | 50 | ±1 | Frekuensi motor utama |
| `auxiliaryMotorCurrent` | number | A | 25 | ±8 | Arus motor auxiliary |
| `vibrationLevel` | number | mm/s | 4.5 | ±1.5 | Level getaran |
| `bearingTemperature` | number | °C | 60 | ±10 | Suhu bearing |
| `lubricationPressure` | number | bar | 3.5 | ±0.5 | Tekanan pelumasan |
| `filterPressureDrop` | number | bar | 1.5 | ±0.4 | Pressure drop filter |
| `timestamp` | string | ISO8601 | - | - | Waktu generate data |

---

### 4. PLANT DASHBOARD VARIABLES

| Nama Variabel | Tipe | Unit | Deskripsi |
|---------------|------|------|-----------|
| `totalEnergyToday` | number | kWh | Total energi hari ini |
| `utilizationPercent` | number | % | Persentase utilisasi plant |
| `activeAlarms` | number | - | Jumlah alarm aktif |
| `activeMachines` | number | - | Jumlah mesin aktif |
| `totalMachines` | number | - | Total mesin |
| `utilities.electricity.current` | number | kW | Konsumsi listrik saat ini |
| `utilities.electricity.target` | number | kW | Target konsumsi listrik |
| `utilities.steam.current` | number | kg/h | Konsumsi steam saat ini |
| `utilities.steam.target` | number | kg/h | Target konsumsi steam |
| `utilities.water.current` | number | m³/h | Konsumsi air saat ini |
| `utilities.water.target` | number | m³/h | Target konsumsi air |
| `utilities.compressedAir.current` | number | m³/h | Konsumsi udara saat ini |
| `utilities.compressedAir.target` | number | m³/h | Target konsumsi udara |
| `utilities.nitrogen.current` | number | m³/h | Konsumsi nitrogen saat ini |
| `utilities.nitrogen.target` | number | m³/h | Target konsumsi nitrogen |
| `utilities.gas.current` | number | m³/h | Konsumsi gas saat ini |
| `utilities.gas.target` | number | m³/h | Target konsumsi gas |
| `shifts[].shiftNumber` | number | - | Nomor shift (1, 2, 3) |
| `shifts[].shiftName` | string | - | Nama shift |
| `shifts[].timeRange` | string | - | Rentang waktu shift |
| `shifts[].outputKg` | number | kg | Output produksi shift |
| `shifts[].oeePercentage` | number | % | OEE shift |
| `shifts[].status` | string | - | Status shift (COMPLETED/ACTIVE/UPCOMING) |
| `alarms[].title` | string | - | Judul alarm |
| `alarms[].timestamp` | string | - | Waktu alarm |
| `alarms[].location` | string | - | Lokasi alarm |
| `alarms[].type` | string | - | Tipe alarm (WARNING/CRITICAL/INFO) |

---

### 5. MACHINE STATUS VARIABLES

| Nama Variabel | Tipe | Unit | Deskripsi |
|---------------|------|------|-----------|
| `machineId` | string | - | ID mesin |
| `machineName` | string | - | Nama mesin |
| `status` | string | - | Status mesin (RUNNING/STOPPED/MAINTENANCE/IDLE) |
| `outputKg` | number | kg | Output produksi |
| `oeePercentage` | number | % | OEE mesin |
| `warning` | string | - | Pesan warning (opsional) |

---

## Konfigurasi Plant

| Plant ID | Display Name | Location | Has Real Data | Capacity (kVA) |
|----------|--------------|----------|---------------|----------------|
| `cikupa` | Plant Cikupa | Cikupa, Tangerang | ✅ (LVMDP) | 5540 |
| `semarang` | Plant Semarang | Semarang, Central Java | ❌ | 4500 |
| `cikokol` | Plant Cikokol | Cikokol, Tangerang | ❌ | 3800 |
| `agro` | Plant Agro | Agro Industrial Area | ❌ | 3200 |

---

## Daftar Mesin Per Plant

### Plant Cikupa
| Machine ID | Machine Name |
|------------|--------------|
| `pc14` | PC 14 |
| `pc39` | PC 39 |
| `cassava-inhouse` | Cassava Inhouse |
| `cassava-copack` | Cassava Copack |
| `tortilla` | Tortilla |
| `fcp` | FCP |
| `tws56` | TWS 5.6 |
| `tws72` | TWS 7.2 |
| `packing-pouch` | Packing Pouch Promina Puff |
| `vacuum-fryer-1` | Vacuum Fryer 1 |

### Plant Semarang
| Machine ID | Machine Name |
|------------|--------------|
| `pc14` | PC 14 |
| `pc32` | PC 32 |
| `cassava-inhouse` | Cassava Inhouse |
| `cassava-copack` | Cassava Copack |
| `tempe` | Tempe |
| `tortilla` | Tortilla |
| `fcp` | FCP |
| `extrude-pellet` | Extrude Pellet |
| `sheeted-e250` | Sheeted Pellet E250 |
| `sheeted-e500-1` | Sheeted Pellet E500 1 |
| `sheeted-e500-2` | Sheeted Pellet E500 2 |
| `batch-fryer` | Batch Fryer |
| `continuous-fryer` | Continuous Fryer |

### Plant Cikokol
| Machine ID | Machine Name |
|------------|--------------|
| `baked-corn-puff` | Baked Corn Puff |
| `pc14` | Potato Chips Line PC14 |
| `cassava-inhouse` | Cassava Inhouse |
| `cassava-copack` | Cassava Copack |
| `tempe` | Tempe |
| `batch-fryer` | Batch Fryer |
| `continuous-fryer` | Continuous Fryer |

### Plant Agro
| Machine ID | Machine Name |
|------------|--------------|
| `baked-corn-puff` | Baked Corn Puff |
| `pc14` | Potato Chips Line PC14 |
| `cassava-inhouse` | Cassava Inhouse |
| `cassava-copack` | Cassava Copack |
| `tempe` | Tempe |
| `batch-fryer` | Batch Fryer |
| `continuous-fryer` | Continuous Fryer |

---

## Cara Mapping ke Data Real

Untuk mengganti data dummy dengan data real di masa depan:

### 1. Backend (pisifmbe)

Edit file `pisifmbe/src/generators/machineDataGenerator.ts`:

```typescript
// Contoh: Mengganti generateProcessData dengan data real
export async function generateProcessData(plantId: string, machineId: string): Promise<ProcessDataVariables> {
  // Cek apakah mesin ini punya data real
  const hasRealData = await checkRealDataAvailability(plantId, machineId);
  
  if (hasRealData) {
    // Ambil dari database/PLC
    return await fetchRealProcessData(plantId, machineId);
  }
  
  // Fallback ke dummy data
  const state = getMachineState(plantId, machineId);
  // ... existing dummy logic
}
```

### 2. Menambah Variabel Baru

1. Tambahkan tipe di `types.ts`
2. Tambahkan konfigurasi di `config.ts`
3. Update generator di `machineDataGenerator.ts`
4. Update API response di `machine.router.ts`
5. Update frontend types di `api.ts`

### 3. Mengubah Variance

Edit file `pisifmbe/src/generators/config.ts`:

```typescript
export const PROCESS_VARIABLE_CONFIG = {
  // Ubah variance sesuai kebutuhan
  slicersInclinePercentage: { 
    baseValue: 22.5, 
    variance: 1.5,  // Ubah nilai ini
    min: 18, 
    max: 28, 
    decimals: 1 
  },
  // ...
};
```

---

## API Endpoints

| Endpoint | Method | Deskripsi |
|----------|--------|-----------|
| `/api/machine/:plantId/:machineId/process` | GET | Data proses mesin |
| `/api/machine/:plantId/:machineId/utility` | GET | Data utility mesin |
| `/api/machine/:plantId/:machineId/performance` | GET | Data performa mesin |
| `/api/plants/:plantId/dashboard` | GET | Dashboard plant |
| `/api/plants/:plantId/machines` | GET | Daftar mesin plant |
| `/api/utility/:machineId/consumption` | GET | Konsumsi utility |
| `/api/utility/:machineId/trend` | GET | Trend utility |
| `/api/utility/:machineId/summary` | GET | Summary utility |

---

## Catatan Penting

1. **LVMDP Electricity Cikupa**: Data REAL dari database, JANGAN dimodifikasi
2. **Refresh Rate**: Data di-refresh setiap 3 detik di frontend
3. **Isolated State**: Setiap mesin memiliki state independen
4. **Seeded Random**: Base value konsisten per mesin menggunakan hash dari `plantId-machineId`
5. **Variance**: Nilai berfluktuasi dalam range variance setiap refresh

---

## Versi Dokumen

- **Versi**: 1.0.0
- **Tanggal**: 31 Desember 2025
- **Author**: Kiro AI Assistant
