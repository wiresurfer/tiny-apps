import React, { useMemo, useState } from 'react';
import '../../theme.css';
import './filter-toolkit.css';
import ThemeToggle from '../../components/ThemeToggle';
import { Arm, FilterKind, KIND_LABEL, Topology, TuneMode, usesBandwidth } from './types';
import { buildFilter, applyTune, armsChanged } from './synthesis';
import { s21, makeFreqGrid, findFallingX, findRisingX } from './dsp';
import { fmt, nearE12, fmtFreq } from './format';
import ResponseChart, { GhostCurve } from './components/ResponseChart';
import ComponentList from './components/ComponentList';
import PcbLayout from './components/PcbLayout';
import SummaryBar from './components/SummaryBar';

const PRESET_OFFSETS = [-0.1, -0.0667, -0.0333, 0];
const PCOL = ['#7F77DD', '#1D9E75', '#378ADD', '#BA7517'];

function edgesFor(kind: FilterKind, resp: number[], freqs: number[]): [number | null, number | null] {
  if (kind === 'lowpass') {
    const e = findFallingX(resp, freqs, -3.01);
    return [e?.freq ?? null, null];
  }
  if (kind === 'highpass') {
    const e = findRisingX(resp, freqs, -3.01);
    return [e?.freq ?? null, null];
  }
  if (kind === 'bandpass') {
    const lo = findRisingX(resp, freqs, -3.01);
    if (!lo) return [null, null];
    const hi = findFallingX(resp, freqs, -3.01, lo.idx + 1);
    return [lo.freq, hi?.freq ?? null];
  }
  const lo = findFallingX(resp, freqs, -3.01);
  if (!lo) return [null, null];
  const hi = findRisingX(resp, freqs, -3.01, lo.idx + 1);
  return [lo.freq, hi?.freq ?? null];
}

export default function FilterToolkit() {
  const [kind, setKind] = useState<FilterKind>('lowpass');
  const [order, setOrder] = useState(3);
  const [topo, setTopo] = useState<Topology>('pi');
  const [baseFcMHz, setBaseFcMHz] = useState(300);
  const [bwPct, setBwPct] = useState(10);
  const [targetFc, setTargetFc] = useState(300e6);
  const [tuneMode, setTuneMode] = useState<TuneMode>('C');

  const baseFc = baseFcMHz * 1e6;
  const bwFrac = bwPct / 100;

  const baseArms = useMemo(() => buildFilter({ kind, order, topo, fc: baseFc, bwFrac }), [kind, order, topo, baseFc, bwFrac]);

  const [arms, setArms] = useState<Arm[]>(() => baseArms.map((a) => ({ ...a, parts: a.parts.map((p) => ({ ...p })) })));

  const applyParams = (k: FilterKind, o: number, tp: Topology, bfc: number, bw: number, tfc: number, tm: TuneMode) => {
    const nb = buildFilter({ kind: k, order: o, topo: tp, fc: bfc, bwFrac: bw });
    const ideal = buildFilter({ kind: k, order: o, topo: tp, fc: tfc, bwFrac: bw });
    setArms(applyTune(ideal, nb, tm));
  };

  const onKind = (k: FilterKind) => {
    setKind(k);
    setTargetFc(baseFc);
    applyParams(k, order, topo, baseFc, bwFrac, baseFc, tuneMode);
  };
  const onOrder = (o: number) => {
    setOrder(o);
    applyParams(kind, o, topo, baseFc, bwFrac, targetFc, tuneMode);
  };
  const onTopo = (tp: Topology) => {
    setTopo(tp);
    applyParams(kind, order, tp, baseFc, bwFrac, targetFc, tuneMode);
  };
  const onBaseFc = (mhz: number) => {
    setBaseFcMHz(mhz);
    setTargetFc(mhz * 1e6);
    applyParams(kind, order, topo, mhz * 1e6, bwFrac, mhz * 1e6, tuneMode);
  };
  const onBw = (pct: number) => {
    setBwPct(pct);
    applyParams(kind, order, topo, baseFc, pct / 100, targetFc, tuneMode);
  };
  const onPreset = (fc: number) => {
    setTargetFc(fc);
    applyParams(kind, order, topo, baseFc, bwFrac, fc, tuneMode);
  };
  const onTuneMode = (tm: TuneMode) => {
    setTuneMode(tm);
    applyParams(kind, order, topo, baseFc, bwFrac, targetFc, tm);
  };
  const onEditPart = (armIdx: number, partIdx: number, value: number) => {
    setArms((prev) => prev.map((a, i) => (i === armIdx ? { ...a, parts: a.parts.map((p, j) => (j === partIdx ? { ...p, value } : p)) } : a)));
  };

  const fMin = baseFc / 30;
  const fMax = baseFc * 10;
  const freqs = useMemo(() => makeFreqGrid(fMin, fMax), [fMin, fMax]);

  const activeResp = useMemo(() => freqs.map((f) => s21(f, arms)), [freqs, arms]);
  const [edgeLo, edgeHi] = useMemo(() => edgesFor(kind, activeResp, freqs), [kind, activeResp, freqs]);

  const presets = useMemo(
    () => PRESET_OFFSETS.map((off) => Math.round(baseFc * (1 + off))),
    [baseFc]
  );

  const ghosts: GhostCurve[] = useMemo(
    () =>
      presets.map((fc, i) => {
        const idealArms = buildFilter({ kind, order, topo, fc, bwFrac });
        return { label: fmtFreq(fc), color: PCOL[i], resp: freqs.map((f) => s21(f, idealArms)) };
      }),
    [presets, kind, order, topo, bwFrac, freqs]
  );

  const changed = useMemo(() => armsChanged(arms, baseArms), [arms, baseArms]);
  const swapRows: { label: string; val: string; unit: string; eVal: string; eUnit: string; err: string }[] = [];
  arms.forEach((arm, ai) => {
    arm.parts.forEach((part, pi) => {
      if (!changed[ai][pi]) return;
      const { val, unit } = fmt(part.value, part.type);
      const e = nearE12(part.value);
      const eFmt = fmt(e, part.type);
      const err = (Math.abs(e / part.value - 1) * 100).toFixed(1);
      swapRows.push({ label: arm.labels[pi], val, unit, eVal: eFmt.val, eUnit: eFmt.unit, err });
    });
  });

  return (
    <div className="ft">
      <div className="ft-w">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <a href="#/" className="ft-back" style={{ marginBottom: 0 }}>
            ← tiny-apps
          </a>
          <ThemeToggle />
        </div>
        <div className="ft-r">
          <h1>Filter toolkit</h1>
          <span className="ft-sub">Butterworth ladder · 50 Ω</span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <div className="ft-sg">
              {(['lowpass', 'highpass', 'bandpass', 'bandstop'] as FilterKind[]).map((k) => (
                <button key={k} className={kind === k ? 'ft-a' : ''} onClick={() => onKind(k)}>
                  {KIND_LABEL[k]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="ft-r">
          <div className="ft-sg">
            <button className={topo === 'pi' ? 'ft-a' : ''} onClick={() => onTopo('pi')}>
              π-net
            </button>
            <button className={topo === 't' ? 'ft-a' : ''} onClick={() => onTopo('t')}>
              T-net
            </button>
          </div>
          <div className="ft-sg">
            <button className={order === 3 ? 'ft-a' : ''} onClick={() => onOrder(3)}>
              3rd order
            </button>
            <button className={order === 5 ? 'ft-a' : ''} onClick={() => onOrder(5)}>
              5th order
            </button>
          </div>
          <label className="ft-fld">
            base f<sub>c</sub>
            <input
              className="ft-num"
              type="number"
              value={baseFcMHz}
              onChange={(e) => onBaseFc(parseFloat(e.target.value) || baseFcMHz)}
            />
            MHz
          </label>
          {usesBandwidth(kind) && (
            <label className="ft-fld">
              BW
              <input className="ft-num" type="number" value={bwPct} onChange={(e) => onBw(parseFloat(e.target.value) || bwPct)} />
              %
            </label>
          )}
        </div>

        <div className="ft-r">
          <span style={{ fontSize: 12, color: '#888780' }}>Target f_c:</span>
          {presets.map((fc, i) => (
            <button key={fc} className={`ft-pb${targetFc === fc ? ' ft-a' : ''}`} onClick={() => onPreset(fc)}>
              {fmtFreq(fc)}
            </button>
          ))}
          <label className="ft-fld">
            <input
              className="ft-num"
              type="number"
              value={+(targetFc / 1e6).toFixed(3)}
              onChange={(e) => {
                const mhz = parseFloat(e.target.value);
                if (!Number.isNaN(mhz) && mhz > 0) onPreset(mhz * 1e6);
              }}
            />
            MHz
          </label>
          <span style={{ marginLeft: 10, fontSize: 12, color: '#888780' }}>Tune by:</span>
          <div className="ft-sg">
            <button className={tuneMode === 'C' ? 'ft-a' : ''} onClick={() => onTuneMode('C')}>
              caps only
            </button>
            <button className={tuneMode === 'L' ? 'ft-a' : ''} onClick={() => onTuneMode('L')}>
              inds only
            </button>
            <button className={tuneMode === 'all' ? 'ft-a' : ''} onClick={() => onTuneMode('all')}>
              all
            </button>
          </div>
        </div>

        <div className="ft-mg">
          <div className="ft-pnl">
            <div className="ft-pl">Components</div>
            <ComponentList arms={arms} baseArms={baseArms} onChange={onEditPart} />
            {swapRows.length > 0 && (
              <div className="ft-sn">
                <b>E12 swap guide vs {fmtFreq(baseFc)} base:</b>
                <br />
                {swapRows.map((r, i) => (
                  <React.Fragment key={i}>
                    <b>{r.label}</b>: ideal {r.val} {r.unit} → E12: <b>{r.eVal} {r.eUnit}</b> ({r.err}% Δ)
                    <br />
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
          <div className="ft-pnl">
            <div className="ft-pl">
              <span>S₂₁ insertion loss</span>
              <span style={{ fontWeight: 400, fontSize: '10.5px' }}>log freq · dB</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 6, fontSize: 11, color: '#888780' }}>
              {ghosts.map((g) => (
                <span key={g.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 14, height: 2, background: g.color, opacity: 0.75, borderRadius: 2, display: 'inline-block' }} />
                  {g.label}
                </span>
              ))}
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 14, height: 2, background: '#E24B4A', opacity: 0.6, borderRadius: 2, display: 'inline-block' }} />
                −3 dB ref
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto' }}>
                <span style={{ width: 14, height: 3, background: '#1D9E75', borderRadius: 2, display: 'inline-block' }} />
                active
              </span>
            </div>
            <ResponseChart freqs={freqs} activeResp={activeResp} ghosts={ghosts} targetFc={targetFc} fMin={fMin} fMax={fMax} />
          </div>
        </div>

        <div className="ft-pcbwrap">
          <div className="ft-pcbhead">PCB pad layout — generic N-pad strip</div>
          <div style={{ padding: '0 8px 8px' }}>
            <PcbLayout arms={arms} baseArms={baseArms} />
          </div>
        </div>

        <SummaryBar kind={kind} order={order} topo={topo} baseFc={baseFc} edgeLo={edgeLo} edgeHi={edgeHi} />
      </div>
    </div>
  );
}
