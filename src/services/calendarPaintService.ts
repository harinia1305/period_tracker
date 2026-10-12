import { DailyLog, FlowStatus } from '../models/types';
import { dailyLogService } from './dailyLogService';

interface PaintActionRecord {
  date: string;
  prevColor?: string;
  prevFlow: FlowStatus;
  prevHadLog: boolean;
  newColor: string;
  newFlow: FlowStatus;
}

// In-memory undo history stack per user
const undoHistory: Record<string, PaintActionRecord[][]> = {};

export const calendarPaintService = {
  /**
   * Paints a single date or multiple dates with a specified color.
   * If a log exists, updates its color and flow. If not, creates an entry.
   * Records changes in undo history stack.
   */
  paintDates(
    userId: string,
    dateKeys: string[],
    colorHex: string,
    flowStatus: FlowStatus = 'period'
  ): DailyLog[] {
    if (!dateKeys.length) return [];

    if (!undoHistory[userId]) {
      undoHistory[userId] = [];
    }

    const currentActionBatch: PaintActionRecord[] = [];
    const updatedLogs: DailyLog[] = [];

    for (const dateKey of dateKeys) {
      const existing = dailyLogService.getLogByDate(userId, dateKey);

      currentActionBatch.push({
        date: dateKey,
        prevColor: existing?.colorHex,
        prevFlow: existing?.flowStatus || 'no_period',
        prevHadLog: !!existing,
        newColor: colorHex,
        newFlow: flowStatus,
      });

      const saved = dailyLogService.saveLog(userId, {
        date: dateKey,
        flowStatus,
        colorHex,
        // preserve other symptoms if already logged
        cramps: existing?.cramps ?? 0,
        notes: existing?.notes,
        selfCareActions: existing?.selfCareActions || [],
      });
      updatedLogs.push(saved);
    }

    undoHistory[userId].push(currentActionBatch);
    // Keep max 30 undo steps
    if (undoHistory[userId].length > 30) {
      undoHistory[userId].shift();
    }

    return updatedLogs;
  },

  /**
   * Reverts the most recent paint action batch
   */
  undo(userId: string): { success: boolean; revertedDates: string[] } {
    const history = undoHistory[userId];
    if (!history || history.length === 0) {
      return { success: false, revertedDates: [] };
    }

    const lastBatch = history.pop()!;
    const revertedDates: string[] = [];

    for (const item of lastBatch) {
      if (!item.prevHadLog) {
        dailyLogService.deleteLog(userId, item.date);
      } else {
        const current = dailyLogService.getLogByDate(userId, item.date);
        if (current) {
          dailyLogService.saveLog(userId, {
            ...current,
            date: item.date,
            flowStatus: item.prevFlow,
            colorHex: item.prevColor || undefined,
          });
        }
      }
      revertedDates.push(item.date);
    }

    return { success: true, revertedDates };
  },

  canUndo(userId: string): boolean {
    return !!(undoHistory[userId] && undoHistory[userId].length > 0);
  },

  clearMonth(userId: string, year: number, month: number): void {
    dailyLogService.clearMonthLogs(userId, year, month);
    // Clear undo stack for safety
    if (undoHistory[userId]) {
      undoHistory[userId] = [];
    }
  },

  clearHistory(userId?: string): void {
    if (userId) {
      delete undoHistory[userId];
    } else {
      for (const k in undoHistory) {
        delete undoHistory[k];
      }
    }
  },
};
