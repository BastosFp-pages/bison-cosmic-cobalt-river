export type StatusCode = "V" | "VR" | "P" | "B" | "O" | null;

export interface RouteHit {
  i: number | null;
  hr: number | null;
  st: StatusCode;
  bl?: string | null;
  tu?: string | null;
}

export interface CountItem {
  k: string;
  n: number | null;
}

export interface TrechoStats {
  np: number | null;
  pl: string | null;
  pp: number | null;
  pt: CountItem[];
  fx: string | null;
  nfx: number | null;
  vm: number | null;
  vd: number | null;
  v75: number | null;
  va: number | null;
  dias: number[];
  nd?: number;
  dow: string[];
}

export interface TrechoHora {
  nl: number | null;
  fx: string | null;
  pct: number | null;
  t3: CountItem[];
  fd: string | null;
  pd: number | null;
  t3d: CountItem[];
  dow: Record<string, string>;
}

export interface Trecho {
  id: number;
  n: string;
  b: string | null;
  d: string | null;
  e: number | null;
  r: RouteHit[];
  s?: TrechoStats;
  h?: TrechoHora;
}

export interface Street {
  id: string;
  name: string;
  bairro: string | null;
  bairros?: string[];
  distrito: string | null;
  ids: number[];
  bbox: [number, number, number, number] | null;
  n: number;
  km: number;
}

export interface RouteRec {
  name: string;
  turno: string | null;
  dias: string[];
  bloco: string | null;
  bairro: string | null;
  ids: number[];
  bbox: [number, number, number, number] | null;
  n: number;
  km: number;
}

export interface Catalog {
  lote: string;
  periodo: { inicio: string | null; fim: string | null };
  limiarHitRate: number;
  bbox: [number, number, number, number] | null;
  resumo: {
    nTrechos: number;
    nTrechosGps: number;
    nTrechosValidados: number;
    nRuas: number;
    nRotas: number;
    nBairros: number;
    nPlacas: number;
    kmRede: number;
    kmComGps: number;
  };
  bairros: string[];
  turnos: string[];
  placas: { placa: string; n: number }[];
  faixasHora: string[];
  dias: string[];
  idxHora: Record<string, number[]>;
  idxPlaca: Record<string, number[]>;
}

export type GeomMap = Record<string, number[][][]>;
export type TrechoMap = Record<string, Trecho>;
