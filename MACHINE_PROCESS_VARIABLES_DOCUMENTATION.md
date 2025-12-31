# Dokumentasi Variabel Process Data per Mesin

## Pendahuluan

Dokumen ini berisi daftar lengkap seluruh variabel yang digunakan pada menu Process untuk setiap mesin dalam sistem Smart Monitoring Plant. Setiap mesin memiliki set variabel yang unik dan independen, tidak saling berbagi data meskipun berada dalam plant yang sama.

**Catatan Penting:**
- Setiap variabel memiliki nilai base yang unik per mesin berdasarkan kombinasi `plantId` dan `machineId`
- Nilai variabel berubah secara dinamis setiap 3 detik dengan variasi (variance) yang telah ditentukan
- Tidak ada dua mesin yang akan menampilkan nilai yang sama pada waktu yang bersamaan
- Variabel menggunakan penamaan yang profesional dan berkesan korporat

---

## Struktur Data

### Endpoint API
```
GET /api/machine/:plantId/:machineId/process
```

### Format Response
Semua nilai dikembalikan dalam format JSON dengan timestamp untuk tracking.

---

## Daftar Variabel Process Data

### 1. Product Information (Informasi Produk)

#### `productName`
- **Tipe**: String
- **Deskripsi**: Nama produk yang sedang diproduksi oleh mesin
- **Nilai Contoh**: "WAVY", "REGULAR"
- **Mapping Real Data**: Nama produk dari sistem ERP atau PLC

#### `operatingMode`
- **Tipe**: String
- **Deskripsi**: Mode operasi mesin saat ini
- **Nilai Contoh**: "NORMAL MODE", "MAINTENANCE MODE"
- **Mapping Real Data**: Status mode operasi dari PLC (Auto/Manual/Maintenance)

#### `systemStatus`
- **Tipe**: Number (Float)
- **Deskripsi**: Status numerik sistem mesin
- **Range**: 1.5 - 2.5
- **Variance**: ±0.15
- **Unit**: -
- **Mapping Real Data**: Status code dari sistem kontrol mesin

#### `plcCommsStatus`
- **Tipe**: String
- **Deskripsi**: Status komunikasi dengan PLC
- **Nilai Contoh**: "OK", "WARNING"
- **Mapping Real Data**: Status komunikasi dari driver PLC (OPC/Modbus)

---

### 2. Prep / Slicing Systems (Sistem Persiapan / Pengiris)

#### `feedFromCratesStatus`
- **Tipe**: String
- **Deskripsi**: Status sistem feed dari crates
- **Nilai Contoh**: "ON", "OFF"
- **Mapping Real Data**: Digital input dari sensor atau relay feed system

#### `peelerOperationalStatus`
- **Tipe**: String
- **Deskripsi**: Status operasional mesin pengupas (peeler)
- **Nilai Contoh**: "ACTIVE", "STANDBY"
- **Mapping Real Data**: Status motor peeler dari VFD atau PLC output

#### `potatoPrepControlMode`
- **Tipe**: String
- **Deskripsi**: Mode kontrol sistem persiapan kentang
- **Nilai Contoh**: "AUTO", "MANUAL"
- **Mapping Real Data**: Mode control dari HMI atau PLC

#### `slicersControlMode`
- **Tipe**: String
- **Deskripsi**: Mode kontrol mesin pengiris (slicers)
- **Nilai Contoh**: "AUTO", "MANUAL"
- **Mapping Real Data**: Mode control dari sistem kontrol slicer

#### `washerDrivesControlMode`
- **Tipe**: String
- **Deskripsi**: Mode kontrol drive sistem pencuci
- **Nilai Contoh**: "AUTO", "MANUAL"
- **Mapping Real Data**: Mode control dari VFD washer system

#### `potatoFeedOperationalStatus`
- **Tipe**: String
- **Deskripsi**: Status operasional sistem feed kentang ke slicers
- **Nilai Contoh**: "ON", "OFF"
- **Mapping Real Data**: Status conveyor atau feed system dari PLC

#### `slicersInclinePercentage`
- **Tipe**: Number (Float)
- **Deskripsi**: Persentase kemiringan slicers
- **Range**: 20.0% - 25.0%
- **Variance**: ±1.5%
- **Unit**: %
- **Mapping Real Data**: Nilai dari actuator atau encoder kemiringan slicer

#### `headTemperature`
- **Tipe**: Number (Integer)
- **Deskripsi**: Suhu head mesin
- **Range**: 35 - 42
- **Variance**: ±2.0
- **Unit**: DEG (Derajat)
- **Mapping Real Data**: Nilai dari sensor suhu head (RTD/Thermocouple)

#### `peelerRotationalSpeed`
- **Tipe**: Number (Integer)
- **Deskripsi**: Kecepatan rotasi mesin pengupas
- **Range**: 1400 - 1500
- **Variance**: ±50
- **Unit**: RPM (Revolutions Per Minute)
- **Mapping Real Data**: Nilai dari encoder atau VFD peeler motor

#### `peelerLoadPercentage`
- **Tipe**: Number (Integer)
- **Deskripsi**: Beban mesin pengupas dalam persentase
- **Range**: 65% - 80%
- **Variance**: ±5.0%
- **Unit**: %
- **Mapping Real Data**: Nilai dari current sensor atau load cell peeler

#### `washerLevelPercentage`
- **Tipe**: Number (Integer)
- **Deskripsi**: Level air dalam sistem pencuci dalam persentase
- **Range**: 75% - 90%
- **Variance**: ±5.0%
- **Unit**: %
- **Mapping Real Data**: Nilai dari level sensor washer tank (ultrasonic/pressure)

#### `washerFlowRate`
- **Tipe**: Number (Float)
- **Deskripsi**: Laju aliran air pencuci
- **Range**: 10.0 - 15.0
- **Variance**: ±1.5
- **Unit**: m³/h (Kubik Meter per Jam)
- **Mapping Real Data**: Nilai dari flow meter pada sistem pencuci

---

### 3. Oil Flow Control (Kontrol Aliran Minyak)

#### `mainOilCirculationRate`
- **Tipe**: Number (Float)
- **Deskripsi**: Laju sirkulasi minyak utama
- **Range**: 4.0 - 5.0
- **Variance**: ±0.2
- **Unit**: L/M (Liter per Menit)
- **Mapping Real Data**: Nilai dari flow meter pada sistem sirkulasi minyak

#### `oilCirculationControlValue`
- **Tipe**: Number (Integer)
- **Deskripsi**: Nilai kontrol sirkulasi minyak
- **Range**: 90 - 100
- **Variance**: ±5
- **Unit**: -
- **Mapping Real Data**: Setpoint atau output dari controller sirkulasi minyak

---

### 4. Fryer Inlet Temperature Control (Kontrol Suhu Inlet Fryer)

#### `fryerInletTemperature`
- **Tipe**: Number (Float)
- **Deskripsi**: Suhu inlet fryer (masuk)
- **Range**: 175.0°C - 180.0°C
- **Variance**: ±2.0°C
- **Unit**: °C (Derajat Celcius)
- **Mapping Real Data**: Nilai dari sensor suhu inlet fryer (RTD/Thermocouple)

#### `fryerInletSetpoint`
- **Tipe**: Number (Float)
- **Deskripsi**: Setpoint suhu inlet fryer
- **Range**: 177.0°C - 179.0°C
- **Unit**: °C (Derajat Celcius)
- **Mapping Real Data**: Setpoint dari PID controller suhu inlet

#### `fryerOutletTemperature`
- **Tipe**: Number (Float)
- **Deskripsi**: Suhu outlet fryer (keluar)
- **Range**: 150.0°C - 156.0°C
- **Variance**: ±2.5°C
- **Unit**: °C (Derajat Celcius)
- **Mapping Real Data**: Nilai dari sensor suhu outlet fryer

#### `temperatureDelta`
- **Tipe**: Number (Float)
- **Deskripsi**: Selisih suhu antara inlet dan outlet fryer
- **Range**: 20.0°C - 30.0°C
- **Variance**: ±3.0°C
- **Unit**: °C (Derajat Celcius)
- **Mapping Real Data**: Dihitung dari selisih `fryerInletTemperature` dan `fryerOutletTemperature`

#### `burnerOutputPercentage`
- **Tipe**: Number (Float)
- **Deskripsi**: Output burner dalam persentase
- **Range**: 40.0% - 50.0%
- **Variance**: ±4.0%
- **Unit**: %
- **Mapping Real Data**: Nilai output dari burner controller atau valve position

---

### 5. Oil Make-up System (Sistem Make-up Minyak)

#### `usedOilPercentage`
- **Tipe**: Number (Integer)
- **Deskripsi**: Persentase minyak bekas dalam sistem
- **Range**: 0% - 5%
- **Variance**: ±1.0%
- **Unit**: %
- **Mapping Real Data**: Nilai dari analisa kualitas minyak atau sensor

#### `newOilPercentage`
- **Tipe**: Number (Integer)
- **Deskripsi**: Persentase minyak baru dalam sistem
- **Range**: 95% - 100%
- **Variance**: ±2.0%
- **Unit**: %
- **Mapping Real Data**: Dihitung dari `100 - usedOilPercentage` atau dari sensor

#### `oilLevelMillimeters`
- **Tipe**: Number (Integer)
- **Deskripsi**: Level minyak dalam tangki dalam milimeter
- **Range**: 140 - 155
- **Variance**: ±5.0
- **Unit**: MM (Milimeter)
- **Mapping Real Data**: Nilai dari level sensor tangki minyak (ultrasonic/pressure)

#### `oilQualityStatus`
- **Tipe**: String
- **Deskripsi**: Status kualitas minyak
- **Nilai Contoh**: "FRESH", "USED"
- **Mapping Real Data**: Status dari analisa kualitas minyak atau sensor kualitas

#### `valveOutputPercentage`
- **Tipe**: Number (Float)
- **Deskripsi**: Output valve make-up minyak dalam persentase
- **Range**: 50.0% - 60.0%
- **Variance**: ±3.0%
- **Unit**: %
- **Mapping Real Data**: Nilai dari valve positioner atau actuator make-up system

---

### 6. Moisture Control System (Sistem Kontrol Kelembaban)

#### `actualMoistureContent`
- **Tipe**: Number (Float)
- **Deskripsi**: Kandungan kelembaban aktual produk
- **Range**: 1.80% - 2.00%
- **Variance**: ±0.15%
- **Unit**: %
- **Mapping Real Data**: Nilai dari moisture analyzer atau sensor kelembaban inline

#### `moistureSetpoint`
- **Tipe**: Number (Float)
- **Deskripsi**: Setpoint kandungan kelembaban target
- **Range**: 1.30% - 1.40%
- **Unit**: %
- **Mapping Real Data**: Setpoint dari recipe atau HMI untuk kontrol kelembaban

#### `actualOilContent`
- **Tipe**: Number (Float)
- **Deskripsi**: Kandungan minyak aktual produk
- **Range**: 25.0% - 28.0%
- **Variance**: ±1.5%
- **Unit**: %
- **Mapping Real Data**: Nilai dari oil content analyzer atau sensor

#### `oilContentSetpoint`
- **Tipe**: Number (Float)
- **Deskripsi**: Setpoint kandungan minyak target
- **Range**: 34.0% - 36.0%
- **Unit**: %
- **Mapping Real Data**: Setpoint dari recipe atau HMI untuk kontrol kandungan minyak

---

### 7. Other Systems / Drives (Sistem Lain / Drive)

#### `masterSpeedPercentage`
- **Tipe**: Number (Float)
- **Deskripsi**: Kecepatan master dalam persentase
- **Range**: 68.0% - 72.0%
- **Variance**: ±2.0%
- **Unit**: %
- **Mapping Real Data**: Nilai dari master speed controller atau VFD master

#### `masterSpeedLinearValue`
- **Tipe**: Number (Integer)
- **Deskripsi**: Nilai linear kecepatan master
- **Range**: 65 - 75
- **Variance**: ±5
- **Unit**: -
- **Mapping Real Data**: Nilai linear dari encoder atau feedback master speed

#### `paddleSpeedPercentage`
- **Tipe**: Number (Integer)
- **Deskripsi**: Kecepatan paddle dalam persentase
- **Range**: 38% - 45%
- **Variance**: ±3.0%
- **Unit**: %
- **Mapping Real Data**: Nilai dari VFD atau controller paddle motor

#### `submergerSpeedPercentage`
- **Tipe**: Number (Integer)
- **Deskripsi**: Kecepatan submerger dalam persentase
- **Range**: 48% - 55%
- **Variance**: ±3.0%
- **Unit**: %
- **Mapping Real Data**: Nilai dari VFD atau controller submerger motor

#### `takeoutSpeedPercentage`
- **Tipe**: Number (Integer)
- **Deskripsi**: Kecepatan take-out dalam persentase
- **Range**: 42% - 48%
- **Variance**: ±3.0%
- **Unit**: %
- **Mapping Real Data**: Nilai dari VFD atau controller take-out motor

#### `fryerOutfeedControlMode`
- **Tipe**: String
- **Deskripsi**: Mode kontrol outfeed fryer
- **Nilai Contoh**: "AUTO", "MANUAL"
- **Mapping Real Data**: Mode control dari sistem outfeed fryer

#### `takeoutConveyorStatus`
- **Tipe**: String
- **Deskripsi**: Status conveyor take-out
- **Nilai Contoh**: "ON", "OFF"
- **Mapping Real Data**: Status dari motor atau drive take-out conveyor

#### `postFryerControlMode`
- **Tipe**: String
- **Deskripsi**: Mode kontrol sistem post-fryer
- **Nilai Contoh**: "AUTO", "MANUAL"
- **Mapping Real Data**: Mode control dari sistem post-fryer

---

### 8. Quality Specifications (Spesifikasi Kualitas)

#### `sliceThickness`
- **Tipe**: Number (Float)
- **Deskripsi**: Ketebalan irisan produk
- **Range**: 1.700 - 1.800
- **Variance**: ±0.05
- **Unit**: mm (Milimeter)
- **Mapping Real Data**: Nilai dari sensor ketebalan atau measurement system

#### `potatoSolidsPercentage`
- **Tipe**: Number (Float)
- **Deskripsi**: Persentase padatan kentang
- **Range**: 19.0% - 21.0%
- **Variance**: ±0.8%
- **Unit**: %
- **Mapping Real Data**: Nilai dari analisa laboratorium atau sensor inline

---

## Implementasi Backend

### Lokasi File
```
pisifmbe/src/routes/machine.router.ts
```

### Fungsi Konfigurasi
Fungsi `getMachineProcessConfig(plantId: string, machineId: string)` digunakan untuk menghasilkan konfigurasi base yang unik untuk setiap mesin berdasarkan kombinasi `plantId` dan `machineId`.

### Algoritma Uniqueness
- Setiap mesin menggunakan seed yang unik: `${plantId}-${machineId}`
- Setiap variabel menggunakan seed tambahan untuk memastikan nilai base yang berbeda
- Menggunakan fungsi `seededRandom()` untuk menghasilkan nilai base yang konsisten
- Nilai aktual dihasilkan dengan menambahkan variance random pada nilai base

### Update Frequency
Data diperbarui setiap kali endpoint dipanggil. Frontend melakukan polling setiap 3 detik untuk mendapatkan data terbaru.

---

## Implementasi Frontend

### Lokasi File
```
pisifmfe/frontend/src/modules/plant/views/MachineDetail.vue
```

### Fungsi Fetching
- Menggunakan fungsi `getMachineProcessData(plantId, machineId)` dari `@/lib/api`
- Data di-fetch setiap 3 detik menggunakan `setInterval`
- Data di-mapping dari format backend ke format frontend untuk kompatibilitas UI

### API Service
Lokasi: `pisifmfe/frontend/src/lib/api.ts`

Fungsi `getMachineProcessData()` melakukan HTTP GET request ke endpoint backend dan mengembalikan data dalam format TypeScript interface yang terdefinisi.

---

## Mapping ke Data Real

Untuk memetakan variabel-variabel ini ke data real dari PLC atau sistem kontrol:

1. **Identifikasi Source Data**: Tentukan dari mana setiap variabel akan diambil (PLC address, database, sensor, dll.)

2. **Mapping Address**: Buat mapping antara variabel dengan alamat/ID di sistem sumber:
   ```typescript
   // Contoh mapping
   const variableMapping = {
     'fryerInletTemperature': 'PLC.DB100.DBD10', // Alamat PLC
     'peelerRotationalSpeed': 'VFD1.RPM',        // VFD register
     'washerFlowRate': 'FlowMeter1.Value'        // Sensor value
   };
   ```

3. **Update Backend**: Modifikasi fungsi `getMachineProcessConfig()` untuk mengambil data dari sumber real alih-alih menggunakan seeded random.

4. **Data Transformation**: Jika diperlukan, tambahkan fungsi transformasi untuk mengkonversi format data dari sumber ke format yang diharapkan.

5. **Error Handling**: Implementasikan error handling untuk menangani kasus ketika data tidak tersedia dari sumber real.

---

## Catatan Penting

1. **Independence**: Setiap mesin memiliki set variabel yang benar-benar independen. Tidak ada sharing data antar mesin.

2. **Uniqueness**: Nilai base setiap variabel dijamin unik per mesin melalui algoritma seeded random.

3. **Dynamic Updates**: Data berubah secara dinamis setiap 3 detik dengan variance yang telah ditentukan.

4. **Professional Naming**: Semua variabel menggunakan penamaan yang profesional dan deskriptif sesuai standar industri.

5. **Type Safety**: Semua variabel memiliki tipe data yang jelas dan terdefinisi dalam TypeScript interface.

6. **Scalability**: Struktur ini memungkinkan penambahan variabel baru tanpa mengubah struktur kode yang ada.

---

## Daftar Mesin per Plant

### Plant Cikokol
- Baked Corn Puff
- Potato Chips Line PC14
- Cassava Inhouse
- Cassava Copack
- Tempe
- Batch Fryer
- Continuous Fryer

### Plant Semarang
- PC 14
- PC 32
- Cassava Inhouse
- Cassava Copack
- Tempe
- Tortilla
- FCP
- Extrude Pellet
- Sheeted Pellet E250
- Sheeted Pellet E500 1
- Sheeted Pellet E500 2
- Batch Fryer
- Continuous Fryer

### Plant Cikupa
- PC 14
- PC 39
- Cassava Inhouse
- Cassava Copack
- Tortilla
- FCP
- TWS 5.6
- TWS 7.2
- Packing Pouch Promina Puff
- Vacuum Fryer 1

### Plant Agro
- Baked Corn Puff
- Potato Chips Line PC14
- Cassava Inhouse
- Cassava Copack
- Tempe
- Batch Fryer
- Continuous Fryer

---

## Versi Dokumen

- **Versi**: 1.0
- **Tanggal**: 2025-01-XX
- **Penulis**: Smart Monitoring Plant Development Team
- **Status**: Production Ready

---

## Kontak

Untuk pertanyaan atau klarifikasi mengenai dokumentasi ini, silakan hubungi tim development.

