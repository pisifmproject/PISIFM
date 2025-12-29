// frontend\src\lib\api.ts
import axios from "axios";
import type { LvmdpRow } from "@/types";

export type LvmdpRaw = {
  waktu: string;
  totalKwh: number;
  realPower?: number;
  cosPhi: number;
  freq: number;
  avgLineLine: number;
  avgLineNeut: number;
  avgCurrent: number;
  currentR: number;
  currentS: number;
  currentT: number;
  voltageRS: number;
  voltageST: number;
  voltageTR: number;
};

// Use environment variable for API URL, fallback to relative path for proxy
const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

console.log(`[API] Using baseURL: ${API_BASE_URL}`);

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 10000,
  headers: {
    "Cache-Control": "no-cache, no-store, must-revalidate",
    Pragma: "no-cache",
    Expires: "0",
  },
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

// ---------- LIST ----------
export async function getLvmdp(id: 1 | 2 | 3 | 4): Promise<LvmdpRow[]> {
  // backend kamu masih /lvmdp1, /lvmdp2, ...
  const { data } = await api.get(`/lvmdp${id}`);
  return Array.isArray(data) ? data : data?.data ?? [];
}
// helper lama tetap ada biar mudah pindah
export const getLvmdp1 = () => getLvmdp(1);
export const getLvmdp2 = () => getLvmdp(2);
export const getLvmdp3 = () => getLvmdp(3);
export const getLvmdp4 = () => getLvmdp(4);

export async function getLvmdpLatest(panelId: number) {
  try {
    const { data } = await api.get(`/lvmdp/${panelId}/latest`, {
      params: { _t: Date.now() },
    });
    return data;
  } catch (error: any) {
    throw error;
  }
}
export const getLvmdp1Latest = () => getLvmdpLatest(1);
export const getLvmdp2Latest = () => getLvmdpLatest(2);
export const getLvmdp3Latest = () => getLvmdpLatest(3);
export const getLvmdp4Latest = () => getLvmdpLatest(4);

// Get HMI data (R, S, T current and voltage)
export async function getLvmdpHMI(panelId: 1 | 2 | 3 | 4) {
  const path = { 1: "/lvmdp1", 2: "/lvmdp2", 3: "/lvmdp3", 4: "/lvmdp4" }[
    panelId
  ];
  const { data } = await api.get(`${path}/hmi`);
  return data as {
    currentR: number;
    currentS: number;
    currentT: number;
    voltageRS: number;
    voltageST: number;
    voltageTR: number;
  };
}

export async function getShiftAvg(panelId: 1 | 2 | 3 | 4, date?: string) {
  const path = { 1: "/lvmdp1", 2: "/lvmdp2", 3: "/lvmdp3", 4: "/lvmdp4" }[
    panelId
  ];
  const { data } = await api.get(`${path}/shift-avg`, { params: { date } });
  return data as {
    shift1: {
      avgPower: number;
      avgCurrent: number;
      minCurrent: number;
      maxCurrent: number;
      count: number;
    };
    shift2: {
      avgPower: number;
      avgCurrent: number;
      minCurrent: number;
      maxCurrent: number;
      count: number;
    };
    shift3: {
      avgPower: number;
      avgCurrent: number;
      minCurrent: number;
      maxCurrent: number;
      count: number;
    };
  };
}

// ---------- DAILY REPORT ALL DATES ----------
export async function getDailyReportAll(panelId: 1 | 2 | 3 | 4) {
  // Backend yang kita harapkan:
  // GET /api/lvmdp1/daily-report/all  -> { success:true, data:[ {date,shift1,shift2,shift3}, ... ] }
  const { data } = await api.get(`/lvmdp${panelId}/daily-report/all`);

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.reports)) return data.data.reports;
  return [];
}

// ---------- DAILY HOURLY REPORT ----------
export async function getDailyHourly(panelId: 1 | 2 | 3 | 4, date: string) {
  // Backend yang kita harapkan:
  // GET /api/lvmdp1/daily-report/hourly/:date  -> Array of hourly data
  const { data } = await api.get(
    `/lvmdp${panelId}/daily-report/hourly/${date}`
  );

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

// ---------- UTILITY CONSUMPTION ----------
export async function getUtilityConsumption(
  machineId: string,
  utilityType: string,
  period: "daily" | "monthly" = "daily",
  date?: string
) {
  const { data } = await api.get(`/utility/${machineId}/consumption`, {
    params: { type: utilityType, period, date },
  });
  return data as {
    daily: { current: number; target: number; yesterday: number };
    monthly: { current: number; target: number; lastMonth: number };
    unit: string;
  };
}

export async function getUtilityTrend(
  machineId: string,
  utilityType: string,
  range: "7days" | "30days" | "12months" = "7days"
) {
  const { data } = await api.get(`/utility/${machineId}/trend`, {
    params: { type: utilityType, range },
  });
  return data as Array<{ date: string; value: number; target?: number }>;
}

export async function getUtilitySummary(machineId: string, date?: string) {
  const { data } = await api.get(`/utility/${machineId}/summary`, {
    params: { date },
  });
  return data;
}
