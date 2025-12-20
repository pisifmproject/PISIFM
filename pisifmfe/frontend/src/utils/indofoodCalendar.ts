/**
 * Indofood Operational Calendar Utils
 * Berdasarkan kalender operasional Indofood tahun 2026
 * Minggu (Week) dimulai dengan date-date spesifik sesuai kalender
 */

/**
 * Definisi minggu operasional per bulan untuk tahun 2026
 * Format: YYYY-MM untuk bulan, kemudian array tanggal mulai minggu
 * Berdasarkan operational calendar Indofood PT. INDOFOOD SUKSES MAKMUR Tbk
 */
const INDOFOOD_WEEKS_2026: Record<string, number[]> = {
  "2026-01": [1, 5, 12, 19, 26], // January weeks start on these dates
  "2026-02": [2, 9, 16, 23], // February weeks
  "2026-03": [2, 9, 16, 23, 30], // March weeks
  "2026-04": [6, 13, 20, 27], // April weeks
  "2026-05": [4, 11, 18, 25], // May weeks
  "2026-06": [1, 8, 15, 22, 29], // June weeks
  "2026-07": [6, 13, 20, 27], // July weeks
  "2026-08": [3, 10, 17, 24, 31], // August weeks
  "2026-09": [7, 14, 21, 28], // September weeks
  "2026-10": [5, 12, 19, 26], // October weeks
  "2026-11": [2, 9, 16, 23, 30], // November weeks
  "2026-12": [7, 14, 21, 28], // December weeks
};

/**
 * Get week number within a month for a given date
 * Returns: { month: 'YYYY-MM', week: number, startDate: Date, endDate: Date }
 */
export function getIndofoodWeek(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const yearMonth = `${year}-${String(month).padStart(2, "0")}`;

  const weekStarts = INDOFOOD_WEEKS_2026[yearMonth];

  if (!weekStarts) {
    console.warn(`No Indofood calendar data for ${yearMonth}`);
    // Fallback to standard month
    return {
      month: yearMonth,
      week: Math.ceil(day / 7),
      startDate: new Date(year, month - 1, 1),
      endDate: new Date(year, month, 0),
    };
  }

  // Find which week this day belongs to
  let weekNumber = 1;
  let startDate = new Date(year, month - 1, weekStarts[0]);
  let endDate = new Date(year, month - 1, 1);

  for (let i = 0; i < weekStarts.length; i++) {
    const weekStart = weekStarts[i];
    const nextWeekStart = i + 1 < weekStarts.length ? weekStarts[i + 1] : 32; // Day after month if last week

    if (day >= weekStart && day < nextWeekStart) {
      weekNumber = i + 1;
      startDate = new Date(year, month - 1, weekStart);

      if (i + 1 < weekStarts.length) {
        // Next week exists in same month
        endDate = new Date(year, month - 1, weekStarts[i + 1] - 1);
      } else {
        // Last week of month
        endDate = new Date(year, month, 0);
      }
      break;
    }
  }

  return {
    month: yearMonth,
    week: weekNumber,
    startDate,
    endDate,
  };
}

/**
 * Get all dates in a specific Indofood week
 */
export function getIndofoodWeekDates(
  yearMonth: string,
  weekNumber: number
): { start: string; end: string } | null {
  const weekStarts = INDOFOOD_WEEKS_2026[yearMonth];

  if (!weekStarts || weekNumber < 1 || weekNumber > weekStarts.length) {
    console.warn(`Invalid week: ${yearMonth} week ${weekNumber}`);
    return null;
  }

  const [year, month] = yearMonth.split("-").map(Number);
  const startDay = weekStarts[weekNumber - 1];
  const nextWeekDay =
    weekNumber < weekStarts.length ? weekStarts[weekNumber] : 32;
  const endDay = Math.min(nextWeekDay - 1, new Date(year, month, 0).getDate());

  const startDate = `${yearMonth}-${String(startDay).padStart(2, "0")}`;
  const endDate = `${yearMonth}-${String(endDay).padStart(2, "0")}`;

  return { start: startDate, end: endDate };
}

/**
 * Filter data by Indofood month (all weeks in that month)
 */
export function filterByIndofoodMonth(
  data: any[],
  yearMonth: string,
  dateField: string = "reportDate"
): any[] {
  return data.filter((row) => {
    const rowDate = row[dateField] || row.date;
    if (!rowDate) return false;
    const rowYearMonth =
      typeof rowDate === "string"
        ? rowDate.substring(0, 7)
        : new Date(rowDate).toISOString().substring(0, 7);
    return rowYearMonth === yearMonth;
  });
}

/**
 * Filter data by specific Indofood week
 */
export function filterByIndofoodWeek(
  data: any[],
  yearMonth: string,
  weekNumber: number,
  dateField: string = "reportDate"
): any[] {
  const weekDates = getIndofoodWeekDates(yearMonth, weekNumber);
  if (!weekDates) return [];

  return data.filter((row) => {
    const rowDate = row[dateField] || row.date;
    if (!rowDate) return false;

    const rowDateStr =
      typeof rowDate === "string"
        ? rowDate.substring(0, 10)
        : new Date(rowDate).toISOString().substring(0, 10);

    return rowDateStr >= weekDates.start && rowDateStr <= weekDates.end;
  });
}

/**
 * Get all Indofood weeks for a given month
 */
export function getIndofoodWeeksInMonth(yearMonth: string): number {
  return INDOFOOD_WEEKS_2026[yearMonth]?.length || 4;
}
