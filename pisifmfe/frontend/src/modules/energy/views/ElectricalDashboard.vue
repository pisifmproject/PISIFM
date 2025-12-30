<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { PLANTS, type PlantId } from '@/config/app.config';
import { Zap, Activity, ArrowLeft, Download, Calendar } from 'lucide-vue-next';
import { lvmdpService } from '@/modules/energy/services/lvmdp.service';
import type { LVMDPData } from '@/modules/energy/models';
import { getLvmdpShiftToday, getLvmdpTrend } from '@/lib/api';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const route = useRoute();
const router = useRouter();

const plantId = computed(() => route.params.plantId as PlantId);
const plant = computed(() => PLANTS[plantId.value]);

// State for panels data (1-4)
const panels = ref<(LVMDPData | null)[]>([null, null, null, null]);
const unwatchers: (() => void)[] = [];
const isRealData = computed(() => plant.value?.useRealData ?? false);
const lastUpdate = ref(new Date());

// Report State
const reportType = ref<'date' | 'month'>('date');
const dateType = ref<'nasional' | 'indofood'>('nasional');
const selectedDate = ref(new Date().toISOString().split('T')[0]); // YYYY-MM-DD
const selectedMonth = ref(new Date().toISOString().slice(0, 7)); // YYYY-MM
const isGenerating = ref(false);

const indofoodRanges2025: Record<string, { start: string, end: string }> = {
    '01': { start: '2025-01-01', end: '2025-02-02' },
    '02': { start: '2025-02-03', end: '2025-03-02' },
    '03': { start: '2025-03-03', end: '2025-03-30' },
    '04': { start: '2025-03-31', end: '2025-05-04' },
    '05': { start: '2025-05-05', end: '2025-06-01' },
    '06': { start: '2025-06-02', end: '2025-06-30' },
    '07': { start: '2025-07-01', end: '2025-08-03' },
    '08': { start: '2025-08-04', end: '2025-08-31' },
    '09': { start: '2025-09-01', end: '2025-09-28' },
    '10': { start: '2025-09-29', end: '2025-11-02' },
    '11': { start: '2025-11-03', end: '2025-11-30' },
    '12': { start: '2025-12-01', end: '2025-12-31' }
};

const computedPeriod = computed(() => {
    if (reportType.value === 'date') return '';
    
    const [y, m] = selectedMonth.value.split('-');
    if (dateType.value === 'nasional') {
        const lastDay = new Date(Number(y), Number(m), 0).getDate();
        const start = new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
        const end = new Date(Number(y), Number(m) - 1, lastDay).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
        return `${start} - ${end}`;
    } else {
        if (y !== '2025') return "Available for 2025 only";
        
        const range = indofoodRanges2025[m];
        if (!range) return "Invalid Month";
        
        const s = new Date(range.start).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
        const e = new Date(range.end).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
        return `${s} - ${e}`;
    }
});

function navigateToLvmdp(id: number) {
  router.push(`/plant/${plantId.value}/energy/electricity/lvmdp/${id}`);
}

const goBack = () => {
    router.back();
};

// Calculate Plant Totals
const plantStats = computed(() => {
    let totalKva = 0;
    let totalKw = 0;
    let maxCurrent = 0;
    let minCurrent = 999999;
    let validPanels = 0;

    panels.value.forEach(p => {
        if (p) {
            totalKva += p.apparentPower;
            totalKw += p.activePower;
            validPanels++;
            
            // Max/Min logic
            if (p.avgCurrent > maxCurrent) maxCurrent = p.avgCurrent;
            if (p.avgCurrent < minCurrent) minCurrent = p.avgCurrent;
        }
    });

    if (validPanels === 0) minCurrent = 0;

    const capacity = 5540;
    const utilization = capacity > 0 ? (totalKva / capacity) * 100 : 0;
    const avgPf = totalKva > 0 ? (totalKw / totalKva) : 0;

    return {
        totalKva,
        totalKw,
        utilization,
        avgPf,
        maxCurrent,
        minCurrent
    };
});

onMounted(() => {
    [1, 2, 3, 4].forEach(index => {
        const unsub = lvmdpService.subscribe(
            plantId.value, 
            index, 
            (data) => {
                panels.value[index - 1] = data;
                lastUpdate.value = new Date();
            }
        );
        unwatchers.push(unsub);
    });
});

onUnmounted(() => {
    unwatchers.forEach(u => u());
});

const formatNumber = (num: number, decimals = 1) => {
    return num.toLocaleString('id-ID', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
};

// PDF Generation Logic
const generateReport = async () => {
    isGenerating.value = true;
    try {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 15;

        // Constants & Helpers
        const primaryColor = [30, 58, 138];
        const secondaryColor = [59, 130, 246];
        const lightBg = [248, 250, 252];
        const textColor = [51, 65, 85];

        const centerText = (text: string, y: number, size: number, font: string = "helvetica", style: string = "normal", color: number[] = textColor) => {
            doc.setFontSize(size);
            doc.setFont(font, style);
            doc.setTextColor(color[0], color[1], color[2]);
            doc.text(text, pageWidth / 2, y, { align: "center" });
        };

        const reportData = {
            panels: [] as any[],
            totalEnergy: 0,
            avgLoad: 0,
            dateRange: ""
        };

        // Date Range Logic
        if (reportType.value === 'date') {
            const d = new Date(selectedDate.value);
            reportData.dateRange = d.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
        } else {
            reportData.dateRange = computedPeriod.value;
        }

        // Fetch Data Loop
        for (let i = 1; i <= 4; i++) {
            let energy = 0; // Total Energy for the period
            let avgLoad = 0; // Average Load for the period
            let current = 0; // Snapshot/Avg Current
            let voltage = 0; // Snapshot Voltage
            let pf = 0; // Snapshot PF
            let status = 'Offline';

            try {
                const isToday = selectedDate.value === new Date().toISOString().split('T')[0];
                
                if (reportType.value === 'date' && isToday) {
                    const shifts = await getLvmdpShiftToday(i as 1|2|3|4).catch(() => null);
                    if (shifts) {
                        const shiftList = [shifts.shift1, shifts.shift2, shifts.shift3];
                        let totalKwhShift = 0;
                        let countCheck = 0;
                        let totalLoadShift = 0;
                        
                        shiftList.forEach(s => {
                           if (s && s.totalKwh != null) {
                             totalKwhShift += s.totalKwh;
                             if (s.avgKwh > 0 && (s.cosPhi || 1) > 0) {
                                 totalLoadShift += (s.avgKwh / (s.cosPhi || 1));
                                 countCheck++;
                             }
                           }
                        });
                        energy = totalKwhShift;
                        avgLoad = countCheck > 0 ? totalLoadShift / countCheck : 0;
                    }
                } else {
                     // For Monthly, or non-today dates, use Trend Data aggregation
                     let apiPeriod: "day" | "week" | "month" | "year" = "month";
                     let apiDate = selectedMonth.value + '-01'; // Default start of month
                     
                     if (reportType.value === 'date') {
                         apiPeriod = 'day';
                         apiDate = selectedDate.value;
                     } 
                     
                     const trend = await getLvmdpTrend(i as 1|2|3|4, apiPeriod, apiDate).catch(() => null);
                     
                     if (trend && trend.data) {
                         energy = trend.data.reduce((a, b) => a + b, 0);
                         // Approximation: Energy (kWh) / Hours = Avg Power (kW). 
                         // Avg Power / PF = Avg Apparent Power (kVA).
                         // Hours in month = 24 * 30 = 720. 
                         // Hours in day = 24.
                         const hours = apiPeriod === 'month' ? 720 : 24;
                         const estimatedPF = 0.95;
                         avgLoad = (energy / hours) / estimatedPF;
                    }
                }

                // Fallback live data for instant metrics
                const live = panels.value[i-1] || { avgCurrent: 0, phases: { r: { voltageRS: 0 }}, powerFactor: 0, isConnected: false, apparentPower: 0 };
                if (avgLoad === 0 && reportType.value === 'date' && isToday) {
                     // Live data fallback for today if shift data incomplete
                     if (avgLoad === 0) avgLoad = live.apparentPower || 0;
                }

                current = live.avgCurrent;
                voltage = live.phases?.r?.voltageRS || 400; 
                pf = live.powerFactor;
                status = live.isConnected ? 'Online' : 'Offline';

            } catch (e) {
                console.warn(`Failed to fetch data for LVMDP ${i}`, e);
            }

            reportData.panels.push({
                name: `LVMDP ${i}`,
                status,
                energy,
                avgLoad,
                voltage,
                current,
                pf: pf || 0.95
            });

            reportData.totalEnergy += energy;
            reportData.avgLoad += avgLoad; // Aggregating Avg Load of panels ~ Total Plant Load
        }

        // 2. Load Logo
        const logoUrl = "/logo.png";
        let logoData = "";
        let logoRatio = 1;
        try {
            const response = await fetch(logoUrl);
            const blob = await response.blob();
            logoData = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(blob);
            });
             if (logoData) {
                const img = new Image();
                img.src = logoData;
                await new Promise((resolve) => { img.onload = resolve; });
                logoRatio = img.width / img.height;
            }
        } catch (e) { console.warn("Logo load failed", e); }

        let yPos = 15;

        // Render Header
        if (logoData) {
            const maxW = 50; const maxH = 25;
            let lw = maxW; let lh = lw / logoRatio;
            if (lh > maxH) { lh = maxH; lw = lh * logoRatio; }
            doc.addImage(logoData, "PNG", (pageWidth - lw) / 2, yPos, lw, lh);
            yPos += lh + 8;
        } else { yPos += 10; }

        centerText("PT INDOFOOD FORTUNA MAKMUR", yPos, 16, "helvetica", "bold", primaryColor);
        yPos += 7;
        centerText("ELECTRICAL DASHBOARD", yPos, 14, "helvetica", "bold", textColor);
        yPos += 7;
        centerText("Executive Summary Report", yPos, 11, "helvetica", "normal", secondaryColor);
        yPos += 15;

        // Info Bar
        const infoH = 35;
        doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
        doc.setDrawColor(203, 213, 225);
        doc.roundedRect(margin, yPos, pageWidth - margin*2, infoH, 3, 3, "FD");

        const genDate = new Date().toLocaleString("id-ID", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });

        doc.setFontSize(9);
        doc.setTextColor(71, 85, 105);
        doc.setFont("helvetica", "bold");
        doc.text("Report Generated:", margin + 5, yPos + 10);
        doc.setFont("helvetica", "normal");
        doc.text(genDate, margin + 5, yPos + 16);

        doc.setFont("helvetica", "bold");
        doc.text("Period:", margin + 5, yPos + 24);
        doc.setFont("helvetica", "normal");
        doc.text(reportData.dateRange, margin + 20, yPos + 24);

        const midX = pageWidth / 2 + 10;
        doc.setFont("helvetica", "bold");
        doc.text("Total Energy:", midX, yPos + 10);
        doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        doc.setFontSize(11);
        doc.text(`${formatNumber(reportData.totalEnergy, 2)} kWh`, midX, yPos + 18);
        
        doc.setFontSize(9);
        doc.setTextColor(71, 85, 105);
        doc.text("Status:", midX, yPos + 26);
        
        const capacity = 5540;
        const util = (reportData.avgLoad / capacity) * 100;
        const statusTxt = util > 85 ? "CRITICAL" : util > 70 ? "WARNING" : "NORMAL";
        const statusCol = util > 85 ? [220, 38, 38] : util > 70 ? [245, 158, 11] : [22, 163, 74];

        doc.setFillColor(statusCol[0], statusCol[1], statusCol[2]);
        doc.roundedRect(midX + 15, yPos + 22, 22, 6, 2, 2, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.text(statusTxt, midX + 26, yPos + 26, { align: 'center' });

        yPos += infoH + 15;

        // Metrics Cards
        const cardW = (pageWidth - margin*2 - 10) / 3;
        const cardH = 25;

        // Avg Load
        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.roundedRect(margin, yPos, cardW, cardH, 2, 2, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.text("Average Load", margin + cardW/2, yPos + 8, { align: 'center' });
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(`${formatNumber(reportData.avgLoad, 2)} kVA`, margin + cardW/2, yPos + 19, { align: 'center' });

        // Utilization
        doc.setFillColor(statusCol[0], statusCol[1], statusCol[2]); 
        doc.roundedRect(margin + cardW + 5, yPos, cardW, cardH, 2, 2, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.text("Utilization", margin + cardW + 5 + cardW/2, yPos + 8, { align: 'center' });
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(`${formatNumber(util, 1)}%`, margin + cardW + 5 + cardW/2, yPos + 19, { align: 'center' });

        // Capacity
        doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        doc.roundedRect(margin + (cardW + 5)*2, yPos, cardW, cardH, 2, 2, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.text("Installed Capacity", margin + (cardW + 5)*2 + cardW/2, yPos + 8, { align: 'center' });
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(`${capacity} kVA`, margin + (cardW + 5)*2 + cardW/2, yPos + 19, { align: 'center' });

        yPos += cardH + 15;

        // Table
        doc.setFontSize(11);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.setFont("helvetica", "bold");
        doc.text("Panel Distribution Details", margin, yPos);
        doc.setLineWidth(0.5);
        doc.line(margin, yPos + 2, pageWidth - margin, yPos + 2);
        yPos += 8;

        const tableBody = reportData.panels.map(p => [
            p.name,
            p.status,
            formatNumber(p.energy, 2),
            formatNumber(p.avgLoad, 2),
            formatNumber(p.voltage, 2),
            formatNumber(p.current, 2),
            formatNumber(p.pf, 3)
        ]);

        autoTable(doc, {
            startY: yPos,
            head: [['Panel Name', 'Status', 'Energy (kWh)', 'Avg Load (kVA)', 'Voltage (V)', 'Current (A)', 'PF']],
            body: tableBody,
            theme: 'grid',
            headStyles: { 
                fillColor: primaryColor as [number, number, number],
                textColor: 255,
                halign: 'center',
                fontStyle: 'bold'
            },
            bodyStyles: {
                textColor: [51, 65, 85],
                halign: 'right'
            },
            columnStyles: {
                0: { halign: 'left', fontStyle: 'bold' },
                1: { halign: 'center' },
                6: { halign: 'center' }
            },
            styles: {
                fontSize: 9,
                cellPadding: 3
            },
            alternateRowStyles: {
                fillColor: [241, 245, 249]
            },
            didParseCell: function(data) {
                if (data.section === 'body' && data.column.index === 1) {
                    if (data.cell.raw === 'Online') {
                        data.cell.styles.textColor = [22, 163, 74];
                    } else {
                        data.cell.styles.textColor = [220, 38, 38];
                    }
                }
            }
        });

        doc.save(`Electrical_Monitoring_Report_${reportData.dateRange.replace(/ /g, '_')}.pdf`);
    } catch (e) {
        console.error("PDF Generation Error", e);
    } finally {
        isGenerating.value = false;
    }
};

</script>

<template>
  <div class="elec-dashboard">
    <div class="header">
      <div class="header-top">
          <button @click="goBack" class="back-btn">
              <ArrowLeft class="w-5 h-5" />
              <span>Back to Global</span>
          </button>
          
          <!-- Report Controls (New Design) -->
          <div class="report-controls">
              <!-- Report Type -->
              <div class="control-group">
                  <label>Report Type:</label>
                  <select v-model="reportType" class="input-control">
                      <option value="date">By Date</option>
                      <option value="month">By Month</option>
                  </select>
              </div>

               <!-- Month-Only: Date Type -->
              <div class="control-group" v-if="reportType === 'month'">
                  <label>Date Type:</label>
                   <select v-model="dateType" class="input-control">
                      <option value="nasional">By Nasional</option>
                      <option value="indofood">By Indofood</option>
                   </select>
              </div>

               <!-- Date Selection -->
               <div class="control-group" v-if="reportType === 'date'">
                  <label>Select Date:</label>
                  <input type="date" v-model="selectedDate" class="input-control" />
              </div>

               <!-- Month Selection -->
               <div class="control-group" v-if="reportType === 'month'">
                  <label>Select Month:</label>
                  <input type="month" v-model="selectedMonth" class="input-control" />
              </div>

               <!-- Computed Period Display -->
               <div class="period-display" v-if="reportType === 'month'">
                   <Calendar class="w-4 h-4" />
                   <span>Period: {{ computedPeriod }}</span>
               </div>
              
              <!-- Download Button -->
              <button class="download-btn-primary" @click="generateReport" :disabled="isGenerating">
                 <Download v-if="!isGenerating" class="w-4 h-4" />
                 <span v-else>...</span>
                 <span>Download PDF</span>
              </button>
          </div>
      </div>
      
      <div class="title-section">
        <div class="title-row">
            <Zap class="icon-zap" />
            <h1>Power Monitoring System</h1>
            <span class="live-badge">● LIVE</span>
        </div>
        <p class="subtitle">Plant {{ plantId }} - Installed Capacity: 5.540 kVA</p>
      </div>
    </div>

    <!-- Overview Cards -->
    <div class="overview-section">
        <!-- Plant Capacity / Utilization -->
         <div class="main-card utilization-card">
             <div class="card-header">
                 <Activity class="w-4 h-4 text-blue-400" />
                 <span>Plant Capacity Utilization</span>
             </div>
             
             <div class="util-content">
                 <div class="util-bar-container">
                    <div class="util-info">
                        <span class="label">CURRENT LOAD</span>
                        <span class="capacity-label">CAPACITY (5.540 KVA)</span>
                    </div>
                    <div class="progress-track">
                        <div class="progress-fill" :style="{ width: `${Math.min(plantStats.utilization, 100)}%` }">
                            <div class="progress-glow"></div>
                        </div>
                    </div>
                 </div>

                 <div class="util-stats">
                     <div class="stat-big">
                         <span class="value">{{ formatNumber(plantStats.totalKva) }}</span>
                         <span class="unit">kVA (Total Apparent Power)</span>
                     </div>
                     <div class="stat-perc">
                         <span class="perc-value">{{ formatNumber(plantStats.utilization, 2) }}%</span>
                         <span class="perc-label">UTILIZATION</span>
                     </div>
                 </div>
             </div>

             <div class="secondary-stats">
                 <div class="sec-stat">
                     <span class="sec-label">TOTAL ACTIVE POWER</span>
                     <span class="sec-value text-yellow">{{ formatNumber(plantStats.totalKw) }} <small>kW</small></span>
                 </div>
                 <div class="sec-stat">
                     <span class="sec-label">AVG POWER FACTOR</span>
                     <span class="sec-value text-green">{{ formatNumber(plantStats.avgPf, 2) }}</span>
                 </div>
                 <div class="sec-stat">
                     <span class="sec-label">MAX CURRENT (PLANT)</span>
                     <span class="sec-value text-red">{{ formatNumber(plantStats.maxCurrent) }} <small>A</small></span>
                 </div>
                 <div class="sec-stat">
                     <span class="sec-label">MIN CURRENT (PLANT)</span>
                     <span class="sec-value text-blue">{{ formatNumber(plantStats.minCurrent) }} <small>A</small></span>
                 </div>
             </div>
         </div>
    </div>

    <!-- Panel Grid -->
    <div class="panels-grid">
        <div class="grid-header">
            <div class="grid-title">
                <div class="icon-grid"></div>
                <h2>Panel Summaries</h2>
            </div>
        </div>

        <div class="grid-container">
            <div 
              v-for="i in 4" 
              :key="i"
              class="panel-card"
              @click="navigateToLvmdp(i)"
            >
                <div class="p-header">
                    <div class="p-title">
                        <h3>LVMDP {{ i }}</h3>
                        <span class="p-code">LVMDP-{{ i }}</span>
                    </div>
                    <div class="p-action">
                        <Activity class="w-4 h-4" />
                    </div>
                </div>

                <div class="p-body">
                    <div class="p-main-val">
                        <span class="label">APPARENT POWER</span>
                        <div class="val-row">
                            <span class="val">{{ formatNumber(panels[i-1]?.apparentPower || 0) }}</span>
                            <span class="unit">kVA</span>
                        </div>
                        <span class="sub-val">({{ formatNumber(((panels[i-1]?.apparentPower || 0) / 5540) * 100, 1) }}% of 5540 kVA)</span>
                    </div>

                    <div class="p-metrics">
                        <div class="pm-row">
                            <span>CURRENT NOW</span>
                            <div class="text-right">
                                <div class="pm-val">{{ formatNumber(panels[i-1]?.avgCurrent || 0) }} A</div>
                                <div class="pm-sub">{{ formatNumber(((panels[i-1]?.avgCurrent || 0) / 2500) * 100, 1) }}% of 2500 A</div>
                            </div>
                        </div>
                        <div class="pm-row">
                            <span>TOTAL POWER</span>
                            <span class="pm-val text-white">{{ formatNumber(panels[i-1]?.activePower || 0) }} kW</span>
                        </div>
                        <div class="pm-row">
                             <span>VOLTAGE (AVG)</span>
                             <span class="pm-val text-blue">{{ formatNumber(panels[i-1]?.phases.r.voltageRS || 0, 0) }} V</span>
                        </div>
                        <div class="pm-row">
                            <span>POWER FACTOR</span>
                            <span class="pm-val text-green">{{ formatNumber(panels[i-1]?.powerFactor || 0, 2) }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  </div>
</template>

<style scoped>
.elec-dashboard {
    min-height: 100vh;
    background: #0f172a;
    color: #e2e8f0;
    font-family: 'Inter', sans-serif;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

/* Header */
.header {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.header-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.back-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: transparent;
    border: none;
    color: #94a3b8;
    cursor: pointer;
    font-size: 0.9rem;
    transition: color 0.2s;
}

.back-btn:hover { color: white; }

/* Report Controls Styling */
.report-controls {
    display: flex;
    align-items: flex-end;
    gap: 1rem;
}

.control-group {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
}

.control-group label {
    font-size: 0.75rem;
    color: #cbd5e1;
    font-weight: 600;
}

.input-control {
    background: #1e293b;
    border: 1px solid #334155;
    color: white;
    padding: 0.5rem 0.75rem;
    border-radius: 6px;
    font-size: 0.9rem;
    outline: none;
    min-width: 140px;
    transition: border-color 0.2s;
}

.input-control:focus {
    border-color: #3b82f6;
}

.period-display {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(30, 41, 59, 0.5);
    border: 1px solid #334155;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    color: #60a5fa;
    font-size: 0.85rem;
    height: 38px; /* Match input height roughly */
}

.download-btn-primary {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: #3b82f6;
    border: none;
    color: white;
    padding: 0.6rem 1.2rem;
    border-radius: 6px;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
    height: 38px;
}

.download-btn-primary:hover {
    background: #2563eb;
}
.download-btn-primary:disabled {
    background: #475569;
    cursor: not-allowed;
}

.title-section {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.title-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.icon-zap {
    color: #fbbf24;
    fill: #fbbf24;
    width: 1.5rem;
    height: 1.5rem;
}

h1 {
    font-size: 1.5rem;
    font-weight: 700;
    color: white;
    margin: 0;
}

.live-badge {
    background: rgba(34, 197, 94, 0.2);
    color: #4ade80;
    font-size: 0.7rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    border-radius: 99px;
    border: 1px solid rgba(34, 197, 94, 0.3);
}

.subtitle {
    color: #94a3b8;
    font-size: 0.9rem;
    margin-left: 2.25rem;
}

/* Overview Section */
.overview-section {
    display: flex;
    flex-direction: column;
}

.main-card {
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 12px;
    overflow: hidden;
    position: relative;
    /* Glassmorphism subtle */
    background: linear-gradient(145deg, #1e293b 0%, #151e32 100%);
}

.card-header {
    padding: 1rem 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    font-size: 0.9rem;
    font-weight: 600;
    color: #cbd5e1;
}

.util-content {
    padding: 2rem 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.util-bar-container {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.util-info {
    display: flex;
    justify-content: space-between;
    font-size: 0.75rem;
    font-weight: 700;
    color: #94a3b8;
    letter-spacing: 0.05em;
}

.progress-track {
    height: 16px;
    background: #0f172a;
    border-radius: 99px;
    overflow: hidden;
    position: relative;
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.3);
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%);
    border-radius: 99px;
    position: relative;
    transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
}

.progress-glow {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%);
    animation: shimmer 2s infinite;
}

@keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
}

.util-stats {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
}

.stat-big {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
}

.stat-big .value {
    font-size: 2.5rem;
    font-weight: 800;
    color: white;
    line-height: 1;
}

.stat-big .unit {
    color: #94a3b8;
    font-size: 0.9rem;
    font-weight: 500;
}

.stat-perc {
    text-align: right;
}

.perc-value {
    display: block;
    font-size: 2rem;
    font-weight: 800;
    color: #60a5fa;
    line-height: 1;
}

.perc-label {
    font-size: 0.7rem;
    color: #94a3b8;
    font-weight: 700;
    letter-spacing: 0.05em;
}

.secondary-stats {
    background: rgba(15, 23, 42, 0.5);
    border-top: 1px solid rgba(255,255,255,0.05);
    padding: 1.5rem;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
}

.sec-stat {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.sec-label {
    font-size: 0.7rem;
    color: #64748b;
    font-weight: 700;
    text-transform: uppercase;
}

.sec-value {
    font-size: 1.1rem;
    font-weight: 700;
    color: white;
}

.sec-value small { font-size: 0.8rem; color: #94a3b8; font-weight: 500; }
.text-yellow { color: #facc15; }
.text-green { color: #4ade80; }
.text-red { color: #f87171; }
.text-blue { color: #60a5fa; }

/* Panels Grid */
.panels-grid {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.grid-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.grid-title h2 {
    font-size: 1.1rem;
    color: #e2e8f0;
    font-weight: 700;
    margin: 0;
}

.grid-container {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1.5rem;
}

@media (max-width: 1400px) {
    .grid-container { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 768px) {
    .grid-container { grid-template-columns: 1fr; }
    .secondary-stats { grid-template-columns: repeat(2, 1fr); }
    .header-top { flex-direction: column; gap: 1rem; align-items: flex-start; }
    .report-controls { flex-wrap: wrap; width: 100%; }
}

.panel-card {
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 12px;
    padding: 1.25rem;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
    overflow: hidden;
}

.panel-card:hover {
    transform: translateY(-2px);
    border-color: #475569;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
}

.p-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1.25rem;
}

.p-title h3 {
    margin: 0;
    font-size: 0.95rem;
    color: white;
    font-weight: 700;
}

.p-code {
    font-size: 0.75rem;
    color: #64748b;
}

.p-action {
    color: #4ade80; /* Active indicator */
    background: rgba(74, 222, 128, 0.1);
    padding: 0.4rem;
    border-radius: 6px;
}

.p-main-val {
    margin-bottom: 1.25rem;
}

.p-main-val .label {
    display: block;
    font-size: 0.7rem;
    color: #94a3b8;
    font-weight: 700;
    margin-bottom: 0.25rem;
}

.val-row {
    display: flex;
    align-items: baseline;
    gap: 0.4rem;
}

.val-row .val {
    font-size: 2rem;
    font-weight: 800;
    color: white;
    line-height: 1;
}

.val-row .unit {
    color: #64748b;
    font-size: 0.8rem;
    font-weight: 600;
}

.sub-val {
    font-size: 0.75rem;
    color: #64748b;
}

.p-metrics {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    border-top: 1px solid #334155;
    padding-top: 1rem;
}

.pm-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    font-size: 0.8rem;
    color: #94a3b8;
}

.pm-row span { font-weight: 500; font-size: 0.7rem; text-transform: uppercase; }

.pm-val {
    font-weight: 700;
    color: #e2e8f0;
    font-size: 0.9rem;
}

.pm-sub {
    font-size: 0.7rem;
    color: #64748b;
}

.text-white { color: white; }
.text-right { text-align: right; }

</style>
