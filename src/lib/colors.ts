/** Cartographic colours from the sector QGIS style (dias × turno). */
export const BLOCO_TURNO: Record<string, string> = {
  "Ter_Qui_Sab|Noite": "#1a5276",
  "Seg_Qua_Sex|Noite": "#196f3d",
  "Ter_Qui_Sab|Manhã": "#2e86c1",
  "Seg_a_Sab|Manhã": "#c0392b",
  "Domingo|Manhã": "#6c3483",
  "Seg_a_Sab|Madrugada": "#922b21",
  "Domingo|Noite": "#4a235a",
  "Seg_a_Sab|Tarde": "#b9770e",
  "Domingo|Tarde": "#a93226",
  "Seg_Qua_Sex|Manhã": "#1e8449",
  "Ter_Qui_Sab|Tarde": "#b9770e",
  "Seg_Qua_Sex|Tarde": "#1e8449",
};

export const TURNO_FALLBACK: Record<string, string> = {
  Noite: "#1a5276",
  Manhã: "#2e86c1",
  Madrugada: "#922b21",
  Tarde: "#b9770e",
};

export const STATUS_COLOR: Record<string, string> = {
  V: "#1b6b45",
  VR: "#1b6b45",
  P: "#8a6d3b",
  B: "#8f4a2b",
  O: "#5c675f",
};

export const NETWORK = "#5c675f";
export const STREET = "#123d2a";
export const SELECTED = "#c0392b";
export const STATS_HOUR = "#1a5276";
export const STATS_PLATE = "#196f3d";

export function routeColor(turno?: string | null, bloco?: string | null): string {
  if (bloco && turno) {
    const hit = BLOCO_TURNO[`${bloco}|${turno}`];
    if (hit) return hit;
  }
  if (turno && TURNO_FALLBACK[turno]) return TURNO_FALLBACK[turno];
  return NETWORK;
}

export function hitRateColor(hr: number | null | undefined): string {
  if (hr == null) return "#8a9188";
  // Sequential green from the validation threshold (66.7) to full coverage (100).
  // 66.7% is sufficient — never treated as "low".
  const t = Math.max(0, Math.min(1, (hr - 66.67) / (100 - 66.67)));
  const a = [0x3d, 0x7a, 0x58];
  const b = [0x0f, 0x3d, 0x2a];
  const c = a.map((v, i) => Math.round(v + (b[i] - v) * t));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}

export function hourColor(faixa: string): string {
  const h = Number.parseInt(faixa.slice(0, 2), 10);
  if (Number.isNaN(h)) return STATS_HOUR;
  if (h >= 0 && h < 5) return "#2c3e50";
  if (h < 8) return "#922b21";
  if (h < 12) return "#b9770e";
  if (h < 18) return "#1e8449";
  if (h < 21) return "#1a5276";
  return "#4a235a";
}

export const LEGEND_BLOCOS: { key: string; label: string; color: string }[] = [
  { key: "tqs-n", label: "Ter/Qui/Sáb — noite", color: BLOCO_TURNO["Ter_Qui_Sab|Noite"] },
  { key: "sqs-n", label: "Seg/Qua/Sex — noite", color: BLOCO_TURNO["Seg_Qua_Sex|Noite"] },
  { key: "tqs-m", label: "Ter/Qui/Sáb — manhã", color: BLOCO_TURNO["Ter_Qui_Sab|Manhã"] },
  { key: "sas-m", label: "Seg a sáb — manhã", color: BLOCO_TURNO["Seg_a_Sab|Manhã"] },
  { key: "dom-m", label: "Domingo — manhã", color: BLOCO_TURNO["Domingo|Manhã"] },
  { key: "sas-mad", label: "Seg a sáb — madrugada", color: BLOCO_TURNO["Seg_a_Sab|Madrugada"] },
  { key: "dom-n", label: "Domingo — noite", color: BLOCO_TURNO["Domingo|Noite"] },
  { key: "sas-t", label: "Seg a sáb — tarde", color: BLOCO_TURNO["Seg_a_Sab|Tarde"] },
  { key: "dom-t", label: "Domingo — tarde", color: BLOCO_TURNO["Domingo|Tarde"] },
  { key: "sqs-m", label: "Seg/Qua/Sex — manhã", color: BLOCO_TURNO["Seg_Qua_Sex|Manhã"] },
];
