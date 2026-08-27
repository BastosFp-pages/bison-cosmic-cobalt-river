import { useEffect, useRef, useState } from "react";
import { useData } from "@/components/data-provider";
import {
  hourColor,
  NETWORK,
  routeColor,
  SELECTED,
  STATS_PLATE,
  STREET,
} from "@/lib/colors";
import { bboxOfIds, featureOf, type Bundle } from "@/lib/data";
import { useApp } from "@/lib/store";

type LeafletModule = typeof import("leaflet");
type LeafletMap = import("leaflet").Map;
type LayerGroup = import("leaflet").LayerGroup;
type LeafletPoint = import("leaflet").Point;

const OSM_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const OSM_ATTR =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
const ESRI_URL =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}";
const ESRI_ATTR =
  "Tiles &copy; Esri &mdash; Source: Esri, HERE, Garmin, USGS, OSM";

export function MapView() {
  const hostRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const Lref = useRef<LeafletModule | null>(null);
  const netRef = useRef<LayerGroup | null>(null);
  const hlRef = useRef<LayerGroup | null>(null);
  const pickRef = useRef<(id: number) => void>(() => undefined);
  const layerPickAt = useRef(0);
  const [ready, setReady] = useState(false);
  const data = useData();
  const streetId = useApp((s) => s.streetId);
  const trechoId = useApp((s) => s.trechoId);
  const routeIndex = useApp((s) => s.routeIndex);
  const statsKind = useApp((s) => s.statsKind);
  const selectedHour = useApp((s) => s.selectedHour);
  const selectedPlate = useApp((s) => s.selectedPlate);
  const pickMapTrecho = useApp((s) => s.pickMapTrecho);

  pickRef.current = (id: number) => {
    layerPickAt.current = performance.now();
    const sid = data.streetByTid[id] ?? null;
    pickMapTrecho(sid, id);
  };

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    let cancelled = false;
    let map: LeafletMap | undefined;
    let resize: ResizeObserver | undefined;

    (async () => {
      const L = await import("leaflet");
      if (cancelled || !hostRef.current) return;
      Lref.current = L;
      map = L.map(hostRef.current, {
        zoomControl: false,
        attributionControl: true,
      });
      const bbox = data.catalog.bbox;
      if (bbox) {
        map.fitBounds(
          [
            [bbox[1], bbox[0]],
            [bbox[3], bbox[2]],
          ],
          { padding: [24, 24], maxZoom: 14 },
        );
      } else {
        map.setView([-22.786, -43.305], 13);
      }

      const osm = L.tileLayer(OSM_URL, {
        attribution: OSM_ATTR,
        maxZoom: 19,
        className: "basemap-muted",
      });
      osm.on("tileerror", () => {
        if (!map || map.hasLayer(osm) === false) return;
        if ((map as unknown as { __fallback?: boolean }).__fallback) return;
        (map as unknown as { __fallback?: boolean }).__fallback = true;
        map.removeLayer(osm);
        L.tileLayer(ESRI_URL, {
          attribution: ESRI_ATTR,
          maxZoom: 19,
          className: "basemap-muted",
        }).addTo(map);
      });
      osm.addTo(map);

      L.control.zoom({ position: "bottomright" }).addTo(map);
      L.control.scale({ imperial: false, position: "bottomleft" }).addTo(map);

      map.createPane("network");
      const netPane = map.getPane("network");
      if (netPane) {
        netPane.style.zIndex = "350";
        netPane.style.pointerEvents = "auto";
      }
      map.createPane("highlight");
      const hlPane = map.getPane("highlight");
      if (hlPane) {
        hlPane.style.zIndex = "450";
        hlPane.style.pointerEvents = "auto";
      }

      const net = L.layerGroup([], { pane: "network" }).addTo(map);
      const hl = L.layerGroup([], { pane: "highlight" }).addTo(map);
      netRef.current = net;
      hlRef.current = hl;
      mapRef.current = map;

      paintNetwork(L, net, data, (id) => pickRef.current(id));

      map.on("click", (e: import("leaflet").LeafletMouseEvent) => {
        if (!map) return;
        if (performance.now() - layerPickAt.current < 80) return;
        const id = nearestTrecho(L, map, data, e.latlng, 16);
        if (id != null) pickRef.current(id);
      });

      setReady(true);

      resize = new ResizeObserver(() => {
        map?.invalidateSize();
      });
      if (hostRef.current) resize.observe(hostRef.current);
    })();

    return () => {
      cancelled = true;
      resize?.disconnect();
      setReady(false);
      map?.remove();
      mapRef.current = null;
      netRef.current = null;
      hlRef.current = null;
    };
    // geom is available on first paint of this component
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!ready) return;
    const L = Lref.current;
    const map = mapRef.current;
    const hl = hlRef.current;
    if (!L || !map || !hl) return;
    hl.clearLayers();

    const addLine = (
      id: number,
      style: { color: string; weight: number; opacity: number },
      interactive: boolean,
    ) => {
      const feat = featureOf(data, id);
      if (!feat) return;
      const layer = L.geoJSON(feat as GeoJSON.Feature, {
        style: { ...style, lineCap: "round", lineJoin: "round" },
        interactive,
        pane: "highlight",
      });
      if (interactive) {
        layer.on("click", (e) => {
          L.DomEvent.stopPropagation(e);
          pickRef.current(id);
        });
      }
      layer.addTo(hl);
    };

    let fit: [number, number, number, number] | null = null;

    if (statsKind === "hora" && selectedHour) {
      const ids = data.catalog.idxHora[selectedHour] ?? [];
      for (const id of ids) {
        addLine(
          id,
          {
            color: hourColor(selectedHour),
            weight: trechoId === id ? 7 : 3.5,
            opacity: trechoId === id ? 1 : 0.85,
          },
          true,
        );
      }
      fit = bboxOfIds(data, ids);
    } else if (statsKind === "veiculo" && selectedPlate) {
      const ids = data.catalog.idxPlaca[selectedPlate] ?? [];
      for (const id of ids) {
        addLine(
          id,
          {
            color: STATS_PLATE,
            weight: trechoId === id ? 7 : 3.5,
            opacity: trechoId === id ? 1 : 0.85,
          },
          true,
        );
      }
      fit = bboxOfIds(data, ids);
    } else if (routeIndex != null) {
      const route = data.routes[routeIndex];
      if (route) {
        const color = routeColor(route.turno, route.bloco);
        for (const id of route.ids) {
          addLine(
            id,
            {
              color: trechoId === id ? SELECTED : color,
              weight: trechoId === id ? 7 : 4,
              opacity: 0.95,
            },
            true,
          );
        }
        fit = route.bbox;
      }
    } else if (streetId) {
      const street = data.streets.find((s) => s.id === streetId);
      if (street) {
        for (const id of street.ids) {
          const selected = trechoId === id;
          addLine(
            id,
            {
              color: selected ? SELECTED : STREET,
              weight: selected ? 7 : 4.5,
              opacity: 0.95,
            },
            true,
          );
        }
        fit = street.bbox;
      }
    }

    if (fit && (routeIndex != null || statsKind || !trechoId)) {
      map.fitBounds(
        [
          [fit[1], fit[0]],
          [fit[3], fit[2]],
        ],
        { padding: [40, 40], maxZoom: 17 },
      );
    } else if (trechoId) {
      const tb = bboxOfIds(data, [trechoId]);
      if (tb) {
        const lat = (tb[1] + tb[3]) / 2;
        const lng = (tb[0] + tb[2]) / 2;
        const z = map.getZoom();
        if (z < 15 && fit) {
          map.fitBounds(
            [
              [fit[1], fit[0]],
              [fit[3], fit[2]],
            ],
            { padding: [40, 40], maxZoom: 16 },
          );
        } else if (!map.getBounds().contains([lat, lng])) {
          map.panTo([lat, lng]);
        }
      }
    }
  }, [
    ready,
    data,
    streetId,
    trechoId,
    routeIndex,
    statsKind,
    selectedHour,
    selectedPlate,
  ]);

  return <div ref={hostRef} className="absolute inset-0 z-0 h-full w-full" />;
}

function paintNetwork(
  L: LeafletModule,
  group: LayerGroup,
  data: Bundle,
  onPick: (id: number) => void,
) {
  const features = Object.keys(data.geom).map((id) => ({
    type: "Feature" as const,
    properties: { id: Number(id) },
    geometry: { type: "MultiLineString" as const, coordinates: data.geom[id] },
  }));
  const layer = L.geoJSON(
    { type: "FeatureCollection", features } as GeoJSON.FeatureCollection,
    {
      style: {
        color: NETWORK,
        weight: 3.2,
        opacity: 0.7,
        lineCap: "round",
        lineJoin: "round",
      },
      interactive: true,
      pane: "network",
      renderer: L.canvas({ pane: "network", padding: 0.6, tolerance: 12 }),
      onEachFeature: (feat, lyr) => {
        lyr.on("click", (e) => {
          L.DomEvent.stopPropagation(e);
          const id = (feat.properties as { id?: number } | null)?.id;
          if (id != null) onPick(id);
        });
      },
    } as import("leaflet").GeoJSONOptions,
  );

  layer.addTo(group);
}

function distPointToSeg(p: LeafletPoint, a: LeafletPoint, b: LeafletPoint): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return Math.hypot(p.x - a.x, p.y - a.y);
  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}

function nearestTrecho(
  L: LeafletModule,
  map: LeafletMap,
  data: Bundle,
  latlng: import("leaflet").LatLng,
  maxPx: number,
): number | null {
  const p = map.latLngToLayerPoint(latlng);
  const pad = maxPx + 2;
  let best: number | null = null;
  let bestD = maxPx;
  for (const [id, parts] of Object.entries(data.geom)) {
    for (const line of parts) {
      for (let i = 1; i < line.length; i++) {
        const a = map.latLngToLayerPoint(L.latLng(line[i - 1][1], line[i - 1][0]));
        const b = map.latLngToLayerPoint(L.latLng(line[i][1], line[i][0]));
        if (
          Math.max(a.x, b.x) < p.x - pad ||
          Math.min(a.x, b.x) > p.x + pad ||
          Math.max(a.y, b.y) < p.y - pad ||
          Math.min(a.y, b.y) > p.y + pad
        ) {
          continue;
        }
        const d = distPointToSeg(p, a, b);
        if (d < bestD) {
          bestD = d;
          best = Number(id);
        }
      }
    }
  }
  return best;
}
