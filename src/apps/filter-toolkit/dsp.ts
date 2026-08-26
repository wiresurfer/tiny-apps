import { Arm } from './types';

export const Z0 = 50;
export const TP = 2 * Math.PI;

type Cx = [number, number];

export const cx = {
  n: (r: number, i = 0): Cx => [r, i],
  add: ([ar, ai]: Cx, [br, bi]: Cx): Cx => [ar + br, ai + bi],
  mul: ([ar, ai]: Cx, [br, bi]: Cx): Cx => [ar * br - ai * bi, ar * bi + ai * br],
  div: ([ar, ai]: Cx, [br, bi]: Cx): Cx => {
    const d = br * br + bi * bi;
    return [(ar * br + ai * bi) / d, (ai * br - ar * bi) / d];
  },
  abs: ([r, i]: Cx) => Math.sqrt(r * r + i * i),
};

type ABCD = [Cx, Cx, Cx, Cx];

function mm(A: ABCD, B: ABCD): ABCD {
  return [
    cx.add(cx.mul(A[0], B[0]), cx.mul(A[1], B[2])),
    cx.add(cx.mul(A[0], B[1]), cx.mul(A[1], B[3])),
    cx.add(cx.mul(A[2], B[0]), cx.mul(A[3], B[2])),
    cx.add(cx.mul(A[2], B[1]), cx.mul(A[3], B[3])),
  ];
}

function seriesZ(arm: Arm, w: number): Cx {
  const { subtopology, parts } = arm;
  if (subtopology === 'single') {
    const p = parts[0];
    return p.type === 'L' ? cx.n(0, w * p.value) : cx.div(cx.n(1), cx.n(0, w * p.value));
  }
  const L = parts.find((p) => p.type === 'L')!.value;
  const C = parts.find((p) => p.type === 'C')!.value;
  if (subtopology === 'series') return cx.n(0, w * L - 1 / (w * C));
  const yParallel = cx.n(0, w * C - 1 / (w * L));
  return cx.div(cx.n(1), yParallel);
}

function shuntY(arm: Arm, w: number): Cx {
  const { subtopology, parts } = arm;
  if (subtopology === 'single') {
    const p = parts[0];
    return p.type === 'C' ? cx.n(0, w * p.value) : cx.div(cx.n(1), cx.n(0, w * p.value));
  }
  const L = parts.find((p) => p.type === 'L')!.value;
  const C = parts.find((p) => p.type === 'C')!.value;
  if (subtopology === 'parallel') return cx.n(0, w * C - 1 / (w * L));
  const zSeries = cx.n(0, w * L - 1 / (w * C));
  return cx.div(cx.n(1), zSeries);
}

function armABCD(arm: Arm, w: number): ABCD {
  if (arm.position === 'series') {
    return [cx.n(1), seriesZ(arm, w), cx.n(0), cx.n(1)];
  }
  return [cx.n(1), cx.n(0), shuntY(arm, w), cx.n(1)];
}

export function s21(f: number, arms: Arm[]): number {
  const w = TP * f;
  let M: ABCD = [cx.n(1), cx.n(0), cx.n(0), cx.n(1)];
  for (const arm of arms) M = mm(M, armABCD(arm, w));
  const z = cx.n(Z0);
  const den = cx.add(cx.add(M[0], cx.div(M[1], z)), cx.add(cx.mul(M[2], z), M[3]));
  const db = 20 * Math.log10(cx.abs(cx.div(cx.n(2), den)));
  // an ideal (lossless) bandstop notch center hits an exact 0/0 in the ABCD algebra
  return Number.isFinite(db) ? db : -300;
}

function interp(freqs: number[], resp: number[], i: number, lvl: number): number {
  const t = (lvl - resp[i - 1]) / (resp[i] - resp[i - 1]);
  return freqs[i - 1] + (freqs[i] - freqs[i - 1]) * t;
}

export function findFallingX(resp: number[], freqs: number[], lvl: number, fromIdx = 1): { freq: number; idx: number } | null {
  for (let i = fromIdx; i < resp.length; i++) {
    if (resp[i - 1] >= lvl && resp[i] < lvl) return { freq: interp(freqs, resp, i, lvl), idx: i };
  }
  return null;
}

export function findRisingX(resp: number[], freqs: number[], lvl: number, fromIdx = 1): { freq: number; idx: number } | null {
  for (let i = fromIdx; i < resp.length; i++) {
    if (resp[i - 1] < lvl && resp[i] >= lvl) return { freq: interp(freqs, resp, i, lvl), idx: i };
  }
  return null;
}

export function makeFreqGrid(f0: number, f1: number, n = 260): number[] {
  return Array.from({ length: n }, (_, i) => f0 * Math.pow(f1 / f0, i / (n - 1)));
}
