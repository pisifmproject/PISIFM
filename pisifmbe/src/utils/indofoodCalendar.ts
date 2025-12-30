// Indofood Calendar Mapping Utility
// Based on week-based operational calendar

export interface IndofoodWeek {
  week: number;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}

export interface IndofoodMonth {
  month: string; // 'January', 'February', etc.
  monthNumber: number; // 1-12
  startDate: string;
  endDate: string;
  weeks: IndofoodWeek[];
}

// 2025 Calendar Data
const INDOFOOD_2025: IndofoodMonth[] = [
  {
    month: 'January',
    monthNumber: 1,
    startDate: '2025-01-01',
    endDate: '2025-02-02',
    weeks: [
      { week: 1, startDate: '2025-01-01', endDate: '2025-01-05' },
      { week: 2, startDate: '2025-01-06', endDate: '2025-01-12' },
      { week: 3, startDate: '2025-01-13', endDate: '2025-01-19' },
      { week: 4, startDate: '2025-01-20', endDate: '2025-01-26' },
      { week: 5, startDate: '2025-01-27', endDate: '2025-02-02' },
    ],
  },
  {
    month: 'February',
    monthNumber: 2,
    startDate: '2025-02-03',
    endDate: '2025-03-02',
    weeks: [
      { week: 6, startDate: '2025-02-03', endDate: '2025-02-09' },
      { week: 7, startDate: '2025-02-10', endDate: '2025-02-16' },
      { week: 8, startDate: '2025-02-17', endDate: '2025-02-23' },
      { week: 9, startDate: '2025-02-24', endDate: '2025-03-02' },
    ],
  },
  {
    month: 'March',
    monthNumber: 3,
    startDate: '2025-03-03',
    endDate: '2025-03-30',
    weeks: [
      { week: 10, startDate: '2025-03-03', endDate: '2025-03-09' },
      { week: 11, startDate: '2025-03-10', endDate: '2025-03-16' },
      { week: 12, startDate: '2025-03-17', endDate: '2025-03-23' },
      { week: 13, startDate: '2025-03-24', endDate: '2025-03-30' },
    ],
  },
  {
    month: 'April',
    monthNumber: 4,
    startDate: '2025-03-31',
    endDate: '2025-05-04',
    weeks: [
      { week: 14, startDate: '2025-03-31', endDate: '2025-04-06' },
      { week: 15, startDate: '2025-04-07', endDate: '2025-04-13' },
      { week: 16, startDate: '2025-04-14', endDate: '2025-04-20' },
      { week: 17, startDate: '2025-04-21', endDate: '2025-04-27' },
      { week: 18, startDate: '2025-04-28', endDate: '2025-05-04' },
    ],
  },
  {
    month: 'May',
    monthNumber: 5,
    startDate: '2025-05-05',
    endDate: '2025-06-01',
    weeks: [
      { week: 19, startDate: '2025-05-05', endDate: '2025-05-11' },
      { week: 20, startDate: '2025-05-12', endDate: '2025-05-18' },
      { week: 21, startDate: '2025-05-19', endDate: '2025-05-25' },
      { week: 22, startDate: '2025-05-26', endDate: '2025-06-01' },
    ],
  },
  {
    month: 'June',
    monthNumber: 6,
    startDate: '2025-06-02',
    endDate: '2025-06-30',
    weeks: [
      { week: 23, startDate: '2025-06-02', endDate: '2025-06-08' },
      { week: 24, startDate: '2025-06-09', endDate: '2025-06-15' },
      { week: 25, startDate: '2025-06-16', endDate: '2025-06-22' },
      { week: 26, startDate: '2025-06-23', endDate: '2025-06-30' },
    ],
  },
  {
    month: 'July',
    monthNumber: 7,
    startDate: '2025-07-01',
    endDate: '2025-08-03',
    weeks: [
      { week: 27, startDate: '2025-07-01', endDate: '2025-07-06' },
      { week: 28, startDate: '2025-07-07', endDate: '2025-07-13' },
      { week: 29, startDate: '2025-07-14', endDate: '2025-07-20' },
      { week: 30, startDate: '2025-07-21', endDate: '2025-07-27' },
      { week: 31, startDate: '2025-07-28', endDate: '2025-08-03' },
    ],
  },
  {
    month: 'August',
    monthNumber: 8,
    startDate: '2025-08-04',
    endDate: '2025-08-31',
    weeks: [
      { week: 32, startDate: '2025-08-04', endDate: '2025-08-10' },
      { week: 33, startDate: '2025-08-11', endDate: '2025-08-17' },
      { week: 34, startDate: '2025-08-18', endDate: '2025-08-24' },
      { week: 35, startDate: '2025-08-25', endDate: '2025-08-31' },
    ],
  },
  {
    month: 'September',
    monthNumber: 9,
    startDate: '2025-09-01',
    endDate: '2025-09-28',
    weeks: [
      { week: 36, startDate: '2025-09-01', endDate: '2025-09-07' },
      { week: 37, startDate: '2025-09-08', endDate: '2025-09-14' },
      { week: 38, startDate: '2025-09-15', endDate: '2025-09-21' },
      { week: 39, startDate: '2025-09-22', endDate: '2025-09-28' },
    ],
  },
  {
    month: 'October',
    monthNumber: 10,
    startDate: '2025-09-29',
    endDate: '2025-11-02',
    weeks: [
      { week: 40, startDate: '2025-09-29', endDate: '2025-10-05' },
      { week: 41, startDate: '2025-10-06', endDate: '2025-10-12' },
      { week: 42, startDate: '2025-10-13', endDate: '2025-10-19' },
      { week: 43, startDate: '2025-10-20', endDate: '2025-10-26' },
      { week: 44, startDate: '2025-10-27', endDate: '2025-11-02' },
    ],
  },
  {
    month: 'November',
    monthNumber: 11,
    startDate: '2025-11-03',
    endDate: '2025-11-30',
    weeks: [
      { week: 45, startDate: '2025-11-03', endDate: '2025-11-09' },
      { week: 46, startDate: '2025-11-10', endDate: '2025-11-16' },
      { week: 47, startDate: '2025-11-17', endDate: '2025-11-23' },
      { week: 48, startDate: '2025-11-24', endDate: '2025-11-30' },
    ],
  },
  {
    month: 'December',
    monthNumber: 12,
    startDate: '2025-12-01',
    endDate: '2025-12-31',
    weeks: [
      { week: 49, startDate: '2025-12-01', endDate: '2025-12-07' },
      { week: 50, startDate: '2025-12-08', endDate: '2025-12-14' },
      { week: 51, startDate: '2025-12-15', endDate: '2025-12-21' },
      { week: 52, startDate: '2025-12-22', endDate: '2025-12-31' },
    ],
  },
];

// 2026 Calendar Data (simplified - add more if needed)
const INDOFOOD_2026: IndofoodMonth[] = [
  {
    month: 'January',
    monthNumber: 1,
    startDate: '2026-01-01',
    endDate: '2026-02-01',
    weeks: [
      { week: 1, startDate: '2026-01-01', endDate: '2026-01-04' },
      { week: 2, startDate: '2026-01-05', endDate: '2026-01-11' },
      { week: 3, startDate: '2026-01-12', endDate: '2026-01-18' },
      { week: 4, startDate: '2026-01-19', endDate: '2026-02-01' },
    ],
  },
  // Add more months as needed
];

/**
 * Get Indofood calendar for a specific year
 */
export function getIndofoodCalendar(year: number): IndofoodMonth[] {
  if (year === 2025) return INDOFOOD_2025;
  if (year === 2026) return INDOFOOD_2026;
  return [];
}

/**
 * Get current Indofood month based on today's date
 */
export function getCurrentIndofoodMonth(): IndofoodMonth | null {
  const today = new Date();
  const year = today.getFullYear();
  const calendar = getIndofoodCalendar(year);
  const todayStr = today.toISOString().split('T')[0];

  for (const month of calendar) {
    if (todayStr >= month.startDate && todayStr <= month.endDate) {
      return month;
    }
  }

  return null;
}

/**
 * Get current Indofood week based on today's date
 */
export function getCurrentIndofoodWeek(): IndofoodWeek | null {
  const month = getCurrentIndofoodMonth();
  if (!month) return null;

  const todayStr = new Date().toISOString().split('T')[0];

  for (const week of month.weeks) {
    if (todayStr >= week.startDate && todayStr <= week.endDate) {
      return week;
    }
  }

  return null;
}

/**
 * Get Indofood year range
 */
export function getIndofoodYearRange(year: number): { startDate: string; endDate: string } {
  const calendar = getIndofoodCalendar(year);
  if (calendar.length === 0) {
    return { startDate: `${year}-01-01`, endDate: `${year}-12-31` };
  }

  return {
    startDate: calendar[0].startDate,
    endDate: calendar[calendar.length - 1].endDate,
  };
}

/**
 * Get Indofood month by month number and year
 */
export function getIndofoodMonthByNumber(year: number, monthNumber: number): IndofoodMonth | null {
  const calendar = getIndofoodCalendar(year);
  return calendar.find((m) => m.monthNumber === monthNumber) || null;
}

/**
 * Get month date range based on date type (indofood or nasional/calendar)
 */
export function getMonthDateRange(
  year: number,
  month: number,
  dateType: "indofood" | "nasional"
): { startDate: string; endDate: string } {
  if (dateType === "indofood") {
    const indofoodMonth = getIndofoodMonthByNumber(year, month);
    if (indofoodMonth) {
      return {
        startDate: indofoodMonth.startDate,
        endDate: indofoodMonth.endDate,
      };
    }
  }

  // Fallback to calendar month
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0); // Last day of month

  const pad = (n: number) => String(n).padStart(2, "0");

  return {
    startDate: `${year}-${pad(month)}-01`,
    endDate: `${year}-${pad(month)}-${pad(endDate.getDate())}`,
  };
}
