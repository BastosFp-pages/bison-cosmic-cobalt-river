import type { Catalog, GeomMap, RouteRec, Street, Trecho, TrechoMap } from "./types";

export interface Bundle {
  catalog: Catalog;
  streets: Street[];
  routes: RouteRec[];
  trechos: TrechoMap;
  geom: GeomMap;
  trechosReady: boolean;
  streetByTid: Record<number, string>;
}

let bundle: Bundle | null = null;
let pending: Promise<Bundle> | null = null;

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Falha ao carregar ${url} (${res.status})`);
  return res.json() as Promise<T>;
}

function streetIndex(streets: Street[]): Record<number, string> {
  const m: Record<number, string> = {};
  for (const s of streets) {
    for (const id of s.ids) m[id] = s.id;
  }
  return m;
}

export async function loadShell(): Promise<Bundle> {
  const [catalog, streets, routes, geom] = await Promise.all([
    getJson<Catalog>("/data/catalog.json"),
    getJson<Street[]>("/data/streets.json"),
    getJson<RouteRec[]>("/data/routes.json"),
    getJson<GeomMap>("/data/geom.json"),
  ]);
  bundle = {
    catalog,
    streets,
    routes,
    geom,
    trechos: {},
    trechosReady: false,
    streetByTid: streetIndex(streets),
  };
  return bundle;
}

export async function loadTrechos(): Promise<TrechoMap> {
  const trechos = await getJson<TrechoMap>("/data/trechos.json");
  if (bundle) {
    bundle = { ...bundle, trechos, trechosReady: true };
  }
  return trechos;
}

export function loadBundle(): Promise<Bundle> {
  if (bundle?.trechosReady) return Promise.resolve(bundle);
  if (pending) return pending;
  pending = loadShell();
  return pending;
}

export function getTrecho(b: Bundle, id: number): Trecho | undefined {
  return b.trechos[String(id)];
}

export function bboxOfIds(
  b: Bundle,
  ids: number[],
): [number, number, number, number] | null {
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  let any = false;
  for (const id of ids) {
    const parts = b.geom[String(id)];
    if (!parts) continue;
    for (const line of parts) {
      for (const [x, y] of line) {
        any = true;
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }
  return any ? [minX, minY, maxX, maxY] : null;
}

export function featureOf(b: Bundle, id: number) {
  const parts = b.geom[String(id)];
  if (!parts) return null;
  return {
    type: "Feature" as const,
    properties: { id },
    geometry: { type: "MultiLineString" as const, coordinates: parts },
  };
}
