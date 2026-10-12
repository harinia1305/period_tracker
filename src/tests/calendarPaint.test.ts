import { describe, it, expect, beforeEach } from 'vitest';
import { calendarPaintService } from '../services/calendarPaintService';
import { dailyLogService } from '../services/dailyLogService';

describe('calendarPaintService', () => {
  const testUser = 'usr_test_paint';

  beforeEach(() => {
    localStorage.clear();
    calendarPaintService.clearHistory(testUser);
  });

  it('paints multiple dates with selected color', () => {
    const dates = ['2026-09-10', '2026-09-11', '2026-09-12'];
    const painted = calendarPaintService.paintDates(testUser, dates, '#C8374D', 'period');

    expect(painted.length).toBe(3);
    const log1 = dailyLogService.getLogByDate(testUser, '2026-09-10');
    expect(log1).not.toBeNull();
    expect(log1?.colorHex).toBe('#C8374D');
    expect(log1?.flowStatus).toBe('period');
  });

  it('undo reverts the most recent paint action', () => {
    // Initial state: empty
    expect(calendarPaintService.canUndo(testUser)).toBe(false);

    // Paint 2 dates
    calendarPaintService.paintDates(testUser, ['2026-09-15', '2026-09-16'], '#781D42', 'period');
    expect(calendarPaintService.canUndo(testUser)).toBe(true);

    // Verify painted
    expect(dailyLogService.getLogByDate(testUser, '2026-09-15')?.colorHex).toBe('#781D42');

    // Undo
    const undoResult = calendarPaintService.undo(testUser);
    expect(undoResult.success).toBe(true);
    expect(undoResult.revertedDates).toEqual(['2026-09-15', '2026-09-16']);

    // Should no longer have these logs
    expect(dailyLogService.getLogByDate(testUser, '2026-09-15')).toBeNull();
  });

  it('clears all painted dates for a given month', () => {
    calendarPaintService.paintDates(testUser, ['2026-09-01', '2026-09-02'], '#E898A8', 'spotting');
    calendarPaintService.paintDates(testUser, ['2026-10-01'], '#C8374D', 'period');

    // Clear September (month index 8)
    calendarPaintService.clearMonth(testUser, 2026, 8);

    expect(dailyLogService.getLogByDate(testUser, '2026-09-01')).toBeNull();
    expect(dailyLogService.getLogByDate(testUser, '2026-09-02')).toBeNull();
    // October should remain intact
    expect(dailyLogService.getLogByDate(testUser, '2026-10-01')).not.toBeNull();
  });
});
