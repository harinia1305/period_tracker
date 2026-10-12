import React, { useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { dailyLogService } from '../../services/dailyLogService';
import { calendarPaintService } from '../../services/calendarPaintService';
import { predictionService } from '../../services/predictionService';
import { CalendarGrid } from '../../components/calendar/CalendarGrid';
import { GradientColorPicker } from '../../components/color-picker/GradientColorPicker';
import { DailyLogDrawer } from '../../components/calendar/DailyLogDrawer';
import { DailyLog, FlowStatus } from '../../models/types';
import { getTodayKey } from '../../utils/dateUtils';
import {
  Palette,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const CalendarScreen: React.FC = () => {
  const { currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const initialDate = new Date();

  const [currentDate, setCurrentDate] = useState<Date>(initialDate);
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(() => {
    return searchParams.get('mode') === 'log' ? getTodayKey() : null;
  });
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(() => {
    return searchParams.get('mode') === 'log';
  });

  const [selectedPaintColor, setSelectedPaintColor] = useState<string>('#C8374D');
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Fresh list of logs
  const [logsState, setLogsState] = useState<DailyLog[]>(() => {
    return dailyLogService.getLogs(currentUser.id);
  });

  const refreshLogs = useCallback(() => {
    const updated = dailyLogService.getLogs(currentUser.id);
    setLogsState(updated);
  }, [currentUser.id]);

  const canUndo = calendarPaintService.canUndo(currentUser.id);

  const estimate = useMemo(() => {
    return predictionService.calculateEstimate(logsState, currentUser.averageCycleDays || 28);
  }, [logsState, currentUser.averageCycleDays]);

  // Batch paint callback for pointer drag
  const handleBatchPaint = useCallback((dateKeys: string[]) => {
    calendarPaintService.paintDates(currentUser.id, dateKeys, selectedPaintColor, 'period');
    refreshLogs();
    setSaveStatus('Saved');
    setTimeout(() => setSaveStatus(null), 1500);
  }, [currentUser.id, selectedPaintColor, refreshLogs]);

  const handleUndoPaint = useCallback(() => {
    const res = calendarPaintService.undo(currentUser.id);
    if (res.success) {
      refreshLogs();
      setSaveStatus('Undone');
      setTimeout(() => setSaveStatus(null), 1500);
    }
  }, [currentUser.id, refreshLogs]);

  const handleClearMonth = useCallback(() => {
    calendarPaintService.clearMonth(currentUser.id, currentDate.getFullYear(), currentDate.getMonth());
    refreshLogs();
    setSaveStatus('Month cleared');
    setTimeout(() => setSaveStatus(null), 1500);
  }, [currentUser.id, currentDate, refreshLogs]);

  const handleSelectDate = useCallback((dateKey: string) => {
    setSelectedDateKey(dateKey);
    setIsDrawerOpen(true);
  }, []);

  const handleSaveDailyLog = useCallback((data: Partial<DailyLog> & { date: string; flowStatus: FlowStatus }) => {
    dailyLogService.saveLog(currentUser.id, data);
    refreshLogs();
    setSaveStatus('Saved entry');
    setTimeout(() => setSaveStatus(null), 1500);
  }, [currentUser.id, refreshLogs]);

  const handleDeleteDailyLog = useCallback((dateKey: string) => {
    dailyLogService.deleteLog(currentUser.id, dateKey);
    refreshLogs();
    setSaveStatus('Deleted entry');
    setTimeout(() => setSaveStatus(null), 1500);
  }, [currentUser.id, refreshLogs]);

  const activeLog = selectedDateKey ? logsState.find(l => l.date === selectedDateKey) || null : null;

  return (
    <div className="space-y-4">
      {/* Screen Title & Persistence Indicator */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#4A1525]">Cycle Calendar</h1>
          <p className="text-xs text-[#7A6E73]">
            Finger-paint your flow or tap dates to record symptoms.
          </p>
        </div>

        {/* Local Persistence Status */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#F3ECE8] text-[11px] text-[#3F755E] shadow-xs">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{saveStatus || 'Synced Locally'}</span>
        </div>
      </div>

      {/* Collapsible Gradient Color Picker Control */}
      <div className="bg-white rounded-3xl p-3.5 sm:p-4 border border-[#F3ECE8] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full border-2 border-white shadow-md flex items-center justify-center cursor-pointer"
              style={{ backgroundColor: selectedPaintColor }}
              onClick={() => setShowColorPicker(!showColorPicker)}
              title="Click to toggle gradient color picker"
            />
            <div>
              <p className="text-xs font-bold text-[#4A1525]">Selected Paint Color</p>
              <p className="text-[11px] text-[#7A6E73] font-mono">{selectedPaintColor.toUpperCase()}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#FFF5F7] text-[#781D42] border border-[#FCE8ED] hover:bg-[#FCE8ED] transition-colors min-h-[40px]"
          >
            <Palette className="w-3.5 h-3.5" />
            <span>{showColorPicker ? 'Hide Picker' : 'Change Shade'}</span>
            {showColorPicker ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Expandable 2D Gradient Box */}
        {showColorPicker && (
          <div className="pt-2 border-t border-[#F3ECE8] animate-fade-in">
            <GradientColorPicker
              color={selectedPaintColor}
              onChange={(hex) => setSelectedPaintColor(hex)}
            />
          </div>
        )}
      </div>

      {/* Main Interactive Drag-Paint Calendar Grid */}
      <CalendarGrid
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        logs={logsState}
        estimate={estimate}
        selectedDateKey={selectedDateKey}
        onSelectDate={handleSelectDate}
        selectedPaintColor={selectedPaintColor}
        onBatchPaint={handleBatchPaint}
        onUndoPaint={handleUndoPaint}
        canUndo={canUndo}
        onClearMonth={handleClearMonth}
      />

      {/* Daily Log Drawer (Bottom Sheet on Mobile, Right Panel on Desktop) */}
      {selectedDateKey && (
        <DailyLogDrawer
          dateKey={selectedDateKey}
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          existingLog={activeLog}
          onSave={handleSaveDailyLog}
          onDelete={handleDeleteDailyLog}
          currentColor={selectedPaintColor}
        />
      )}
    </div>
  );
};
