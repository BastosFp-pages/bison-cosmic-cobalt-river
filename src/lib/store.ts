import { create } from "zustand";

export type StatsKind = "hora" | "veiculo" | null;

interface AppState {
  query: string;
  bairro: string | null;
  streetId: string | null;
  trechoId: number | null;
  routeIndex: number | null;
  showAttendance: boolean;
  attendanceDate: string | null;
  statsKind: StatsKind;
  selectedHour: string | null;
  selectedPlate: string | null;
  legendOpen: boolean;
  setQuery: (q: string) => void;
  setBairro: (b: string | null) => void;
  selectStreet: (id: string | null) => void;
  selectTrecho: (id: number | null) => void;
  pickMapTrecho: (streetId: string | null, trechoId: number) => void;
  selectRoute: (i: number | null) => void;
  setAttendance: (open: boolean, date?: string | null) => void;
  setStats: (kind: StatsKind, value?: string | null) => void;
  setLegendOpen: (v: boolean) => void;
  resetSelection: () => void;
}

export const useApp = create<AppState>((set) => ({
  query: "",
  bairro: null,
  streetId: null,
  trechoId: null,
  routeIndex: null,
  showAttendance: false,
  attendanceDate: null,
  statsKind: null,
  selectedHour: null,
  selectedPlate: null,
  legendOpen: false,
  setQuery: (q) => set({ query: q }),
  setBairro: (b) => set({ bairro: b }),
  selectStreet: (id) =>
    set({
      streetId: id,
      trechoId: null,
      routeIndex: null,
      showAttendance: false,
      statsKind: null,
      selectedHour: null,
      selectedPlate: null,
    }),
  selectTrecho: (id) =>
    set({
      trechoId: id,
      routeIndex: null,
      showAttendance: false,
    }),
  pickMapTrecho: (streetId, trechoId) =>
    set({
      streetId,
      trechoId,
      routeIndex: null,
      showAttendance: false,
      statsKind: null,
      selectedHour: null,
      selectedPlate: null,
    }),
  selectRoute: (i) =>
    set({
      routeIndex: i,
      showAttendance: false,
      statsKind: null,
      selectedHour: null,
      selectedPlate: null,
    }),
  setAttendance: (open, date) =>
    set((s) => ({
      showAttendance: open,
      attendanceDate: date === undefined ? s.attendanceDate : date,
    })),
  setStats: (kind, value) =>
    set({
      statsKind: kind,
      selectedHour: kind === "hora" ? (value ?? null) : null,
      selectedPlate: kind === "veiculo" ? (value ?? null) : null,
      streetId: null,
      trechoId: null,
      routeIndex: null,
      showAttendance: false,
    }),
  setLegendOpen: (v) => set({ legendOpen: v }),
  resetSelection: () =>
    set({
      streetId: null,
      trechoId: null,
      routeIndex: null,
      showAttendance: false,
      attendanceDate: null,
      statsKind: null,
      selectedHour: null,
      selectedPlate: null,
      query: "",
    }),
}));
