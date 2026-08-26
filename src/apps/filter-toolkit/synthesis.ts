import { Arm, ArmPosition, FilterParams, TuneMode } from './types';
import { TP, Z0 } from './dsp';

function bwG(n: number): number[] {
  return Array.from({ length: n }, (_, k) => 2 * Math.sin(((2 * (k + 1) - 1) * Math.PI) / (2 * n)));
}

function armPositions(order: number, topo: 'pi' | 't'): ArmPosition[] {
  return Array.from({ length: order }, (_, k) => {
    const even = k % 2 === 1;
    if (topo === 'pi') return even ? 'series' : 'shunt';
    return even ? 'shunt' : 'series';
  });
}

export function buildFilter({ kind, order, topo, fc, bwFrac }: FilterParams): Arm[] {
  const g = bwG(order);
  const positions = armPositions(order, topo);
  const w0 = TP * fc;
  const d = bwFrac;

  let lCount = 0;
  let cCount = 0;
  const nextLabel = (type: 'L' | 'C') => (type === 'L' ? `L${++lCount}` : `C${++cCount}`);

  return positions.map((position, i) => {
    const gk = g[i];

    if (kind === 'lowpass') {
      if (position === 'series') {
        return arm1(position, 'L', (gk * Z0) / w0, nextLabel);
      }
      return arm1(position, 'C', gk / (w0 * Z0), nextLabel);
    }

    if (kind === 'highpass') {
      if (position === 'series') {
        return arm1(position, 'C', 1 / (w0 * Z0 * gk), nextLabel);
      }
      return arm1(position, 'L', Z0 / (w0 * gk), nextLabel);
    }

    if (kind === 'bandpass') {
      if (position === 'series') {
        const L = (Z0 * gk) / (d * w0);
        const C = d / (w0 * Z0 * gk);
        return arm2(position, 'series', L, C, nextLabel);
      }
      const C = gk / (d * w0 * Z0);
      const L = (d * Z0) / (w0 * gk);
      return arm2(position, 'parallel', L, C, nextLabel);
    }

    // bandstop
    if (position === 'series') {
      const L = (Z0 * d) / (w0 * gk);
      const C = gk / (d * w0 * Z0);
      return arm2(position, 'parallel', L, C, nextLabel);
    }
    const C = (d * gk) / (w0 * Z0);
    const L = Z0 / (d * w0 * gk);
    return arm2(position, 'series', L, C, nextLabel);
  });
}

function arm1(position: ArmPosition, type: 'L' | 'C', value: number, nextLabel: (t: 'L' | 'C') => string): Arm {
  return { position, subtopology: 'single', parts: [{ type, value }], labels: [nextLabel(type)] };
}

function arm2(
  position: ArmPosition,
  subtopology: 'series' | 'parallel',
  L: number,
  C: number,
  nextLabel: (t: 'L' | 'C') => string
): Arm {
  return {
    position,
    subtopology,
    parts: [
      { type: 'L', value: L },
      { type: 'C', value: C },
    ],
    labels: [nextLabel('L'), nextLabel('C')],
  };
}

export function applyTune(targetArms: Arm[], baseArms: Arm[], mode: TuneMode): Arm[] {
  if (mode === 'all') return targetArms.map((a) => ({ ...a, parts: a.parts.map((p) => ({ ...p })) }));
  return baseArms.map((baseArm, ai) => ({
    ...baseArm,
    parts: baseArm.parts.map((part, pi) =>
      part.type === mode ? { ...part, value: targetArms[ai].parts[pi].value } : { ...part }
    ),
  }));
}

export function armsChanged(a: Arm[], b: Arm[]): boolean[][] {
  return a.map((arm, ai) => arm.parts.map((p, pi) => Math.abs(p.value - b[ai].parts[pi].value) > b[ai].parts[pi].value * 0.001));
}
