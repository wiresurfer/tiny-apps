import React, { useMemo } from 'react';
import { Arm } from '../types';
import { fmt } from '../format';

interface Props {
  arms: Arm[];
  baseArms: Arm[];
}

const W = 860;
const H = 128;
const TY = 66;
const PW = 22;
const PH = 12;
const PG = 28;

function pad(x: number, y: number, changed: boolean) {
  const fill = changed ? '#EF9F27' : '#BA7517';
  const stroke = changed ? `stroke="#EF9F27" stroke-width="1.5"` : `stroke="#854F0B" stroke-width="0.5"`;
  return `<rect x="${x - PW / 2}" y="${y - PH / 2}" width="${PW}" height="${PH}" rx="2" fill="${fill}" ${stroke}/>`;
}

function via(x: number, y: number) {
  return `
    <circle cx="${x}" cy="${y}" r="5.5" fill="#3a3a3a" stroke="#999" stroke-width="1.5"/>
    <line x1="${x - 3.5}" y1="${y - 4}" x2="${x + 3.5}" y2="${y + 4}" stroke="#bbb" stroke-width="1"/>
    <line x1="${x + 3.5}" y1="${y - 4}" x2="${x - 3.5}" y2="${y + 4}" stroke="#bbb" stroke-width="1"/>
    <text x="${x}" y="${y + 17}" text-anchor="middle" font-size="8" fill="#888">GND</text>
  `;
}

function label(x: number, y: number, name: string, val: string, unit: string) {
  return `
    <text x="${x}" y="${y}" text-anchor="middle" font-size="10.5" fill="#444" font-weight="500">${name}</text>
    <text x="${x}" y="${y + 11}" text-anchor="middle" font-size="9" fill="#666" font-family="monospace">${val}${unit}</text>
  `;
}

function seriesBody(x0: number, x1: number, dashed = true) {
  return `<rect x="${x0}" y="${TY - 9}" width="${x1 - x0}" height="18" rx="3" fill="rgba(250,238,218,0.5)" stroke="#EF9F27" stroke-width="1" ${
    dashed ? 'stroke-dasharray="5,2"' : ''
  }/>`;
}

function renderArm(arm: Arm, baseArm: Arm, x: number, pIdxStart: number): { svg: string; pUsed: number } {
  let pads = '';
  let bodies = '';
  let stubs = '';
  let vias = '';
  let lbls = '';
  let pnums = '';
  let pIdx = pIdxStart;

  const changedOf = (pi: number) => Math.abs(arm.parts[pi].value - baseArm.parts[pi].value) > baseArm.parts[pi].value * 0.001;

  if (arm.subtopology === 'single') {
    const part = arm.parts[0];
    const { val, unit } = fmt(part.value, part.type);
    const changed = changedOf(0);
    if (arm.position === 'shunt') {
      pads += pad(x, TY, changed);
      stubs += `<line x1="${x}" y1="${TY + PH / 2}" x2="${x}" y2="${TY + 20}" stroke="#777" stroke-width="1.5"/>`;
      pads += pad(x, TY + 26, changed);
      vias += via(x, TY + 41);
      lbls += label(x, TY - 24, arm.labels[0], val, unit);
      pnums += `<text x="${x + 12}" y="${TY + 3}" font-size="8" fill="#1D9E75" font-weight="600">P${pIdx}</text>`;
      pnums += `<text x="${x + 12}" y="${TY + 29}" font-size="8" fill="#1D9E75" font-weight="600">P${pIdx + 1}</text>`;
      pIdx += 2;
    } else {
      pads += pad(x - PG, TY, changed);
      pads += pad(x + PG, TY, changed);
      bodies += seriesBody(x - PG + PW / 2, x + PG - PW / 2);
      lbls += label(x, TY - 19, arm.labels[0], val, unit);
      pnums += `<text x="${x - PG + PW / 2 + 2}" y="${TY + 4}" font-size="8" fill="#1D9E75" font-weight="600">P${pIdx}</text>`;
      pnums += `<text x="${x + PG + 2}" y="${TY + 4}" font-size="8" fill="#1D9E75" font-weight="600">P${pIdx + 1}</text>`;
      pIdx += 2;
    }
  } else {
    const lPart = arm.parts.find((p) => p.type === 'L')!;
    const cPart = arm.parts.find((p) => p.type === 'C')!;
    const lChanged = changedOf(arm.parts.indexOf(lPart));
    const cChanged = changedOf(arm.parts.indexOf(cPart));
    const lFmt = fmt(lPart.value, 'L');
    const cFmt = fmt(cPart.value, 'C');

    if (arm.position === 'series') {
      // both series ('series-LC') and parallel-as-series render on the main trace
      pads += pad(x - PG, TY, lChanged || cChanged);
      pads += pad(x + PG, TY, lChanged || cChanged);
      bodies += `<rect x="${x - PG + PW / 2}" y="${TY - 13}" width="${2 * (PG - PW / 2)}" height="12" rx="3" fill="rgba(230,241,251,0.6)" stroke="#185FA5" stroke-width="1" stroke-dasharray="4,2"/>`;
      bodies += `<rect x="${x - PG + PW / 2}" y="${TY + 1}" width="${2 * (PG - PW / 2)}" height="12" rx="3" fill="rgba(250,238,218,0.6)" stroke="#EF9F27" stroke-width="1" stroke-dasharray="4,2"/>`;
      lbls += `<text x="${x}" y="${TY - 20}" text-anchor="middle" font-size="9.5" fill="#444" font-weight="500">${arm.labels[0]} ${lFmt.val}${lFmt.unit} · ${arm.labels[1]} ${cFmt.val}${cFmt.unit}</text>`;
      lbls += `<text x="${x}" y="${TY + 24}" text-anchor="middle" font-size="8.5" fill="#888">${arm.subtopology === 'series' ? 'L+C series' : 'L∥C parallel'}</text>`;
      pnums += `<text x="${x - PG + PW / 2 + 2}" y="${TY + 4}" font-size="8" fill="#1D9E75" font-weight="600">P${pIdx}</text>`;
      pnums += `<text x="${x + PG + 2}" y="${TY + 4}" font-size="8" fill="#1D9E75" font-weight="600">P${pIdx + 1}</text>`;
      pIdx += 2;
    } else {
      pads += pad(x, TY, lChanged || cChanged);
      stubs += `<line x1="${x - 5}" y1="${TY + PH / 2}" x2="${x - 5}" y2="${TY + 20}" stroke="#777" stroke-width="1.5"/>`;
      stubs += `<line x1="${x + 5}" y1="${TY + PH / 2}" x2="${x + 5}" y2="${TY + 20}" stroke="#777" stroke-width="1.5"/>`;
      pads += `<rect x="${x - 5 - PW / 2}" y="${TY + 20}" width="${PW}" height="${PH}" rx="2" fill="${lChanged ? '#EF9F27' : '#BA7517'}"/>`;
      pads += `<rect x="${x + 5 - PW / 2}" y="${TY + 20}" width="${PW}" height="${PH}" rx="2" fill="${cChanged ? '#EF9F27' : '#BA7517'}"/>`;
      vias += via(x - 5, TY + 41);
      vias += via(x + 5, TY + 41);
      lbls += `<text x="${x}" y="${TY - 24}" text-anchor="middle" font-size="9.5" fill="#444" font-weight="500">${arm.labels[0]} ${lFmt.val}${lFmt.unit} · ${arm.labels[1]} ${cFmt.val}${cFmt.unit}</text>`;
      lbls += `<text x="${x}" y="${TY - 13}" text-anchor="middle" font-size="8.5" fill="#888">${arm.subtopology === 'series' ? 'L+C series' : 'L∥C parallel'}</text>`;
      pnums += `<text x="${x - 16}" y="${TY + 3}" font-size="8" fill="#1D9E75" font-weight="600">P${pIdx}</text>`;
      pnums += `<text x="${x + 8}" y="${TY + 3}" font-size="8" fill="#1D9E75" font-weight="600">P${pIdx + 1}</text>`;
      pIdx += 2;
    }
  }

  return { svg: `${stubs}${pads}${bodies}${vias}${pnums}${lbls}`, pUsed: pIdx };
}

export default function PcbLayout({ arms, baseArms }: Props) {
  const svg = useMemo(() => {
    const n = arms.length;
    const sp = (W - 100) / (n + 1);
    let pIdx = 1;
    let body = '';
    arms.forEach((arm, i) => {
      const x = 50 + sp * (i + 1);
      const { svg: armSvg, pUsed } = renderArm(arm, baseArms[i] ?? arm, x, pIdx);
      body += armSvg;
      pIdx = pUsed;
    });

    const portPads = `
      <rect x="8" y="${TY - 11}" width="30" height="22" rx="3" fill="#854F0B"/>
      <text x="23" y="${TY + 5}" text-anchor="middle" font-size="9.5" font-weight="600" fill="#FAEEDA">RF IN</text>
      <rect x="${W - 38}" y="${TY - 11}" width="30" height="22" rx="3" fill="#854F0B"/>
      <text x="${W - 23}" y="${TY + 5}" text-anchor="middle" font-size="9.5" font-weight="600" fill="#FAEEDA">RF OUT</text>
    `;

    return `<svg viewBox="0 0 ${W} ${H}" width="100%" style="display:block">
      <rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="7" fill="#f9f8f4" stroke="#d3d1c7" stroke-width="0.5"/>
      <line x1="8" y1="${TY}" x2="${W - 8}" y2="${TY}" stroke="#BA7517" stroke-width="3.5"/>
      ${portPads}${body}
    </svg>`;
  }, [arms, baseArms]);

  return <div dangerouslySetInnerHTML={{ __html: svg }} />;
}
