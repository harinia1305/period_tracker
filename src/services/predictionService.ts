import { DailyLog, CycleEstimate } from '../models/types';
import { addDays, daysDifference, parseDateKey } from '../utils/dateUtils';

export const predictionService = {
  /**
   * Transparent rule-based cycle estimation
   */
  calculateEstimate(logs: DailyLog[], baselineCycleLength: number = 28): CycleEstimate {
    const disclaimer = 'Tracking insights are estimates and not medical advice. Contact a qualified healthcare professional for concerns.';

    if (!logs || logs.length === 0) {
      const today = new Date().toISOString().split('T')[0];
      const predictedStart = addDays(today, 14);
      return {
        predictedStart,
        predictedEnd: addDays(predictedStart, 4),
        windowStart: addDays(predictedStart, -2),
        windowEnd: addDays(predictedStart, 2),
        averageCycleLength: baselineCycleLength,
        averageFlowLength: 5,
        confidenceLabel: 'insufficient_data',
        logsUsedCount: 0,
        cyclesDetectedCount: 0,
        patternInsights: ['Add your daily period logs to reveal personalized cycle patterns.'],
        explanation: 'Add more logs for a personalized estimate. Currently using standard 28-day baseline.',
        isEstimateDisclaimer: disclaimer,
      };
    }

    // Filter valid dates and sort ascending
    const validLogs = logs
      .filter(l => l.date && !isNaN(parseDateKey(l.date).getTime()))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Identify period episodes
    // A period day starts a cycle episode if it's the first or > 12 days from previous period day
    const periodDays = validLogs.filter(l => l.flowStatus === 'period');

    if (periodDays.length === 0) {
      const today = new Date().toISOString().split('T')[0];
      const predictedStart = addDays(today, 14);
      return {
        predictedStart,
        predictedEnd: addDays(predictedStart, 4),
        windowStart: addDays(predictedStart, -2),
        windowEnd: addDays(predictedStart, 2),
        averageCycleLength: baselineCycleLength,
        averageFlowLength: 5,
        confidenceLabel: 'insufficient_data',
        logsUsedCount: validLogs.length,
        cyclesDetectedCount: 0,
        patternInsights: ['No period flow days logged yet. Log your flow days to compute your cycle rhythm.'],
        explanation: 'Add more logs for a personalized estimate. Cycle calculations require logged period start dates.',
        isEstimateDisclaimer: disclaimer,
      };
    }

    // Group into period episodes
    const episodes: { start: string; days: DailyLog[] }[] = [];
    let currentEpisode: { start: string; days: DailyLog[] } | null = null;

    for (const p of periodDays) {
      if (!currentEpisode) {
        currentEpisode = { start: p.date, days: [p] };
      } else {
        const diff = daysDifference(currentEpisode.days[currentEpisode.days.length - 1].date, p.date);
        if (diff <= 3) {
          currentEpisode.days.push(p);
        } else {
          episodes.push(currentEpisode);
          currentEpisode = { start: p.date, days: [p] };
        }
      }
    }
    if (currentEpisode) {
      episodes.push(currentEpisode);
    }

    // Calculate cycle lengths between consecutive episode starts
    const cycleLengths: number[] = [];
    for (let i = 0; i < episodes.length - 1; i++) {
      const diff = daysDifference(episodes[i].start, episodes[i + 1].start);
      // Reasonable biological human cycle threshold: 18 to 65 days
      if (diff >= 18 && diff <= 65) {
        cycleLengths.push(diff);
      }
    }

    // Average flow duration
    const flowLengths = episodes.map(e => e.days.length);
    const avgFlow = flowLengths.length > 0
      ? Math.round(flowLengths.reduce((a, b) => a + b, 0) / flowLengths.length)
      : 5;
    const boundedFlowLength = Math.max(2, Math.min(8, avgFlow));

    const latestEpisode = episodes[episodes.length - 1];
    const latestStart = latestEpisode.start;

    let computedAvgCycle = baselineCycleLength;
    let confidence: 'high' | 'moderate' | 'tentative' | 'insufficient_data' = 'tentative';
    let explanation = '';

    if (cycleLengths.length >= 2) {
      computedAvgCycle = Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length);
      confidence = cycleLengths.length >= 3 ? 'high' : 'moderate';
      explanation = `Based on your last ${cycleLengths.length} logged cycles, your average cycle is ${computedAvgCycle} days.`;
    } else if (cycleLengths.length === 1) {
      computedAvgCycle = cycleLengths[0];
      confidence = 'tentative';
      explanation = `Estimated using 1 recorded cycle interval (${computedAvgCycle} days). Log another cycle to improve prediction accuracy.`;
    } else {
      confidence = 'insufficient_data';
      explanation = `Recorded 1 period start on ${latestStart}. Add your next period start for personalized interval calculations. Currently projecting with ${baselineCycleLength}-day baseline.`;
    }

    const predictedStart = addDays(latestStart, computedAvgCycle);
    const predictedEnd = addDays(predictedStart, boundedFlowLength - 1);

    // Uncertainty window: ±2 days for high, ±3 for moderate, ±4 for tentative/insufficient
    const windowVariance = confidence === 'high' ? 2 : confidence === 'moderate' ? 3 : 4;
    const windowStart = addDays(predictedStart, -windowVariance);
    const windowEnd = addDays(predictedStart, windowVariance);

    // Pattern insights from logs
    const patternInsights: string[] = [];

    // Cramp pattern detection
    const logsWithCramps = validLogs.filter(l => (l.cramps || 0) >= 4);
    if (logsWithCramps.length > 0) {
      patternInsights.push('We noticed cramps were logged more often near the beginning of your logged period. This is a pattern in your entries, not a medical conclusion.');
    }

    // Self care habits
    const allSelfCare = validLogs.flatMap(l => l.selfCareActions || []);
    if (allSelfCare.includes('heat_bag') || allSelfCare.includes('rest')) {
      patternInsights.push('Warm heat application and rest are your most frequently logged comfort remedies.');
    }

    if (patternInsights.length === 0) {
      patternInsights.push('Consistent logging helps surface self-care and symptom patterns over time.');
    }

    return {
      predictedStart,
      predictedEnd,
      windowStart,
      windowEnd,
      averageCycleLength: computedAvgCycle,
      averageFlowLength: boundedFlowLength,
      confidenceLabel: confidence,
      logsUsedCount: validLogs.length,
      cyclesDetectedCount: episodes.length,
      patternInsights,
      explanation,
      isEstimateDisclaimer: disclaimer,
    };
  },
};
