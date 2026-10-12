/**
 * Color math and transformation utilities for 2D gradient picker
 */

export interface HSV {
  h: number; // 0 to 360
  s: number; // 0 to 100
  v: number; // 0 to 100
}

export interface RGB {
  r: number; // 0 to 255
  g: number; // 0 to 255
  b: number; // 0 to 255
}

export function hsvToRgb(h: number, s: number, v: number): RGB {
  h = ((h % 360) + 360) % 360;
  const sFrac = Math.max(0, Math.min(100, s)) / 100;
  const vFrac = Math.max(0, Math.min(100, v)) / 100;

  const c = vFrac * sFrac;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = vFrac - c;

  let rPrime = 0;
  let gPrime = 0;
  let bPrime = 0;

  if (h >= 0 && h < 60) {
    rPrime = c; gPrime = x; bPrime = 0;
  } else if (h >= 60 && h < 120) {
    rPrime = x; gPrime = c; bPrime = 0;
  } else if (h >= 120 && h < 180) {
    rPrime = 0; gPrime = c; bPrime = x;
  } else if (h >= 180 && h < 240) {
    rPrime = 0; gPrime = x; bPrime = c;
  } else if (h >= 240 && h < 300) {
    rPrime = x; gPrime = 0; bPrime = c;
  } else {
    rPrime = c; gPrime = 0; bPrime = x;
  }

  return {
    r: Math.round((rPrime + m) * 255),
    g: Math.round((gPrime + m) * 255),
    b: Math.round((bPrime + m) * 255),
  };
}

export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

export function hexToRgb(hex: string): RGB | null {
  const cleanHex = hex.replace('#', '').trim();
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16);
    const g = parseInt(cleanHex[1] + cleanHex[1], 16);
    const b = parseInt(cleanHex[2] + cleanHex[2], 16);
    return isNaN(r) || isNaN(g) || isNaN(b) ? null : { r, g, b };
  } else if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return isNaN(r) || isNaN(g) || isNaN(b) ? null : { r, g, b };
  }
  return null;
}

export function rgbToHsv(r: number, g: number, b: number): HSV {
  const rFrac = r / 255;
  const gFrac = g / 255;
  const bFrac = b / 255;

  const max = Math.max(rFrac, gFrac, bFrac);
  const min = Math.min(rFrac, gFrac, bFrac);
  const diff = max - min;

  let h = 0;
  if (diff === 0) {
    h = 0;
  } else if (max === rFrac) {
    h = ((60 * ((gFrac - bFrac) / diff)) + 360) % 360;
  } else if (max === gFrac) {
    h = ((60 * ((bFrac - rFrac) / diff)) + 120) % 360;
  } else {
    h = ((60 * ((rFrac - gFrac) / diff)) + 240) % 360;
  }

  const s = max === 0 ? 0 : (diff / max) * 100;
  const v = max * 100;

  return {
    h: Math.round(h),
    s: Math.round(s),
    v: Math.round(v),
  };
}

export function hexToHsv(hex: string, defaultHsv: HSV = { h: 345, s: 75, v: 50 }): HSV {
  const rgb = hexToRgb(hex);
  if (!rgb) return defaultHsv;
  return rgbToHsv(rgb.r, rgb.g, rgb.b);
}

/**
 * Returns whether dark or light text should be used over this background color
 */
export function getContrastTextColor(hex?: string): string {
  if (!hex) return '#2D2327';
  const rgb = hexToRgb(hex);
  if (!rgb) return '#2D2327';
  // Standard relative luminance formula
  const yiq = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  return yiq >= 135 ? '#2D0B16' : '#FFFFFF';
}

export interface PresetShade {
  label: string;
  hex: string;
  description: string;
}

export const SUGGESTED_SEMANTIC_SHADES: PresetShade[] = [
  { label: 'Light spotting shade', hex: '#E898A8', description: 'Gentle soft rose' },
  { label: 'Red flow shade', hex: '#C8374D', description: 'Vibrant ruby red' },
  { label: 'Dark flow shade', hex: '#781D42', description: 'Deep berry & plum' },
  { label: 'Brown shade', hex: '#7A4B3A', description: 'Warm earthen tone' },
  { label: 'Muted coral shade', hex: '#E27B66', description: 'Warm peach-coral' },
  { label: 'Custom shade', hex: '#9C3454', description: 'User-selected tone' },
];
