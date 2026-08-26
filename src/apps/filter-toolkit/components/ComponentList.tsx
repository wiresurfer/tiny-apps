import React from 'react';
import { Arm } from '../types';
import { fmt, parseToBase } from '../format';

interface Row {
  armIdx: number;
  partIdx: number;
  type: 'L' | 'C';
  value: number;
  label: string;
  changed: boolean;
}

interface Props {
  arms: Arm[];
  baseArms: Arm[];
  onChange: (armIdx: number, partIdx: number, value: number) => void;
}

export default function ComponentList({ arms, baseArms, onChange }: Props) {
  const rows: Row[] = [];
  arms.forEach((arm, ai) => {
    arm.parts.forEach((part, pi) => {
      const baseVal = baseArms[ai]?.parts[pi]?.value ?? part.value;
      rows.push({
        armIdx: ai,
        partIdx: pi,
        type: part.type,
        value: part.value,
        label: arm.labels[pi],
        changed: Math.abs(part.value - baseVal) > baseVal * 0.001,
      });
    });
  });

  const step = (ai: number, pi: number, dir: 1 | -1) => {
    const part = arms[ai].parts[pi];
    const delta = part.type === 'C' ? 0.1e-12 : 0.5e-9;
    onChange(ai, pi, Math.max(0.01e-12, part.value + dir * delta));
  };

  return (
    <div>
      {rows.map((r) => {
        const { val, unit } = fmt(r.value, r.type);
        return (
          <div key={`${r.armIdx}-${r.partIdx}`} className={`ft-cr${r.changed ? ' ft-ch' : ''}`}>
            <span className={`ft-bd ft-bd${r.type}`}>{r.type}</span>
            <span className="ft-cn">{r.label}</span>
            <input
              className="ft-vi"
              type="number"
              step="0.01"
              value={val}
              onChange={(e) => {
                const v = parseFloat(e.target.value) || 0;
                onChange(r.armIdx, r.partIdx, parseToBase(v, r.type));
              }}
            />
            <span className="ft-ul">{unit}</span>
            <div className="ft-aw">
              <button className="ft-ab" onClick={() => step(r.armIdx, r.partIdx, 1)}>
                ▲
              </button>
              <button className="ft-ab" onClick={() => step(r.armIdx, r.partIdx, -1)}>
                ▼
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
