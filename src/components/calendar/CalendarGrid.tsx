import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  getCalendarMatrix,
  formatMonthYear,
  formatFriendlyDate,
  CalendarDayCell,
} from '../../utils/dateUtils';
import { getContrastTextColor } from '../../utils/colorUtils';
import { DailyLog, CycleEstimate } from '../../models/types';
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Trash2,
  Brush,
  Calendar as CalendarIcon,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';

interface CalendarGridProps {
  currentDate: Date;
  onDateChange: (newDate: Date) => void;
  logs: DailyLog[];
  estimate?: CycleEstimate | null;
  selectedDateKey: string | null;
  onSelectDate: (dateKey: string) => void;
  selectedPaintColor: string;
  onBatchPaint: (dateKeys: string[]) => void;
  onUndoPaint: () => void;
  canUndo: boolean;
  onClearMonth: () => void;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  currentDate,
  onDateChange,
  logs,
  estimate,
  selectedDateKey,
  onSelectDate,
  selectedPaintColor,
  onBatchPaint,
  onUndoPaint,
  canUndo,
  onClearMonth,
}) => {
  const [mode, setMode] = useState<'paint' | 'select'>('paint');
  const [isPainting, setIsPainting] = useState(false);
  const [paintedInCurrentStroke, setPaintedInCurrentStroke] = useState<Set<string>>(new Set());
  const [paintToast, setPaintToast] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const gridContainerRef = useRef<HTMLDivElement>(null);
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Create lookup maps for fast cell rendering
  const logsByDate = React.useMemo(() => {
    const map = new Map<string, DailyLog>();
    logs.forEach(l => map.set(l.date, l));
    return map;
  }, [logs]);

  const matrix = React.useMemo(() => {
    return getCalendarMatrix(year, month);
  }, [year, month]);

  const prevMonth = () => {
    onDateChange(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    onDateChange(new Date(year, month + 1, 1));
  };

  const jumpToToday = () => {
    const today = new Date();
    onDateChange(today);
    const todayKey = today.toISOString().split('T')[0];
    onSelectDate(todayKey);
  };

  // Toast feedback
  const showFeedback = (text: string) => {
    setPaintToast(text);
    setTimeout(() => {
      setPaintToast(null);
    }, 1200);
  };

  // Drag Paint Interaction Handlers
  const handleCellPaint = useCallback((dateKey: string) => {
    if (!paintedInCurrentStroke.has(dateKey)) {
      setPaintedInCurrentStroke(prev => {
        const next = new Set(prev);
        next.add(dateKey);
        return next;
      });
      onBatchPaint([dateKey]);
    }
  }, [paintedInCurrentStroke, onBatchPaint]);

  const onPointerDownCell = (cell: CalendarDayCell, e: React.PointerEvent) => {
    if (mode === 'paint') {
      e.preventDefault();
      setIsPainting(true);
      const initialSet = new Set<string>([cell.key]);
      setPaintedInCurrentStroke(initialSet);
      onBatchPaint([cell.key]);
      showFeedback(`Painted ${cell.dayNumber} ${cell.date.toLocaleString('default', { month: 'short' })}`);
    } else {
      onSelectDate(cell.key);
    }
  };

  const onPointerEnterCell = (cell: CalendarDayCell) => {
    if (mode === 'paint' && isPainting) {
      handleCellPaint(cell.key);
    }
  };

  const onPointerUpGlobal = useCallback(() => {
    if (isPainting) {
      setIsPainting(false);
      setPaintedInCurrentStroke(new Set());
    }
  }, [isPainting]);

  useEffect(() => {
    window.addEventListener('pointerup', onPointerUpGlobal);
    window.addEventListener('pointercancel', onPointerUpGlobal);
    return () => {
      window.removeEventListener('pointerup', onPointerUpGlobal);
      window.removeEventListener('pointercancel', onPointerUpGlobal);
    };
  }, [onPointerUpGlobal]);

  // Check if date falls in predicted estimated period window
  const isEstimatedDate = (dateKey: string): boolean => {
    if (!estimate || !estimate.windowStart || !estimate.windowEnd) return false;
    return dateKey >= estimate.windowStart && dateKey <= estimate.windowEnd;
  };

  const weekDayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-[#F3ECE8] space-y-4">
      {/* Month Navigation & Today Button */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={prevMonth}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#FAF7F5] border border-[#F3ECE8] text-[#4A1525] transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold text-[#4A1525] min-w-[160px] text-center">
            {formatMonthYear(year, month)}
          </h2>
          <button
            type="button"
            onClick={nextMonth}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#FAF7F5] border border-[#F3ECE8] text-[#4A1525] transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={jumpToToday}
            className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[#FFF5F7] text-[#781D42] border border-[#FCE8ED] hover:bg-[#FCE8ED] transition-colors"
          >
            Today
          </button>

          {/* Mode Switcher Tabs */}
          <div className="flex bg-[#FAF7F5] p-1 rounded-full border border-[#F3ECE8]">
            <button
              type="button"
              onClick={() => setMode('paint')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all min-h-[36px] ${
                mode === 'paint'
                  ? 'bg-[#781D42] text-white shadow-xs'
                  : 'text-[#7A6E73] hover:text-[#4A1525]'
              }`}
            >
              <Brush className="w-3.5 h-3.5" />
              <span>Paint Drag</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('select')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all min-h-[36px] ${
                mode === 'select'
                  ? 'bg-[#781D42] text-white shadow-xs'
                  : 'text-[#7A6E73] hover:text-[#4A1525]'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Log Details</span>
            </button>
          </div>
        </div>
      </div>

      {/* Toolbar: Selected paint color, Undo, Clear month, Active mode hint */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-[#FAF7F5] rounded-2xl border border-[#F3ECE8] text-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div
              className="w-4 h-4 rounded-full border border-black/20 shadow-xs"
              style={{ backgroundColor: selectedPaintColor }}
            />
            <span className="text-[#7A6E73]">
              {mode === 'paint' ? 'Drag finger/mouse to paint dates' : 'Tap any date to log symptoms'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onUndoPaint}
            disabled={!canUndo}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border font-medium transition-all ${
              canUndo
                ? 'bg-white border-[#E5DAD4] text-[#781D42] hover:bg-[#FFF5F7]'
                : 'opacity-40 cursor-not-allowed bg-transparent border-transparent text-[#A18A92]'
            }`}
            title="Undo last paint action"
            aria-label="Undo paint"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Undo</span>
          </button>

          <button
            type="button"
            onClick={() => setShowClearConfirm(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#F3ECE8] text-[#8A5A44] hover:bg-[#FFF2EE] transition-colors"
            title="Clear all painted dates in this month"
            aria-label="Clear month"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Month</span>
          </button>
        </div>
      </div>

      {/* Calendar Grid Container (touch-action: none prevents scrolling during drag-painting) */}
      <div
        ref={gridContainerRef}
        className={`w-full select-none ${mode === 'paint' ? 'touch-none' : ''}`}
      >
        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 text-center mb-1">
          {weekDayLabels.map(day => (
            <div key={day} className="text-xs font-semibold text-[#8E7E84] py-1">
              {day}
            </div>
          ))}
        </div>

        {/* 6x7 Calendar Month Matrix */}
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
          {matrix.flat().map(cell => {
            const log = logsByDate.get(cell.key);
            const isSelected = selectedDateKey === cell.key;
            const isEst = isEstimatedDate(cell.key);
            const cellColor = log?.colorHex;
            const hasCramps = (log?.cramps || 0) > 0;
            const contrastTextColor = cellColor ? getContrastTextColor(cellColor) : undefined;

            return (
              <div
                key={cell.key}
                onPointerDown={(e) => onPointerDownCell(cell, e)}
                onPointerEnter={() => onPointerEnterCell(cell)}
                role="button"
                tabIndex={0}
                aria-label={`${formatFriendlyDate(cell.key)}${log ? `, ${log.flowStatus} flow` : ''}${cellColor ? `, painted` : ''}`}
                className={`relative min-h-[50px] sm:min-h-[56px] rounded-2xl flex flex-col items-center justify-between p-1.5 transition-all cursor-pointer ${
                  !cell.isCurrentMonth
                    ? 'opacity-35 bg-[#FAF7F5]/50 text-[#8E7E84]'
                    : cellColor
                    ? 'shadow-xs border border-black/10'
                    : 'bg-[#FAF7F5] text-[#2D2327] hover:bg-[#F3ECE8]'
                } ${
                  isSelected ? 'ring-2 ring-[#781D42] ring-offset-2' : ''
                } ${
                  isEst && !cellColor ? 'border-2 border-dashed border-[#DE738A] bg-[#FFF5F7]' : ''
                }`}
                style={{
                  backgroundColor: cellColor || undefined,
                }}
              >
                {/* Day Number and Today Marker */}
                <div className="w-full flex items-center justify-between">
                  <span
                    className={`text-xs font-bold leading-none ${
                      cell.isToday && !cellColor
                        ? 'w-5 h-5 rounded-full bg-[#781D42] text-white flex items-center justify-center -ml-0.5 -mt-0.5'
                        : ''
                    }`}
                    style={{ color: cellColor ? contrastTextColor : undefined }}
                  >
                    {cell.dayNumber}
                  </span>

                  {/* Estimated window mini indicator */}
                  {isEst && !cellColor && (
                    <span title="Predicted period window">
                      <Sparkles className="w-3 h-3 text-[#DE738A]" />
                    </span>
                  )}
                </div>

                {/* Flow / Symptom Indicator Icons & Dots */}
                <div className="w-full flex items-center justify-center gap-1 mt-auto pb-0.5">
                  {log?.flowStatus === 'period' && (
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: cellColor ? contrastTextColor : '#C8374D' }}
                      title="Period flow logged"
                    />
                  )}
                  {log?.flowStatus === 'spotting' && (
                    <div
                      className="w-1.5 h-1.5 rounded-full border"
                      style={{
                        borderColor: cellColor ? contrastTextColor : '#E27B66',
                        backgroundColor: 'transparent',
                      }}
                      title="Spotting flow logged"
                    />
                  )}
                  {hasCramps && (
                    <div
                      className="w-1.5 h-1.5 rounded-full bg-[#E27B66]"
                      title={`Cramps: ${log?.cramps || 0}/10`}
                    />
                  )}
                  {log?.notes && (
                    <div
                      className="w-1 h-1 rounded-full bg-black/40"
                      title="Has private notes"
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Calendar Legend */}
      <div className="pt-2 border-t border-[#F3ECE8] flex flex-wrap items-center justify-between gap-3 text-xs text-[#7A6E73]">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#C8374D]" />
            <span>Logged Flow</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#E898A8]" />
            <span>Spotting</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-md border border-dashed border-[#DE738A] bg-[#FFF5F7]" />
            <span>Predicted Estimate</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#E27B66]" />
            <span>Cramps logged</span>
          </div>
        </div>
        <p className="text-[11px] text-[#8A5A44] italic">
          * Estimates are projections and not medical advice.
        </p>
      </div>

      {/* Floating Non-Blocking Toast */}
      {paintToast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-[#4A1525] text-white px-4 py-2 rounded-full text-xs font-medium shadow-lg z-50 animate-fade-in">
          {paintToast}
        </div>
      )}

      {/* Clear Month Confirmation Modal Dialog */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-[#F3ECE8]">
            <div className="w-12 h-12 rounded-full bg-[#FFF2EE] flex items-center justify-center text-[#E27B66]">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-[#4A1525]">Clear Painted Dates?</h3>
              <p className="text-xs text-[#7A6E73] mt-1">
                Are you sure you want to clear all painted entries and flow logs for{' '}
                <strong>{formatMonthYear(year, month)}</strong>? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#7A6E73] hover:bg-[#FAF7F5]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onClearMonth();
                  setShowClearConfirm(false);
                  showFeedback('Month cleared');
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#C8374D] text-white hover:bg-[#A92A3D]"
              >
                Clear Month
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
