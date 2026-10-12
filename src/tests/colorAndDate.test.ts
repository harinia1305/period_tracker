import { describe, it, expect } from 'vitest';
import { hsvToRgb, rgbToHex, hexToRgb, rgbToHsv, getContrastTextColor } from '../utils/colorUtils';
import { formatDateKey, parseDateKey, daysDifference, addDays, getCalendarMatrix } from '../utils/dateUtils';

describe('colorUtils', () => {
  it('converts pure red HSV to RGB and Hex', () => {
    const rgb = hsvToRgb(0, 100, 100);
    expect(rgb).toEqual({ r: 255, g: 0, b: 0 });
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    expect(hex).toBe('#FF0000');
  });

  it('converts hex to rgb correctly', () => {
    const rgb = hexToRgb('#781D42');
    expect(rgb).toEqual({ r: 120, g: 29, b: 66 });
  });

  it('converts rgb to hsv and back roundtrip', () => {
    const hsv = rgbToHsv(120, 29, 66);
    expect(hsv.h).toBeGreaterThan(330);
    const rgbBack = hsvToRgb(hsv.h, hsv.s, hsv.v);
    expect(Math.abs(rgbBack.r - 120)).toBeLessThanOrEqual(2);
    expect(Math.abs(rgbBack.g - 29)).toBeLessThanOrEqual(2);
    expect(Math.abs(rgbBack.b - 66)).toBeLessThanOrEqual(2);
  });

  it('computes contrast text color for dark and light backgrounds', () => {
    // Dark berry background should yield white text
    expect(getContrastTextColor('#4A1525')).toBe('#FFFFFF');
    // Light pastel rose background should yield dark text
    expect(getContrastTextColor('#FCE8ED')).toBe('#2D0B16');
  });
});

describe('dateUtils', () => {
  it('formats and parses date keys consistently', () => {
    const d = new Date(2026, 8, 20); // 2026-09-20
    const key = formatDateKey(d);
    expect(key).toBe('2026-09-20');
    const parsed = parseDateKey(key);
    expect(parsed.getFullYear()).toBe(2026);
    expect(parsed.getMonth()).toBe(8);
    expect(parsed.getDate()).toBe(20);
  });

  it('calculates days difference correctly', () => {
    expect(daysDifference('2026-09-01', '2026-09-29')).toBe(28);
    expect(addDays('2026-09-01', 28)).toBe('2026-09-29');
  });

  it('generates 42-cell matrix for calendar month', () => {
    const matrix = getCalendarMatrix(2026, 8); // September 2026
    expect(matrix.length).toBe(6); // 6 rows
    expect(matrix[0].length).toBe(7); // 7 columns
    const totalCells = matrix.flat().length;
    expect(totalCells).toBe(42);
  });
});
