# Fix Summary: Min/Max Current & Indofood Calendar

## Issues Fixed

### Issue 1: Min/Max Current Values Showing 0 (LVMDP 1-4)

**Problem**: In the daily report and hourly report, min/max current values were showing 0.00 A even though data existed in the database.

**Root Cause**: The SQL queries in the hourly report services were calculating min/max values from the aggregated `avg_current` field instead of from the individual phase currents (currentR, currentS, currentT).

**Solution Applied**:

Updated all 4 LVMDP hourly report services:

- `src/lvmdp/LVMDP_1/lvmdp_1.hourlyReport.services.ts`
- `src/lvmdp/LVMDP_2/lvmdp_2.hourlyReport.services.ts`
- `src/lvmdp/LVMDP_3/lvmdp_3.hourlyReport.services.ts`
- `src/lvmdp/LVMDP_4/lvmdp_4.hourlyReport.services.ts`

**SQL Query Changes**:

Changed FROM:

```sql
MIN(avg_current::double precision)::double precision as min_current,
MAX(avg_current::double precision)::double precision as max_current,
```

Changed TO:

```sql
MIN(LEAST(NULLIF(current_r::double precision, 0), NULLIF(current_s::double precision, 0), NULLIF(current_t::double precision, 0)))::double precision as min_current,
MAX(GREATEST(NULLIF(current_r::double precision, 0), NULLIF(current_s::double precision, 0), NULLIF(current_t::double precision, 0)))::double precision as max_current,
```

This change applies to both:

- `generateHourlyReportsFromView()` - for full day aggregation
- `generateSingleHourReport()` - for single hour updates

**Why This Works**:

- The view data contains individual phase currents (currentR, currentS, currentT) with values > 0
- Using LEAST/GREATEST finds the minimum and maximum values across all three phases per row
- This correctly calculates the minimum and maximum current flowing through any phase
- Matches the calculation logic already used in the daily report services (computeAverages function)

**Regeneration Required**:

After deploying this fix, regenerate the hourly and daily reports:

```bash
# Regenerate hourly reports for a specific date
npx ts-node src/scripts/backfillHourlyReports.ts 2025-12-20

# Regenerate daily reports for a date range
npx ts-node src/scripts/backfillDailyReports.ts 2025-12-20 2025-12-21
```

Or trigger the schedulers manually to wait for the next scheduled execution.

---

### Issue 2: Download "By Month" Not Respecting Indofood Calendar

**Problem**: The "Download by Month" feature was filtering data by calendar month (YYYY-MM), but Indofood's operational calendar has custom week boundaries that don't align with calendar months. Users need to download data based on Indofood operational weeks.

**Reference**: From the Indofood operational calendar 2026, each month has specific week start dates defined (e.g., January weeks start on: 1, 5, 12, 19, 26).

**Solution Applied**:

1. **Created new utility file**: `pisifmfe/frontend/src/utils/indofoodCalendar.ts`

   - Defined INDOFOOD_WEEKS_2026 mapping with week boundaries for each month
   - Implemented helper functions:
     - `getIndofoodWeek()` - Get week info for a given date
     - `getIndofoodWeekDates()` - Get date range for a specific week
     - `filterByIndofoodMonth()` - Filter data by all weeks in a month
     - `filterByIndofoodWeek()` - Filter data by specific week

2. **Updated download logic** in `pisifmfe/frontend/src/views/dailyReport/lvmdp/lvmdpDailyReport.vue`:
   - Added import: `import { filterByIndofoodMonth } from "@/utils/indofoodCalendar";`
   - Updated `downloadByMonth()` function to:
     - Check the current dateType selector (nasional vs indofood)
     - Use `filterByIndofoodMonth()` when dateType is "indofood"
     - Fall back to standard month filtering when dateType is "nasional"

**How It Works**:

When user clicks "By Month" with dateType set to "indofood":

1. The system retrieves all daily reports
2. Filters them using `filterByIndofoodMonth()` which applies the Indofood calendar week boundaries
3. Only data from weeks that belong to that operational month is included
4. Exports all matching data

**Date Type Selection**:

The UI already has a dateType selector (radio buttons for "nasional" vs "indofood"):

- **Nasional**: Uses standard calendar month filtering (YYYY-MM)
- **Indofood**: Uses operational calendar week boundaries as defined in indofoodCalendar.ts

---

## Files Modified

### Backend Changes:

1. `src/lvmdp/LVMDP_1/lvmdp_1.hourlyReport.services.ts` - SQL query fix (2 locations)
2. `src/lvmdp/LVMDP_2/lvmdp_2.hourlyReport.services.ts` - SQL query fix (2 locations)
3. `src/lvmdp/LVMDP_3/lvmdp_3.hourlyReport.services.ts` - SQL query fix (2 locations)
4. `src/lvmdp/LVMDP_4/lvmdp_4.hourlyReport.services.ts` - SQL query fix (2 locations)

### Frontend Changes:

1. `pisifmfe/frontend/src/utils/indofoodCalendar.ts` - NEW FILE: Calendar utility functions
2. `pisifmfe/frontend/src/views/dailyReport/lvmdp/lvmdpDailyReport.vue` - Updated import and downloadByMonth()

---

## Verification Steps

### 1. Verify Min/Max Current Fix:

1. Go to Daily Report → LVMDP (1-4)
2. Select a date with data
3. Check Shift Reports table - Min/Max Current columns should show values > 0 (not 0.00)
4. Check Hourly Reports table - Min/Max Current columns should show values > 0 (not 0.00)

### 2. Verify Indofood Calendar Fix:

1. Go to Daily Report → LVMDP
2. Make sure "Indofood" date type is selected
3. Select any date
4. Click "Download" → "By Month"
5. The downloaded file should contain all dates within the operational weeks of that month (not just calendar month dates)
6. Compare with calendar to verify week boundaries match the Indofood operational calendar

### 3. Test Regeneration:

```bash
# Test backfill for today's date
npx ts-node src/scripts/backfillDailyReports.ts 2025-12-20

# Check database to verify min/max current are populated
# SELECT shift1_min_current, shift1_max_current, ... FROM daily_report_lvmdp_1 WHERE report_date = '2025-12-20';
```

---

## Technical Notes

### Min/Max Current Calculation:

The fix uses PostgreSQL functions:

- `LEAST()` - Returns minimum value among arguments
- `GREATEST()` - Returns maximum value among arguments
- `NULLIF()` - Converts 0 values to NULL to properly handle phase currents
  - This prevents 0 values from being used in MIN/MAX calculations
  - Only actual current values are considered

Example: `MIN(LEAST(NULLIF(current_r, 0), NULLIF(current_s, 0), NULLIF(current_t, 0)))`

- For each row: finds the lowest value among the three phases
- Across all rows: returns the minimum of those lowest values

### Indofood Calendar:

The calendar is manually defined based on PT. INDOFOOD SUKSES MAKMUR Tbk operational calendar 2026.

To update for other years, add entries to INDOFOOD_WEEKS_2026 with format:

```typescript
"2027-01": [1, 5, 12, 19, 26], // January 2027 weeks
```

Future enhancement: Could fetch from a configuration service or database instead of hardcoding.

---

## Deployment Checklist

- [ ] Deploy backend changes (LVMDP hourly report services)
- [ ] Deploy frontend changes (indofoodCalendar.ts and lvmdpDailyReport.vue)
- [ ] Clear browser cache to load new indofoodCalendar.ts
- [ ] Run backfill script to regenerate recent reports:
  ```bash
  npx ts-node src/scripts/backfillDailyReports.ts 2025-12-01 2025-12-25
  npx ts-node src/scripts/backfillHourlyReports.ts 2025-12-01
  ```
- [ ] Verify min/max current values in UI (shift and hourly reports)
- [ ] Test "By Month" download with both "nasional" and "indofood" date types
- [ ] Confirm reports now show correct week boundaries for Indofood calendar
