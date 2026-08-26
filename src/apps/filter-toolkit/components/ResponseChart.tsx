import React, { useMemo, useState } from 'react';

export interface GhostCurve {
  label: string;
  color: string;
  resp: number[];
}

interface Props {
  freqs: number[];
  activeResp: number[];
  ghosts: GhostCurve[];
  targetFc: number;
  fMin: number;
  fMax: number;
}

const W = 860;
const H = 248;
const PAD_L = 44;
const PAD_R = 10;
const PAD_T = 10;
const PAD_B = 24;
const Y_MAX = 5;
const Y_MIN = -68;

function niceXTicks(fMin: number, fMax: number): number[] {
  const ticks: number[] = [];
  const startDecade = Math.floor(Math.log10(fMin));
  const endDecade = Math.ceil(Math.log10(fMax));
  for (let d = startDecade; d <= endDecade; d++) {
    for (const m of [1, 2, 5]) {
      const v = m * Math.pow(10, d);
      if (v >= fMin && v <= fMax) ticks.push(v);
    }
  }
  return ticks;
}

export default function ResponseChart({ freqs, activeResp, ghosts, targetFc, fMin, fMax }: Props) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const plotW = W - PAD_L - PAD_R;
  const plotH = H - PAD_T - PAD_B;
  const logMin = Math.log10(fMin);
  const logMax = Math.log10(fMax);

  const xOf = (f: number) => PAD_L + ((Math.log10(f) - logMin) / (logMax - logMin)) * plotW;
  const yOf = (db: number) => PAD_T + ((Y_MAX - db) / (Y_MAX - Y_MIN)) * plotH;

  const pathFor = (resp: number[]) =>
    freqs.map((f, i) => `${i === 0 ? 'M' : 'L'}${xOf(f).toFixed(1)},${yOf(Math.max(Y_MIN, resp[i])).toFixed(1)}`).join(' ');

  const activePath = pathFor(activeResp);
  const xTicks = useMemo(() => niceXTicks(fMin, fMax), [fMin, fMax]);

  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    let best = 0;
    let bestD = Infinity;
    freqs.forEach((f, i) => {
      const d = Math.abs(xOf(f) - px);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    });
    setHoverIdx(best);
  };

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      style={{ display: 'block', cursor: 'crosshair' }}
      onMouseMove={onMove}
      onMouseLeave={() => setHoverIdx(null)}
    >
      {[0, -10, -20, -30, -40, -50, -60].map((db) => (
        <line key={db} x1={PAD_L} x2={W - PAD_R} y1={yOf(db)} y2={yOf(db)} stroke="rgba(128,128,128,0.1)" strokeWidth={1} />
      ))}
      {[0, -10, -20, -30, -40, -50, -60].map((db) => (
        <text key={db} x={PAD_L - 6} y={yOf(db) + 3} textAnchor="end" fontSize={10} fontFamily="monospace" fill="#888">
          {db} dB
        </text>
      ))}
      {xTicks.map((f) => (
        <line key={f} x1={xOf(f)} x2={xOf(f)} y1={PAD_T} y2={H - PAD_B} stroke="rgba(128,128,128,0.08)" strokeWidth={1} />
      ))}
      {xTicks
        .filter((f) => [1, 2, 5].includes(f / Math.pow(10, Math.floor(Math.log10(f)))))
        .map((f) => (
          <text key={f} x={xOf(f)} y={H - PAD_B + 12} textAnchor="middle" fontSize={9} fontFamily="monospace" fill="#888">
            {f >= 1e6 ? `${(f / 1e6).toFixed(f % 1e6 === 0 && f >= 1e7 ? 0 : 1)}M` : `${(f / 1e3).toFixed(0)}k`}
          </text>
        ))}

      {ghosts.map((g) => (
        <path key={g.label} d={pathFor(g.resp)} fill="none" stroke={g.color + '66'} strokeWidth={1.5} />
      ))}

      <line x1={PAD_L} x2={W - PAD_R} y1={yOf(-3.01)} y2={yOf(-3.01)} stroke="#E24B4A88" strokeWidth={1} strokeDasharray="5,3" />
      {targetFc >= fMin && targetFc <= fMax && (
        <line x1={xOf(targetFc)} x2={xOf(targetFc)} y1={yOf(Y_MIN)} y2={yOf(3)} stroke="#1D9E7566" strokeWidth={1} strokeDasharray="6,4" />
      )}

      <path d={activePath} fill="none" stroke="#1D9E75" strokeWidth={2.5} />

      {hoverIdx !== null && (
        <g>
          <line x1={xOf(freqs[hoverIdx])} x2={xOf(freqs[hoverIdx])} y1={PAD_T} y2={H - PAD_B} stroke="#888" strokeWidth={1} strokeDasharray="2,2" />
          <text x={xOf(freqs[hoverIdx]) + 4} y={PAD_T + 10} fontSize={10} fontFamily="monospace" fill="#1a1a18">
            {(freqs[hoverIdx] / 1e6).toFixed(1)} MHz · {Math.max(Y_MIN, activeResp[hoverIdx]).toFixed(1)} dB
          </text>
        </g>
      )}
    </svg>
  );
}
