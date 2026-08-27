import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function fold(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();
}

export function fmtKm(m: number | null | undefined): string {
  if (m == null || Number.isNaN(m)) return "—";
  if (m >= 1000) return `${(m / 1000).toFixed(2).replace(".", ",")} km`;
  return `${Math.round(m)} m`;
}

export function fmtKmDirect(km: number | null | undefined): string {
  if (km == null || Number.isNaN(km)) return "—";
  return `${km.toFixed(2).replace(".", ",")} km`;
}

export function fmtPct(n: number | null | undefined, digits = 1): string {
  if (n == null || Number.isNaN(n)) return "—";
  return `${n.toFixed(digits).replace(".", ",")}%`;
}

export function fmtNum(n: number | null | undefined, digits = 1): string {
  if (n == null || Number.isNaN(n)) return "—";
  return n.toFixed(digits).replace(".", ",");
}

const DOW: Record<string, string> = {
  seg: "Seg",
  ter: "Ter",
  qua: "Qua",
  qui: "Qui",
  sex: "Sex",
  sab: "Sáb",
  dom: "Dom",
};

export function labelDow(code: string): string {
  return DOW[code] ?? code;
}

export function formatDias(dias: string[] | null | undefined): string {
  if (!dias || dias.length === 0) return "—";
  const labels = dias.map(labelDow);
  const key = dias.join(",");
  if (key === "seg,qua,sex") return "Seg / Qua / Sex";
  if (key === "ter,qui,sab") return "Ter / Qui / Sáb";
  if (key === "seg,ter,qua,qui,sex,sab") return "Seg a sáb";
  if (key === "dom") return "Domingo";
  return labels.join(", ");
}

export function formatDatePt(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(dt);
}

export function nextDayIso(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + 1);
  return dt.toISOString().slice(0, 10);
}
