import { describe, it, expect } from 'vitest';
import { predictionService } from '../services/predictionService';
import { DailyLog } from '../models/types';

describe('predictionService', () => {
  it('handles empty logs gracefully with baseline projection', () => {
    const result = predictionService.calculateEstimate([], 28);
    expect(result.confidenceLabel).toBe('insufficient_data');
    expect(result.averageCycleLength).toBe(28);
    expect(result.logsUsedCount).toBe(0);
    expect(result.isEstimateDisclaimer).toContain('estimates and not medical advice');
  });

  it('handles single period start with tentative confidence', () => {
    const logs: DailyLog[] = [
      {
        id: '1',
        userId: 'u1',
        date: '2026-08-01',
        flowStatus: 'period',
        selfCareActions: [],
        createdAt: '',
        updatedAt: '',
      },
      {
        id: '2',
        userId: 'u1',
        date: '2026-08-02',
        flowStatus: 'period',
        selfCareActions: [],
        createdAt: '',
        updatedAt: '',
      },
    ];

    const result = predictionService.calculateEstimate(logs, 28);
    expect(result.confidenceLabel).toBe('insufficient_data');
    expect(result.cyclesDetectedCount).toBe(1);
    expect(result.predictedStart).toBe('2026-08-29'); // 2026-08-01 + 28 days
  });

  it('calculates robust average for multiple regular cycles', () => {
    // Cycle 1: starts 2026-06-01
    // Cycle 2: starts 2026-06-29 (28 days later)
    // Cycle 3: starts 2026-07-27 (28 days later)
    const logs: DailyLog[] = [
      { id: '1', userId: 'u1', date: '2026-06-01', flowStatus: 'period', selfCareActions: [], createdAt: '', updatedAt: '' },
      { id: '2', userId: 'u1', date: '2026-06-02', flowStatus: 'period', selfCareActions: [], createdAt: '', updatedAt: '' },
      { id: '3', userId: 'u1', date: '2026-06-29', flowStatus: 'period', selfCareActions: [], createdAt: '', updatedAt: '' },
      { id: '4', userId: 'u1', date: '2026-06-30', flowStatus: 'period', selfCareActions: [], createdAt: '', updatedAt: '' },
      { id: '5', userId: 'u1', date: '2026-07-27', flowStatus: 'period', selfCareActions: [], createdAt: '', updatedAt: '' },
      { id: '6', userId: 'u1', date: '2026-07-28', flowStatus: 'period', selfCareActions: [], createdAt: '', updatedAt: '' },
    ];

    const result = predictionService.calculateEstimate(logs, 28);
    expect(result.averageCycleLength).toBe(28);
    expect(result.cyclesDetectedCount).toBe(3);
    expect(result.confidenceLabel).toBe('moderate');
    expect(result.predictedStart).toBe('2026-08-24'); // 2026-07-27 + 28 days
    expect(result.windowStart).toBe('2026-08-21'); // 3 day variance
    expect(result.windowEnd).toBe('2026-08-27');
  });

  it('handles irregular cycles without crashing', () => {
    // Intervals: 26 days, 32 days -> average 29 days
    const logs: DailyLog[] = [
      { id: '1', userId: 'u1', date: '2026-05-01', flowStatus: 'period', selfCareActions: [], createdAt: '', updatedAt: '' },
      { id: '2', userId: 'u1', date: '2026-05-27', flowStatus: 'period', selfCareActions: [], createdAt: '', updatedAt: '' }, // 26 days
      { id: '3', userId: 'u1', date: '2026-06-28', flowStatus: 'period', selfCareActions: [], createdAt: '', updatedAt: '' }, // 32 days
    ];

    const result = predictionService.calculateEstimate(logs, 28);
    expect(result.averageCycleLength).toBe(29);
    expect(result.predictedStart).toBe('2026-07-27');
    expect(result.isEstimateDisclaimer).toBeDefined();
  });

  it('detects cramp pattern correlations without medical diagnosis', () => {
    const logs: DailyLog[] = [
      { id: '1', userId: 'u1', date: '2026-06-01', flowStatus: 'period', cramps: 8, selfCareActions: ['heat_bag'], createdAt: '', updatedAt: '' },
      { id: '2', userId: 'u1', date: '2026-06-29', flowStatus: 'period', cramps: 7, selfCareActions: ['heat_bag'], createdAt: '', updatedAt: '' },
    ];

    const result = predictionService.calculateEstimate(logs, 28);
    expect(result.patternInsights.some(p => p.toLowerCase().includes('cramps'))).toBe(true);
    expect(result.patternInsights.some(p => p.toLowerCase().includes('heat'))).toBe(true);
  });
});
