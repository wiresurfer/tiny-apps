import React from 'react';
import { FilterKind, KIND_LABEL, Topology } from '../types';
import { fmtFreq } from '../format';

interface Props {
  kind: FilterKind;
  order: number;
  topo: Topology;
  baseFc: number;
  edgeLo: number | null;
  edgeHi: number | null;
}

export default function SummaryBar({ kind, order, topo, baseFc, edgeLo, edgeHi }: Props) {
  const edgeLabel = kind === 'bandpass' || kind === 'bandstop' ? '−3 dB band' : '−3 dB at';
  return (
    <div className="ft-sr">
      <div className="ft-si">
        <span className="ft-sl">{edgeLabel}</span>
        <span className="ft-sv">
          {edgeLo ? fmtFreq(edgeLo) : '—'}
          {kind === 'bandpass' || kind === 'bandstop' ? ` – ${edgeHi ? fmtFreq(edgeHi) : '—'}` : ''}
        </span>
      </div>
      <div className="ft-si">
        <span className="ft-sl">order</span>
        <span className="ft-sv">{order}</span>
      </div>
      <div className="ft-si">
        <span className="ft-sl">topology</span>
        <span className="ft-sv">{topo === 'pi' ? 'Pi (π)' : 'T'}</span>
      </div>
      <div className="ft-si">
        <span className="ft-sl">type</span>
        <span className="ft-sv">{KIND_LABEL[kind]}</span>
      </div>
      <div className="ft-si" style={{ marginLeft: 'auto' }}>
        <span className="ft-sl">base design</span>
        <span className="ft-sv">{fmtFreq(baseFc)}</span>
      </div>
    </div>
  );
}
