/**
 * Date utility functions for local-calendar operations.
 * Operates purely on YYYY-MM-DD formatted strings to avoid timezone shift surprises.
 */

export function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function getTodayKey(): string {
  return formatDateKey(new Date());
}

export function isToday(key: string): boolean {
  return key === getTodayKey();
}

export function addDays(key: string, days: number): string {
  const date = parseDateKey(key);
  date.setDate(date.getDate() + days);
  return formatDateKey(date);
}

export function daysDifference(startKey: string, endKey: string): number {
  const start = parseDateKey(startKey);
  const end = parseDateKey(endKey);
  const diffMs = end.getTime() - start.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export function formatFriendlyDate(key: string): string {
  const date = parseDateKey(key);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function formatMonthYear(year: number, month: number): string {
  const date = new Date(year, month, 1);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

export interface CalendarDayCell {
  key: string;
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
}

/**
 * Returns a 42-day (6 weeks x 7 days) calendar matrix for a given year & month (0-indexed).
 * Week starts on Sunday.
 */
export function getCalendarMatrix(year: number, month: number): CalendarDayCell[][] {
  const firstDayOfMonth = new Date(year, month, 1);
  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday
  
  // Calculate first visible date (may be in previous month)
  const startDate = new Date(year, month, 1 - startDayOfWeek);
  
  const matrix: CalendarDayCell[][] = [];
  const currentDate = new Date(startDate);
  const todayKey = getTodayKey();

  for (let row = 0; row < 6; row++) {
    const week: CalendarDayCell[] = [];
    for (let col = 0; col < 7; col++) {
      const key = formatDateKey(currentDate);
      week.push({
        key,
        date: new Date(currentDate),
        dayNumber: currentDate.getDate(),
        isCurrentMonth: currentDate.getMonth() === month,
        isToday: key === todayKey,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    matrix.push(week);
  }

  return matrix;
}
