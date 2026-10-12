import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dailyLogService } from '../../services/dailyLogService';
import { predictionService } from '../../services/predictionService';
import { formatFriendlyDate } from '../../utils/dateUtils';
import {
  Sparkles,
  Heart,
  HelpCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Activity,
} from 'lucide-react';

export const InsightsScreen: React.FC = () => {
  const { currentUser } = useAuth();
  const [showHowItWorks, setShowHowItWorks] = useState<boolean>(false);

  const logs = useMemo(() => {
    return dailyLogService.getLogs(currentUser.id);
  }, [currentUser.id]);

  const estimate = useMemo(() => {
    return predictionService.calculateEstimate(logs, currentUser.averageCycleDays || 28);
  }, [logs, currentUser.averageCycleDays]);

  const confidenceBadge = {
    high: { label: 'High Confidence', bg: 'bg-[#EBF4F0]', text: 'text-[#2F614C]' },
    moderate: { label: 'Moderate Estimate', bg: 'bg-[#FFF9F6]', text: 'text-[#8A5A44]' },
    tentative: { label: 'Tentative (Few Logs)', bg: 'bg-[#FFF5F7]', text: 'text-[#781D42]' },
    insufficient_data: { label: 'Baseline Projection', bg: 'bg-[#FAF7F5]', text: 'text-[#7A6E73]' },
  }[estimate.confidenceLabel];

  return (
    <div className="space-y-5">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-[#4A1525]">Cycle Insights & Estimates</h1>
        <p className="text-xs text-[#7A6E73]">
          Transparent, rule-based projections based solely on your local entries.
        </p>
      </div>

      {/* Main Prediction Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#F3ECE8] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#DE738A]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#4A1525]">
              Next Expected Window
            </span>
          </div>
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${confidenceBadge.bg} ${confidenceBadge.text}`}>
            {confidenceBadge.label}
          </span>
        </div>

        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#4A1525]">
            {formatFriendlyDate(estimate.predictedStart)} – {formatFriendlyDate(estimate.predictedEnd)}
          </h2>
          <p className="text-xs text-[#7A6E73] mt-1">
            Likely window: <strong>{formatFriendlyDate(estimate.windowStart)} to {formatFriendlyDate(estimate.windowEnd)}</strong> (includes ± variance).
          </p>
        </div>

        {/* Diagnostic-free Explanation */}
        <div className="p-3 bg-[#FAF7F5] rounded-2xl border border-[#F3ECE8] text-xs text-[#5C4A50] leading-relaxed">
          {estimate.explanation}
        </div>

        {/* Stat badges */}
        <div className="grid grid-cols-3 gap-2 text-center pt-1">
          <div className="p-3 rounded-2xl bg-[#FAF7F5] border border-[#F3ECE8]">
            <span className="text-[10px] text-[#7A6E73] block uppercase font-medium">Avg Cycle</span>
            <span className="text-base font-bold text-[#4A1525]">{estimate.averageCycleLength}d</span>
          </div>
          <div className="p-3 rounded-2xl bg-[#FAF7F5] border border-[#F3ECE8]">
            <span className="text-[10px] text-[#7A6E73] block uppercase font-medium">Avg Flow</span>
            <span className="text-base font-bold text-[#4A1525]">{estimate.averageFlowLength}d</span>
          </div>
          <div className="p-3 rounded-2xl bg-[#FAF7F5] border border-[#F3ECE8]">
            <span className="text-[10px] text-[#7A6E73] block uppercase font-medium">Logged Entries</span>
            <span className="text-base font-bold text-[#4A1525]">{estimate.logsUsedCount}</span>
          </div>
        </div>
      </div>

      {/* Pattern Insights Section */}
      <div className="bg-white rounded-3xl p-5 border border-[#F3ECE8] shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#C85C74]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#4A1525]">
            Observed Personal Patterns
          </h3>
        </div>

        <div className="space-y-2">
          {estimate.patternInsights.map((insight, idx) => (
            <div
              key={idx}
              className="p-3 rounded-2xl bg-[#FFF5F7] border border-[#FCE8ED] flex items-start gap-2.5 text-xs text-[#4A1525]"
            >
              <Heart className="w-4 h-4 text-[#DE738A] shrink-0 mt-0.5" />
              <p className="leading-relaxed">{insight}</p>
            </div>
          ))}
        </div>

        <p className="text-[11px] text-[#8E7E84] italic">
          Pattern notes reflect repeated tendencies in your logged records. They are not clinical diagnostics.
        </p>
      </div>

      {/* "How This Estimate Works" Expandable Disclosure */}
      <div className="bg-white rounded-3xl p-5 border border-[#F3ECE8] shadow-sm space-y-3">
        <button
          type="button"
          onClick={() => setShowHowItWorks(!showHowItWorks)}
          className="flex items-center justify-between w-full text-xs font-bold text-[#4A1525] hover:text-[#781D42]"
        >
          <span className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-[#781D42]" />
            <span>How This Estimate Works</span>
          </span>
          {showHowItWorks ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showHowItWorks && (
          <div className="text-xs text-[#7A6E73] space-y-3 pt-2 border-t border-[#F3ECE8] leading-relaxed">
            <p>
              1. <strong>Start Date Grouping:</strong> The algorithm identifies days where you logged a period flow.
              Contiguous flow days are grouped into a single cycle episode.
            </p>
            <p>
              2. <strong>Interval Averaging:</strong> The system calculates the number of days between consecutive
              period starts. Outliers (cycles under 18 days or over 65 days) are disregarded to prevent distortion.
            </p>
            <p>
              3. <strong>Uncertainty Projection:</strong> Because human biological rhythms naturally vary with stress,
              sleep, nutrition, and lifestyle, predictions are presented as an uncertainty range rather than a single fixed date.
            </p>
            <p>
              4. <strong>Privacy Safeguard:</strong> All cycle data remains on your browser session and is never sold,
              shared, or used for automated advertising.
            </p>
          </div>
        )}
      </div>

      {/* Mandatory Non-Alarming Health Notice */}
      <div className="p-4 rounded-3xl bg-[#FFF9F6] border border-[#F5DAD2] flex items-start gap-3 text-xs text-[#8A5A44]">
        <AlertCircle className="w-5 h-5 text-[#E27B66] shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-[#5C3D2E]">Health & Safety Disclaimer</h4>
          <p className="mt-0.5 leading-relaxed">
            Period Love is an informational tracking tool. Predictions are mathematical estimates and must never be used
            for diagnostic evaluation, contraception, or pregnancy certainty. If you have concerns about severe pelvic pain,
            irregular cycles, or unusual bleeding, please consult a qualified healthcare professional.
          </p>
        </div>
      </div>
    </div>
  );
};
