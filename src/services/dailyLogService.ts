import { DailyLog, FlowStatus } from '../models/types';
import { generateSeedDailyLogs } from '../data/seedData';

function getStorageKey(userId: string): string {
  return `period_love_logs_${userId}`;
}

export const dailyLogService = {
  getLogs(userId: string): DailyLog[] {
    const key = getStorageKey(userId);
    try {
      const raw = localStorage.getItem(key);
      if (!raw) {
        // First time initialization with seed data
        const initial = generateSeedDailyLogs(userId);
        localStorage.setItem(key, JSON.stringify(initial));
        return initial;
      }
      return JSON.parse(raw);
    } catch {
      return generateSeedDailyLogs(userId);
    }
  },

  getLogByDate(userId: string, dateKey: string): DailyLog | null {
    const logs = this.getLogs(userId);
    return logs.find(l => l.date === dateKey) || null;
  },

  saveLog(
    userId: string,
    data: Partial<DailyLog> & { date: string; flowStatus: FlowStatus }
  ): DailyLog {
    const logs = this.getLogs(userId);
    const existingIndex = logs.findIndex(l => l.date === data.date);
    const now = new Date().toISOString();

    let savedLog: DailyLog;

    if (existingIndex !== -1) {
      savedLog = {
        ...logs[existingIndex],
        ...data,
        updatedAt: now,
      };
      logs[existingIndex] = savedLog;
    } else {
      savedLog = {
        id: `log_${data.date}_${Date.now()}`,
        userId,
        date: data.date,
        flowStatus: data.flowStatus,
        colorHex: data.colorHex || undefined,
        cramps: data.cramps ?? 0,
        backPain: data.backPain ?? 0,
        headache: data.headache ?? 0,
        bloating: data.bloating ?? 0,
        nausea: data.nausea ?? 0,
        fatigue: data.fatigue ?? 0,
        mood: data.mood ?? 3,
        cravings: data.cravings ?? 0,
        sleepQuality: data.sleepQuality ?? 3,
        selfCareActions: data.selfCareActions || [],
        notes: data.notes || '',
        createdAt: now,
        updatedAt: now,
      };
      logs.push(savedLog);
    }

    try {
      localStorage.setItem(getStorageKey(userId), JSON.stringify(logs));
    } catch {
      // ignore
    }

    return savedLog;
  },

  deleteLog(userId: string, dateKey: string): boolean {
    const logs = this.getLogs(userId);
    const filtered = logs.filter(l => l.date !== dateKey);
    if (filtered.length !== logs.length) {
      try {
        localStorage.setItem(getStorageKey(userId), JSON.stringify(filtered));
      } catch {
        // ignore
      }
      return true;
    }
    return false;
  },

  clearMonthLogs(userId: string, year: number, month: number): void {
    const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
    const logs = this.getLogs(userId);
    const filtered = logs.filter(l => !l.date.startsWith(monthPrefix));
    try {
      localStorage.setItem(getStorageKey(userId), JSON.stringify(filtered));
    } catch {
      // ignore
    }
  },
};
