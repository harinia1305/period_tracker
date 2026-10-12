import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { dailyLogService } from '../../services/dailyLogService';
import { predictionService } from '../../services/predictionService';
import { getTodayKey, formatFriendlyDate } from '../../utils/dateUtils';
import {
  Sparkles,
  Brush,
  Calendar,
  ShoppingBag,
  Heart,
  ChevronRight,
} from 'lucide-react';

export const UserDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const logs = useMemo(() => {
    return dailyLogService.getLogs(currentUser.id);
  }, [currentUser.id]);

  const estimate = useMemo(() => {
    return predictionService.calculateEstimate(logs, currentUser.averageCycleDays || 28);
  }, [logs, currentUser.averageCycleDays]);

  const todayKey = getTodayKey();
  const todayLog = logs.find(l => l.date === todayKey);

  return (
    <div className="space-y-5">
      {/* Empathetic Greeting Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-[#8E7E84] tracking-wide">
            {formatFriendlyDate(todayKey)}
          </span>
          <h1 className="text-2xl font-black text-[#4A1525]">
            Hello, {currentUser.displayName.split(' ')[0]} 🌸
          </h1>
        </div>
        <button
          type="button"
          onClick={() => navigate('/app/profile')}
          className="w-10 h-10 rounded-full bg-white border border-[#F3ECE8] shadow-xs flex items-center justify-center text-[#781D42] font-bold text-sm"
          title="Account profile"
        >
          {currentUser.displayName.charAt(0)}
        </button>
      </div>

      {/* Hero Cycle Status & Prediction Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#4A1525] via-[#781D42] to-[#8E254F] text-white p-6 shadow-md">
        {/* Decorative soft circles */}
        <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute right-12 top-2 w-24 h-24 rounded-full bg-white/10 pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-medium backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#F3ABB9]" />
              <span>Next Estimated Cycle Window</span>
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#F3ABB9] px-2 py-0.5 rounded-full bg-black/20">
              Estimate
            </span>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {formatFriendlyDate(estimate.predictedStart)} – {formatFriendlyDate(estimate.predictedEnd)}
            </h2>
            <p className="text-xs text-[#FCE8ED] mt-1">
              Uncertainty window: {formatFriendlyDate(estimate.windowStart)} to {formatFriendlyDate(estimate.windowEnd)}.
            </p>
          </div>

          <div className="pt-2 border-t border-white/15 flex items-center justify-between text-xs text-[#F3ECE8]">
            <div className="flex items-center gap-1.5">
              <span>Avg Cycle: <strong>{estimate.averageCycleLength} days</strong></span>
              <span>•</span>
              <span>Avg Flow: <strong>{estimate.averageFlowLength} days</strong></span>
            </div>
            <button
              type="button"
              onClick={() => navigate('/app/insights')}
              className="font-bold underline text-[#F3ABB9] hover:text-white text-xs flex items-center gap-0.5"
            >
              <span>Details</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => navigate('/app/calendar?mode=paint')}
          className="p-4 rounded-3xl bg-white border border-[#F3ECE8] shadow-xs hover:border-[#DE738A] transition-all flex flex-col items-start gap-2 text-left group min-h-[48px]"
        >
          <div className="w-10 h-10 rounded-2xl bg-[#FFF5F7] text-[#781D42] flex items-center justify-center group-hover:scale-105 transition-transform">
            <Brush className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#4A1525]">Paint Today's Flow</p>
            <p className="text-[11px] text-[#7A6E73] mt-0.5">Custom gradient shades</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => navigate('/app/calendar?mode=log')}
          className="p-4 rounded-3xl bg-white border border-[#F3ECE8] shadow-xs hover:border-[#DE738A] transition-all flex flex-col items-start gap-2 text-left group min-h-[48px]"
        >
          <div className="w-10 h-10 rounded-2xl bg-[#FAF7F5] text-[#8A5A44] flex items-center justify-center group-hover:scale-105 transition-transform">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#4A1525]">Log Symptoms</p>
            <p className="text-[11px] text-[#7A6E73] mt-0.5">Cramps, mood & remedies</p>
          </div>
        </button>
      </div>

      {/* Today's Log Status Pill */}
      {todayLog ? (
        <div className="p-4 rounded-2xl bg-white border border-[#F3ECE8] shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-7 h-7 rounded-full shadow-inner border border-black/10"
              style={{ backgroundColor: todayLog.colorHex || '#781D42' }}
            />
            <div>
              <p className="text-xs font-bold text-[#4A1525]">Today Logged: {todayLog.flowStatus.replace('_', ' ')}</p>
              <p className="text-[11px] text-[#7A6E73]">
                Cramps: {todayLog.cramps || 0}/10 {todayLog.selfCareActions?.length ? `• ${todayLog.selfCareActions.length} self-care actions` : ''}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/app/calendar?mode=log')}
            className="text-xs font-semibold text-[#781D42] hover:underline"
          >
            Edit
          </button>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-[#FFF5F7] border border-[#FCE8ED] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#DE738A] animate-pulse" />
            <p className="text-xs font-medium text-[#781D42]">
              You haven't logged today yet. Check in with your body.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/app/calendar?mode=log')}
            className="px-3 py-1.5 rounded-full bg-[#781D42] text-white text-xs font-semibold shadow-xs"
          >
            Log Now
          </button>
        </div>
      )}

      {/* Recent Personal Insight Card */}
      <div className="p-4 rounded-3xl bg-white border border-[#F3ECE8] shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-[#C85C74]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#4A1525]">
              Personal Pattern Insight
            </h3>
          </div>
          <span className="text-[10px] text-[#8E7E84]">{estimate.logsUsedCount} logs analyzed</span>
        </div>

        <p className="text-xs text-[#5C4A50] leading-relaxed">
          {estimate.patternInsights[0] || 'Log a few more cycle entries to unlock personalized pattern insights.'}
        </p>

        <p className="text-[11px] text-[#8A5A44] italic pt-1 border-t border-[#F3ECE8]">
          * Pattern observations are based on your personal entries, not medical diagnosis.
        </p>
      </div>

      {/* Discreet Care Shop Shortcut Banner */}
      <div
        onClick={() => navigate('/app/shop')}
        className="cursor-pointer p-4 rounded-3xl bg-gradient-to-r from-[#FAF7F5] to-[#FCEEEB] border border-[#F5DAD2] shadow-xs flex items-center justify-between group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#E27B66] text-white flex items-center justify-center shadow-xs">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#4A1525]">Need Period Comfort Supplies?</h3>
            <p className="text-[11px] text-[#7A6E73] mt-0.5">
              Organic pads, heat cramp patches, dark chocolate & herbal relief.
            </p>
          </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-white text-[#E27B66] flex items-center justify-center group-hover:translate-x-1 transition-transform shadow-xs">
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>

      {/* Medical Safety Disclaimer Link */}
      <div className="p-3 bg-[#FAF7F5] rounded-2xl border border-[#F3ECE8] text-center space-y-1">
        <p className="text-[11px] text-[#8E7E84]">
          Period Love is a personal tracking companion. Tracking insights are estimates and not medical advice. Contact a qualified healthcare professional for concerns.
        </p>
      </div>
    </div>
  );
};
