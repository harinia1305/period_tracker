import React, { useState, useRef, useCallback } from 'react';
import {
  hsvToRgb,
  rgbToHex,
  hexToHsv,
  getContrastTextColor,
  SUGGESTED_SEMANTIC_SHADES,
  HSV,
} from '../../utils/colorUtils';
import { Info, ChevronDown, ChevronUp, Palette, Check } from 'lucide-react';

interface GradientColorPickerProps {
  color: string; // Hex string e.g. '#C8374D'
  onChange: (hex: string) => void;
  recentColors?: string[];
}

export const GradientColorPicker: React.FC<GradientColorPickerProps> = ({
  color,
  onChange,
  recentColors = ['#C8374D', '#781D42', '#E898A8', '#7A4B3A', '#E27B66'],
}) => {
  const [hsv, setHsv] = useState<HSV>(() => hexToHsv(color));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeSemanticLabel, setActiveSemanticLabel] = useState<string>('Custom shade');

  const gradientBoxRef = useRef<HTMLDivElement>(null);
  const hueSliderRef = useRef<HTMLDivElement>(null);
  const isDraggingGradient = useRef(false);
  const isDraggingHue = useRef(false);

  // Adjust internal HSV if parent color prop changes externally
  const [prevColor, setPrevColor] = useState(color);
  if (prevColor !== color) {
    setPrevColor(color);
    setHsv(hexToHsv(color));
  }

  const updateColorFromHsv = useCallback((newHsv: HSV) => {
    setHsv(newHsv);
    const rgb = hsvToRgb(newHsv.h, newHsv.s, newHsv.v);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    onChange(hex);
  }, [onChange]);

  // 2D Gradient Box Pointer Tracking (Saturation & Brightness/Value)
  const handleGradientPointer = useCallback((clientX: number, clientY: number) => {
    if (!gradientBoxRef.current) return;
    const rect = gradientBoxRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, clientY - rect.top));

    const s = Math.round((x / rect.width) * 100);
    const v = Math.round((1 - (y / rect.height)) * 100);

    updateColorFromHsv({ ...hsv, s, v });
  }, [hsv, updateColorFromHsv]);

  const onGradientPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    isDraggingGradient.current = true;
    handleGradientPointer(e.clientX, e.clientY);
  };

  const onGradientPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingGradient.current) {
      e.preventDefault();
      handleGradientPointer(e.clientX, e.clientY);
    }
  };

  const onGradientPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingGradient.current) {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
      isDraggingGradient.current = false;
    }
  };

  // 1D Hue Slider Pointer Tracking
  const handleHuePointer = useCallback((clientX: number) => {
    if (!hueSliderRef.current) return;
    const rect = hueSliderRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const h = Math.round((x / rect.width) * 360) % 360;

    updateColorFromHsv({ ...hsv, h });
  }, [hsv, updateColorFromHsv]);

  const onHuePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    isDraggingHue.current = true;
    handleHuePointer(e.clientX);
  };

  const onHuePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingHue.current) {
      e.preventDefault();
      handleHuePointer(e.clientX);
    }
  };

  const onHuePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingHue.current) {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
      isDraggingHue.current = false;
    }
  };

  // Pure hue background for the gradient box
  const pureHueRgb = hsvToRgb(hsv.h, 100, 100);
  const pureHueHex = rgbToHex(pureHueRgb.r, pureHueRgb.g, pureHueRgb.b);
  const currentRgb = hsvToRgb(hsv.h, hsv.s, hsv.v);
  const currentHex = rgbToHex(currentRgb.r, currentRgb.g, currentRgb.b);
  const contrastText = getContrastTextColor(currentHex);

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-[#F3ECE8] space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-[#781D42]" />
          <h3 className="font-semibold text-base text-[#4A1525]">Custom Gradient Palette</h3>
        </div>
        <div
          className="w-8 h-8 rounded-full shadow-inner border-2 border-white flex items-center justify-center transition-transform hover:scale-105"
          style={{ backgroundColor: currentHex }}
          title={`Selected color: ${currentHex}`}
        >
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: contrastText }} />
        </div>
      </div>

      {/* 2D Saturation / Value Gradient Canvas Box */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-[#7A6E73] block">
          Drag in gradient box to choose saturation & depth:
        </label>
        <div
          ref={gradientBoxRef}
          onPointerDown={onGradientPointerDown}
          onPointerMove={onGradientPointerMove}
          onPointerUp={onGradientPointerUp}
          onPointerCancel={onGradientPointerUp}
          className="relative h-44 w-full rounded-xl cursor-crosshair overflow-hidden touch-none select-none shadow-inner border border-black/10"
          style={{
            backgroundColor: pureHueHex,
            backgroundImage:
              'linear-gradient(to right, #FFF 0%, transparent 100%), linear-gradient(to top, #000 0%, transparent 100%)',
          }}
          role="slider"
          aria-label="Saturation and Brightness Picker"
          aria-valuenow={hsv.v}
          tabIndex={0}
        >
          {/* Draggable Selector Thumb */}
          <div
            className="absolute w-6 h-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md pointer-events-none transition-transform"
            style={{
              left: `${hsv.s}%`,
              top: `${100 - hsv.v}%`,
              backgroundColor: currentHex,
            }}
          />
        </div>
      </div>

      {/* 1D Hue Slider Strip */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-[#7A6E73]">
          <span>Hue Spectrum</span>
          <span>{hsv.h}°</span>
        </div>
        <div
          ref={hueSliderRef}
          onPointerDown={onHuePointerDown}
          onPointerMove={onHuePointerMove}
          onPointerUp={onHuePointerUp}
          onPointerCancel={onHuePointerUp}
          className="relative h-8 w-full rounded-lg cursor-pointer touch-none select-none border border-black/10 shadow-inner"
          style={{
            background:
              'linear-gradient(to right, #FF0000 0%, #FFFF00 17%, #00FF00 33%, #00FFFF 50%, #0000FF 67%, #FF00FF 83%, #FF0000 100%)',
          }}
          role="slider"
          aria-label="Hue Slider"
          aria-valuenow={hsv.h}
          tabIndex={0}
        >
          <div
            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-9 bg-white rounded-md border border-black/20 shadow-md pointer-events-none"
            style={{ left: `${(hsv.h / 360) * 100}%` }}
          />
        </div>
      </div>

      {/* Suggested Semantic Shades (Non-diagnostic) */}
      <div className="space-y-2 pt-1">
        <label className="text-xs font-medium text-[#7A6E73] flex items-center justify-between">
          <span>Suggested Semantic Shades</span>
          <span className="text-[11px] text-[#A18A92]">(Empirical shade labels)</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {SUGGESTED_SEMANTIC_SHADES.map(preset => {
            const isSelected = preset.hex.toUpperCase() === currentHex.toUpperCase();
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  setActiveSemanticLabel(preset.label);
                  onChange(preset.hex);
                }}
                className={`flex items-center gap-2 p-2 rounded-xl text-left border transition-all min-h-[44px] ${
                  isSelected
                    ? 'border-[#781D42] bg-[#FFF5F7] ring-1 ring-[#781D42]'
                    : 'border-[#F3ECE8] hover:border-[#DE738A] bg-white'
                }`}
              >
                <div
                  className="w-5 h-5 rounded-full shrink-0 border border-black/10 flex items-center justify-center"
                  style={{ backgroundColor: preset.hex }}
                >
                  {isSelected && <Check className="w-3 h-3 text-white stroke-[3]" />}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#2D2327] truncate">{preset.label}</p>
                  <p className="text-[10px] text-[#7A6E73] truncate">{preset.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recently Used Swatches */}
      {recentColors && recentColors.length > 0 && (
        <div className="flex items-center gap-2 pt-1">
          <span className="text-xs text-[#7A6E73]">Recent:</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {recentColors.slice(0, 6).map((rc, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onChange(rc)}
                className="w-7 h-7 rounded-full border border-black/10 shadow-xs hover:scale-110 transition-transform"
                style={{ backgroundColor: rc }}
                title={`Recent shade: ${rc}`}
                aria-label={`Recent shade: ${rc}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Advanced Inputs Disclosure (Keyboard Fallbacks) */}
      <div className="pt-2 border-t border-[#F3ECE8]">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center justify-between w-full text-xs font-medium text-[#781D42] hover:text-[#4A1525] py-1"
        >
          <span>Advanced Color Values (Hex & HSL)</span>
          {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showAdvanced && (
          <div className="mt-3 p-3 bg-[#FAF7F5] rounded-xl space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-[#7A6E73] block mb-1">HEX Code</label>
                <input
                  type="text"
                  value={currentHex}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
                      onChange(val);
                    }
                  }}
                  className="w-full px-2.5 py-1.5 bg-white border border-[#E5DAD4] rounded-lg text-xs font-mono uppercase focus:outline-none focus:ring-1 focus:ring-[#781D42]"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-[#7A6E73] block mb-1">Semantic Tag</label>
                <input
                  type="text"
                  value={activeSemanticLabel}
                  onChange={(e) => setActiveSemanticLabel(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-[#E5DAD4] rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#781D42]"
                  placeholder="e.g. My calm shade"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] text-[#7A6E73] block">Hue (0-360)</label>
                <input
                  type="number"
                  min="0"
                  max="360"
                  value={hsv.h}
                  onChange={(e) => updateColorFromHsv({ ...hsv, h: Number(e.target.value) || 0 })}
                  className="w-full px-2 py-1 bg-white border border-[#E5DAD4] rounded-md text-xs text-center"
                />
              </div>
              <div>
                <label className="text-[10px] text-[#7A6E73] block">Sat (0-100%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={hsv.s}
                  onChange={(e) => updateColorFromHsv({ ...hsv, s: Number(e.target.value) || 0 })}
                  className="w-full px-2 py-1 bg-white border border-[#E5DAD4] rounded-md text-xs text-center"
                />
              </div>
              <div>
                <label className="text-[10px] text-[#7A6E73] block">Val (0-100%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={hsv.v}
                  onChange={(e) => updateColorFromHsv({ ...hsv, v: Number(e.target.value) || 0 })}
                  className="w-full px-2 py-1 bg-white border border-[#E5DAD4] rounded-md text-xs text-center"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Safety Notice regarding Color */}
      <div className="flex items-start gap-2 p-2.5 bg-[#FFF9F6] border border-[#F5E2DA] rounded-xl text-[11px] text-[#8A5A44]">
        <Info className="w-4 h-4 shrink-0 text-[#E27B66] mt-0.5" />
        <p>
          <strong>Wellness Notice:</strong> Menstrual flow color naturally shifts through your cycle.
          Color tracking is for personal logging only and cannot diagnose health conditions.
        </p>
      </div>
    </div>
  );
};
