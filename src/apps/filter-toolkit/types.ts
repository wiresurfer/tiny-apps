export type FilterKind = 'lowpass' | 'highpass' | 'bandpass' | 'bandstop';
export type Topology = 'pi' | 't';
export type TuneMode = 'C' | 'L' | 'all';
export type PartType = 'L' | 'C';
export type ArmPosition = 'series' | 'shunt';
export type ArmSubtopology = 'single' | 'series' | 'parallel';

export interface Part {
  type: PartType;
  value: number; // Farads or Henries
}

export interface Arm {
  position: ArmPosition;
  subtopology: ArmSubtopology;
  parts: Part[];
  labels: string[]; // one label per part, same order as parts
}

export interface FilterParams {
  kind: FilterKind;
  order: number;
  topo: Topology;
  fc: number; // Hz — cutoff (LP/HP) or center frequency (BP/BS)
  bwFrac: number; // fractional bandwidth, BP/BS only
}

export const KIND_LABEL: Record<FilterKind, string> = {
  lowpass: 'Low-pass',
  highpass: 'High-pass',
  bandpass: 'Band-pass',
  bandstop: 'Band-stop',
};

export const usesBandwidth = (kind: FilterKind) => kind === 'bandpass' || kind === 'bandstop';
