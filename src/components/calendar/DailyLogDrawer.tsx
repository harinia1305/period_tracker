import React, { useState } from 'react';
import { DailyLog, FlowStatus } from '../../models/types';
import { formatFriendlyDate } from '../../utils/dateUtils';
import {
  X,
  Trash2,
  Save,
  Smile,
  Meh,
  Frown,
  Moon,
  Flame,
  Activity,
  Heart,
  Droplets,
  ShieldCheck,
} from 'lucide-react';

interface DailyLogDrawerProps {
  dateKey: string;
  isOpen: boolean;
  onClose: () => void;
  existingLog: DailyLog | null;
  onSave: (data: Partial<DailyLog> & { date: string; flowStatus: FlowStatus }) => void;
  onDelete: (dateKey: string) => void;
  currentColor: string;
}

export const DailyLogDrawer: React.FC<DailyLogDrawerProps> = ({
  dateKey,
  isOpen,
  onClose,
  existingLog,
  onSave,
  onDelete,
  currentColor,
}) => {
  const [flowStatus, setFlowStatus] = useState<FlowStatus>('period');
  const [colorHex, setColorHex] = useState<string>(currentColor);
  const [cramps, setCramps] = useState<number>(0);
  const [backPain, setBackPain] = useState<number>(0);
  const [headache, setHeadache] = useState<number>(0);
  const [bloating, setBloating] = useState<number>(0);
  const [nausea, setNausea] = useState<number>(0);
  const [fatigue, setFatigue] = useState<number>(0);
  const [mood, setMood] = useState<number>(3);
  const [cravings, setCravings] = useState<number>(0);
  const [sleepQuality, setSleepQuality] = useState<number>(3);
  const [selfCareActions, setSelfCareActions] = useState<string[]>([]);
  const [notes, setNotes] = useState<string>('');

  const [prevSyncKey, setPrevSyncKey] = useState<string>('');
  const currentSyncKey = `${dateKey}_${existingLog?.id || 'new'}_${currentColor}`;
  if (prevSyncKey !== currentSyncKey) {
    setPrevSyncKey(currentSyncKey);
    if (existingLog) {
      setFlowStatus(existingLog.flowStatus);
      setColorHex(existingLog.colorHex || currentColor);
      setCramps(existingLog.cramps ?? 0);
      setBackPain(existingLog.backPain ?? 0);
      setHeadache(existingLog.headache ?? 0);
      setBloating(existingLog.bloating ?? 0);
      setNausea(existingLog.nausea ?? 0);
      setFatigue(existingLog.fatigue ?? 0);
      setMood(existingLog.mood ?? 3);
      setCravings(existingLog.cravings ?? 0);
      setSleepQuality(existingLog.sleepQuality ?? 3);
      setSelfCareActions(existingLog.selfCareActions || []);
      setNotes(existingLog.notes || '');
    } else {
      setFlowStatus('period');
      setColorHex(currentColor);
      setCramps(0);
      setBackPain(0);
      setHeadache(0);
      setBloating(0);
      setNausea(0);
      setFatigue(0);
      setMood(3);
      setCravings(0);
      setSleepQuality(3);
      setSelfCareActions([]);
      setNotes('');
    }
  }

  if (!isOpen) return null;

  const toggleSelfCare = (actionKey: string) => {
    setSelfCareActions(prev =>
      prev.includes(actionKey) ? prev.filter(k => k !== actionKey) : [...prev, actionKey]
    );
  };

  const handleSave = () => {
    onSave({
      date: dateKey,
      flowStatus,
      colorHex,
      cramps,
      backPain,
      headache,
      bloating,
      nausea,
      fatigue,
      mood,
      cravings,
      sleepQuality,
      selfCareActions,
      notes,
    });
    onClose();
  };

  const handleDelete = () => {
    onDelete(dateKey);
    onClose();
  };

  const selfCareOptions = [
    { key: 'heat_bag', label: 'Warm Heat Bag / Patch', icon: Flame },
    { key: 'rest', label: 'Rest & Deep Sleep', icon: Moon },
    { key: 'hydration', label: 'Electrolyte & Water', icon: Droplets },
    { key: 'gentle_walk', label: 'Gentle Walk / Stretch', icon: Activity },
    { key: 'medication', label: 'Medication Taken (Logged)', icon: Heart },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end">
      {/* Drawer content: bottom sheet on mobile, right panel on desktop */}
      <div
        className="w-full sm:max-w-md h-[92vh] sm:h-full mt-auto sm:mt-0 bg-white rounded-t-3xl sm:rounded-none sm:rounded-l-3xl shadow-2xl flex flex-col overflow-hidden animate-slide-up sm:animate-slide-left"
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#F3ECE8] flex items-center justify-between bg-[#FAF7F5]">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-[#8E7E84]">Daily Log</span>
            <h3 id="drawer-title" className="text-lg font-bold text-[#4A1525]">
              {formatFriendlyDate(dateKey)}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white border border-[#E5DAD4] flex items-center justify-center text-[#7A6E73] hover:text-[#4A1525] transition-colors"
            aria-label="Close daily log drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
          {/* Flow Status Radio Group */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#4A1525] uppercase tracking-wide">
              Flow Status
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: 'period', label: 'Period Flow' },
                { key: 'spotting', label: 'Spotting' },
                { key: 'no_period', label: 'No Period' },
                { key: 'missed_or_late', label: 'Late / Missed' },
                { key: 'unknown', label: 'Prefer not to say' },
              ].map(opt => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setFlowStatus(opt.key as FlowStatus)}
                  className={`p-2.5 rounded-xl text-xs font-semibold border text-center transition-all min-h-[44px] ${
                    flowStatus === opt.key
                      ? 'bg-[#781D42] text-white border-[#781D42] shadow-xs'
                      : 'bg-[#FAF7F5] text-[#2D2327] border-[#F3ECE8] hover:border-[#DE738A]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cramps Slider (0-10) */}
          <div className="space-y-2 bg-[#FAF7F5] p-3.5 rounded-2xl border border-[#F3ECE8]">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-[#4A1525]">Cramp Intensity</label>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#FFF5F7] text-[#781D42] border border-[#FCE8ED]">
                {cramps} / 10 {cramps === 0 ? '(None)' : cramps <= 3 ? '(Mild)' : cramps <= 7 ? '(Moderate)' : '(Severe)'}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              value={cramps}
              onChange={(e) => setCramps(Number(e.target.value))}
              className="w-full accent-[#781D42] cursor-pointer h-2 bg-[#E5DAD4] rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-[#8E7E84]">
              <span>0 (None)</span>
              <span>5 (Moderate)</span>
              <span>10 (Very High)</span>
            </div>
          </div>

          {/* Quick Symptoms (Headache, Bloating, Fatigue, Mood) */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-[#4A1525] uppercase tracking-wide">
              Symptoms & Mood
            </label>

            <div className="grid grid-cols-2 gap-3">
              {/* Back Pain */}
              <div className="p-3 bg-[#FAF7F5] rounded-xl border border-[#F3ECE8]">
                <label className="text-xs font-medium text-[#7A6E73] block mb-1.5">Lower Back Pain</label>
                <div className="flex gap-1">
                  {['None', 'Mild', 'Strong'].map((label, idx) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setBackPain(idx)}
                      className={`flex-1 py-1 rounded-lg text-xs font-medium border ${
                        backPain === idx
                          ? 'bg-[#781D42] text-white border-[#781D42]'
                          : 'bg-white text-[#7A6E73] border-[#E5DAD4]'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bloating */}
              <div className="p-3 bg-[#FAF7F5] rounded-xl border border-[#F3ECE8]">
                <label className="text-xs font-medium text-[#7A6E73] block mb-1.5">Bloating</label>
                <div className="flex gap-1">
                  {['None', 'Mild', 'High'].map((label, idx) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setBloating(idx)}
                      className={`flex-1 py-1 rounded-lg text-xs font-medium border ${
                        bloating === idx
                          ? 'bg-[#781D42] text-white border-[#781D42]'
                          : 'bg-white text-[#7A6E73] border-[#E5DAD4]'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fatigue */}
              <div className="p-3 bg-[#FAF7F5] rounded-xl border border-[#F3ECE8]">
                <label className="text-xs font-medium text-[#7A6E73] block mb-1.5">Fatigue Level</label>
                <div className="flex gap-1">
                  {['None', 'Mild', 'High'].map((label, idx) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setFatigue(idx)}
                      className={`flex-1 py-1 rounded-lg text-xs font-medium border ${
                        fatigue === idx
                          ? 'bg-[#781D42] text-white border-[#781D42]'
                          : 'bg-white text-[#7A6E73] border-[#E5DAD4]'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Headache */}
              <div className="p-3 bg-[#FAF7F5] rounded-xl border border-[#F3ECE8]">
                <label className="text-xs font-medium text-[#7A6E73] block mb-1.5">Headache</label>
                <div className="flex gap-1">
                  {['None', 'Mild', 'High'].map((label, idx) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setHeadache(idx)}
                      className={`flex-1 py-1 rounded-lg text-xs font-medium border ${
                        headache === idx
                          ? 'bg-[#781D42] text-white border-[#781D42]'
                          : 'bg-white text-[#7A6E73] border-[#E5DAD4]'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Mood 1 to 5 */}
            <div className="p-3 bg-[#FAF7F5] rounded-xl border border-[#F3ECE8] space-y-1.5">
              <div className="flex justify-between text-xs font-medium text-[#7A6E73]">
                <span>Overall Mood</span>
                <span>{mood === 1 ? 'Sensitive/Low' : mood === 2 ? 'Tender' : mood === 3 ? 'Balanced' : mood === 4 ? 'Good' : 'Radiant'}</span>
              </div>
              <div className="flex justify-between gap-2">
                {[
                  { val: 1, icon: Frown },
                  { val: 2, icon: Meh },
                  { val: 3, icon: Meh },
                  { val: 4, icon: Smile },
                  { val: 5, icon: Smile },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setMood(item.val)}
                    className={`flex-1 py-2 rounded-xl flex items-center justify-center border transition-all ${
                      mood === item.val
                        ? 'bg-[#781D42] text-white border-[#781D42] shadow-xs'
                        : 'bg-white text-[#7A6E73] border-[#E5DAD4]'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Self-Care Actions */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#4A1525] uppercase tracking-wide">
              Self-Care Comfort Actions
            </label>
            <div className="space-y-1.5">
              {selfCareOptions.map(opt => {
                const isChecked = selfCareActions.includes(opt.key);
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => toggleSelfCare(opt.key)}
                    className={`flex items-center gap-2.5 w-full p-2.5 rounded-xl text-left border transition-all text-xs min-h-[44px] ${
                      isChecked
                        ? 'bg-[#FFF5F7] border-[#781D42] text-[#781D42] font-semibold'
                        : 'bg-[#FAF7F5] border-[#F3ECE8] text-[#7A6E73] hover:border-[#DE738A]'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0 text-[#781D42]" />
                    <span className="flex-1">{opt.label}</span>
                    <div
                      className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                        isChecked ? 'bg-[#781D42] border-[#781D42] text-white' : 'border-[#CBBFB9] bg-white'
                      }`}
                    >
                      {isChecked && '✓'}
                    </div>
                  </button>
                );
              })}
            </div>
            {selfCareActions.includes('medication') && (
              <p className="text-[11px] text-[#8A5A44] italic p-2 bg-[#FFF9F6] rounded-lg border border-[#F5E2DA]">
                * Note: Record-keeping only. Period Love does not recommend dosages or medical prescriptions.
              </p>
            )}
          </div>

          {/* Private Notes */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <label className="font-bold text-[#4A1525] uppercase tracking-wide">
                Private Journal Note
              </label>
              <span className="text-[#8E7E84] text-[11px]">{notes.length}/1000</span>
            </div>
            <textarea
              rows={3}
              value={notes}
              maxLength={1000}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How are you feeling today? (Saved privately on your device)"
              className="w-full p-3 rounded-2xl bg-[#FAF7F5] border border-[#E5DAD4] text-xs text-[#2D2327] placeholder:text-[#A18A92] focus:outline-none focus:ring-1 focus:ring-[#781D42]"
            />
          </div>

          {/* Privacy & Safety Disclaimer */}
          <div className="flex items-start gap-2 p-3 bg-[#FAF7F5] rounded-xl text-[11px] text-[#7A6E73] border border-[#F3ECE8]">
            <ShieldCheck className="w-4 h-4 text-[#3F755E] shrink-0 mt-0.5" />
            <p>
              Your logs are stored locally in your browser. They are never shared with delivery
              partners or exposed to external trackers.
            </p>
          </div>
        </div>

        {/* Drawer Actions Footer */}
        <div className="p-4 border-t border-[#F3ECE8] bg-white flex items-center justify-between gap-3">
          {existingLog ? (
            <button
              type="button"
              onClick={handleDelete}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#C8374D] hover:bg-[#FFF2EE] transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#7A6E73] hover:bg-[#FAF7F5] transition-colors min-h-[44px]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#781D42] text-white hover:bg-[#4A1525] shadow-sm transition-all min-h-[44px]"
            >
              <Save className="w-4 h-4" />
              <span>Save Entry</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
