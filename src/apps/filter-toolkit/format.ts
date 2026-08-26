import { PartType } from './types';

const E12 = [1.0, 1.2, 1.5, 1.8, 2.2, 2.7, 3.3, 3.9, 4.7, 5.6, 6.8, 8.2];

export function nearE12(v: number): number {
  const exp = Math.floor(Math.log10(v));
  const m = v / Math.pow(10, exp);
  let best = E12[0];
  let be = Infinity;
  for (const e of E12) {
    const err = Math.abs(e - m);
    if (err < be) {
      be = err;
      best = e;
    }
  }
  return +(best * Math.pow(10, exp)).toPrecision(3);
}

export function fmt(v: number, t: PartType): { val: string; unit: string } {
  if (t === 'C') return { val: (v * 1e12).toFixed(2), unit: 'pF' };
  return { val: (v * 1e9).toFixed(2), unit: 'nH' };
}

export function parseToBase(v: number, t: PartType): number {
  return t === 'C' ? v * 1e-12 : v * 1e-9;
}

export function fmtFreq(hz: number): string {
  return `${(hz / 1e6).toFixed(1)} MHz`;
}
