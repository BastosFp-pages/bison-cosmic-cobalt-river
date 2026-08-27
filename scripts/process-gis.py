#!/usr/bin/env python3
"""Compact EPSG:31983 collection GeoJSON into web-ready WGS84 JSON."""
from __future__ import annotations

import glob
import json
import math
import os
import re
import unicodedata
from collections import defaultdict

SRC = "/workspace/attachments"
OUT = "/workspace/public/data"
os.makedirs(OUT, exist_ok=True)

# SIRGAS 2000 / UTM 23S (EPSG:31983) → geographic SIRGAS 2000 ≈ WGS84
A = 6378137.0
F = 1 / 298.257222101
E2 = F * (2 - F)
E1 = (1 - math.sqrt(1 - E2)) / (1 + math.sqrt(1 - E2))
E2P = E2 / (1 - E2)
K0 = 0.9996
LON0 = math.radians(-45.0)

# Merge consecutive blocks of the same named street; keep distant homonyms apart.
# Arterials (avenidas, rodovias) may have missing middle blocks of hundreds of metres.
STREET_GAP_NAMED = 1400.0
STREET_GAP_ARTERIAL = 2500.0
STREET_GAP_GENERIC = 500.0

ARTERIAL_RE = re.compile(
    r"^(avenida|rodovia|estrada|via |viaduto|linha |autoestrada)\b"
)
GENERIC_RE = re.compile(
    r"^(rua|travessa|beco|alameda|avenida)\s+"
    r"(a|b|c|d|e|f|g|h|[0-9]+|um|dois|tr[eê]s|quatro|cinco|seis|sete|oito|nove|dez)\b"
)



def utm_to_ll(easting: float, northing: float) -> tuple[float, float]:
    x = easting - 500000.0
    y = northing - 10000000.0
    m = y / K0
    mu = m / (A * (1 - E2 / 4 - 3 * E2**2 / 64 - 5 * E2**3 / 256))
    phi1 = (
        mu
        + (3 * E1 / 2 - 27 * E1**3 / 32) * math.sin(2 * mu)
        + (21 * E1**2 / 16 - 55 * E1**4 / 32) * math.sin(4 * mu)
        + (151 * E1**3 / 96) * math.sin(6 * mu)
        + (1097 * E1**4 / 512) * math.sin(8 * mu)
    )
    sinp = math.sin(phi1)
    cosp = math.cos(phi1)
    tanp = math.tan(phi1)
    n1 = A / math.sqrt(1 - E2 * sinp * sinp)
    t1 = tanp * tanp
    c1 = E2P * cosp * cosp
    r1 = A * (1 - E2) / (1 - E2 * sinp * sinp) ** 1.5
    d = x / (n1 * K0)
    lat = phi1 - (n1 * tanp / r1) * (
        d * d / 2
        - (5 + 3 * t1 + 10 * c1 - 4 * c1 * c1 - 9 * E2P) * d**4 / 24
        + (61 + 90 * t1 + 298 * c1 + 45 * t1 * t1 - 252 * E2P - 3 * c1 * c1)
        * d**6
        / 720
    )
    lon = LON0 + (
        d
        - (1 + 2 * t1 + c1) * d**3 / 6
        + (5 - 2 * c1 + 28 * t1 - 3 * c1 * c1 + 8 * E2P + 24 * t1 * t1) * d**5 / 120
    ) / cosp
    return round(math.degrees(lon), 5), round(math.degrees(lat), 5)


def convert_line(coords):
    out = []
    prev = None
    for pt in coords:
        lng, lat = utm_to_ll(pt[0], pt[1])
        pair = [lng, lat]
        if pair != prev:
            out.append(pair)
            prev = pair
    if len(out) == 1:
        out.append(out[0][:])
    return out


BAIRRO_FIX = {
    "Sao Bento": "São Bento",
    "Vila São Jose": "Vila São José",
    "Vila Sao Luis": "Vila São Luís",
    "Centenario": "Centenário",
    "Parque Sarapui": "Parque Sarapuí",
}


def fix_bairro(v):
    if not v:
        return None
    return BAIRRO_FIX.get(v, v)


def fold_key(s: str) -> str:
    nfd = unicodedata.normalize("NFD", (s or "").lower().strip())
    stripped = "".join(c for c in nfd if unicodedata.category(c) != "Mn")
    return re.sub(r"\s+", " ", stripped)


def is_unnamed(name: str) -> bool:
    k = fold_key(name)
    return (not k) or k in {"sn", "s/n", "s.n.", "s n"} or k.startswith("sn ")


def street_gap_m(name: str) -> float:
    k = fold_key(name)
    if is_unnamed(name) or GENERIC_RE.match(k):
        return STREET_GAP_GENERIC
    if ARTERIAL_RE.match(k):
        return STREET_GAP_ARTERIAL
    return STREET_GAP_NAMED



def slug(name: str, extra: str) -> str:
    raw = f"{extra}|{name or 'sn'}"
    nfd = unicodedata.normalize("NFD", raw.lower())
    stripped = "".join(c for c in nfd if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9|]+", "-", stripped).strip("-")


def norm_rota(name: str) -> str:
    """Collapse casing typos in the day-block suffix (Seg A Sab, ter/Qui/Sab)."""
    s = (name or "").strip()
    s = re.sub(r"\bSeg\s+A\s+Sab\b", "Seg a Sab", s, flags=re.I)
    s = re.sub(r"\bter/qui/sab\b", "Ter/Qui/Sab", s, flags=re.I)
    s = re.sub(r"\bseg/qua/sex\b", "Seg/Qua/Sex", s, flags=re.I)
    s = re.sub(r"\bseg/qua/sext\b", "Seg/Qua/Sex", s, flags=re.I)
    return s


def load(path):
    print("load", os.path.basename(path), flush=True)
    with open(path) as f:
        return json.load(f)


def parts_bbox(parts):
    xs, ys = [], []
    for line in parts:
        for lng, lat in line:
            xs.append(lng)
            ys.append(lat)
    if not xs:
        return None
    return [min(xs), min(ys), max(xs), max(ys)]


def bbox_gap_m(b1, b2) -> float:
    if not b1 or not b2:
        return 1e12
    overlap_x = b1[2] >= b2[0] and b2[2] >= b1[0]
    overlap_y = b1[3] >= b2[1] and b2[3] >= b1[1]
    if overlap_x and overlap_y:
        return 0.0
    dx = 0.0 if overlap_x else min(abs(b1[0] - b2[2]), abs(b2[0] - b1[2]))
    dy = 0.0 if overlap_y else min(abs(b1[1] - b2[3]), abs(b2[1] - b1[3]))
    lat = (b1[1] + b1[3] + b2[1] + b2[3]) / 4
    mx = dx * 111320.0 * math.cos(math.radians(lat))
    my = dy * 110540.0
    return math.hypot(mx, my)


print("verify UTM", utm_to_ll(671573.931690902, 7479476.197936332))

val = load(os.path.join(SRC, "RotasValidadas_Linhas_Rep.geojson"))
cons = load(os.path.join(SRC, "Estatísticas_Trecho_Consolidado.geojson"))
faixa = load(
    os.path.join(SRC, "Estatísticas_Trecho_Faixa Modal_com corte de vel.geojson")
)

cons_by = {f["properties"]["id_trecho"]: f["properties"] for f in cons["features"]}
faixa_by = {f["properties"]["id_trecho"]: f["properties"] for f in faixa["features"]}

ST_CODE = {
    "Validado": "V",
    "Validado (Rua sem rota)": "VR",
    "Preenchido (ponte)": "P",
    "Baixo hit rate": "B",
}
ST_RANK = {"V": 4, "VR": 3, "B": 2, "P": 1, "O": 0, None: -1}

trechos: dict[int, dict] = {}
geom: dict[str, list] = {}
route_map: dict[str, dict] = {}  # canonical name -> meta
rota_alias: dict[str, str] = {}  # folded -> canonical


def canonical_rota(name: str | None) -> str | None:
    if not name:
        return None
    n = norm_rota(name)
    folded = fold_key(n)
    if folded in rota_alias:
        return rota_alias[folded]
    rota_alias[folded] = n
    return n


def ensure_route(rota: str, p: dict, bairro_fallback: str | None):
    if rota not in route_map:
        route_map[rota] = {
            "name": rota,
            "turno": p.get("Turno"),
            "dias": p.get("Dias_da_semana") or [],
            "bloco": p.get("Bloco"),
            "bairro": fix_bairro(p.get("Bairro_rotas") or bairro_fallback),
            "ids": [],
        }


def upsert_hit(tid: int, rota: str | None, hr, st: str | None):
    t = trechos[tid]
    if rota:
        existing = next((x for x in t["r"] if x.get("_n") == rota), None)
    else:
        existing = next((x for x in t["r"] if not x.get("_n")), None)
    if existing is None:
        t["r"].append({"_n": rota, "hr": hr, "st": st})
        return
    if existing.get("hr") is None and hr is not None:
        existing["hr"] = hr
        if ST_RANK.get(st, -1) >= ST_RANK.get(existing.get("st"), -1):
            existing["st"] = st
    elif hr is not None and existing.get("hr") is not None:
        if ST_RANK.get(st, -1) > ST_RANK.get(existing.get("st"), -1):
            existing["st"] = st
            existing["hr"] = hr


def ingest_geometry(g):
    parts = []
    if not g:
        return parts
    if g.get("type") == "MultiLineString":
        for line in g.get("coordinates") or []:
            conv = convert_line(line)
            if conv:
                parts.append(conv)
    elif g.get("type") == "LineString":
        conv = convert_line(g.get("coordinates") or [])
        if conv:
            parts.append(conv)
    return parts


for feat in val["features"]:
    p = feat["properties"]
    tid = int(p["id_trecho"])
    parts = ingest_geometry(feat.get("geometry"))
    name = p.get("Name") or "SN"
    # Street neighbourhood comes from the logradouro layer, never from the route.
    bairro = fix_bairro(p.get("Bairro_logradouros"))
    distrito = p.get("Distrito")
    ext = p.get("Extensao_m_2")
    if ext is not None:
        try:
            ext = round(float(ext), 1)
        except (TypeError, ValueError):
            ext = None

    if tid not in trechos:
        trechos[tid] = {
            "id": tid,
            "n": name,
            "b": bairro,
            "d": distrito,
            "e": ext,
            "r": [],
        }
        if parts:
            geom[str(tid)] = parts
    else:
        if parts and str(tid) not in geom:
            geom[str(tid)] = parts
        if trechos[tid]["b"] is None and bairro:
            trechos[tid]["b"] = bairro

    rota = canonical_rota(p.get("Rota"))
    if rota:
        ensure_route(rota, p, bairro)
        if tid not in route_map[rota]["ids"]:
            route_map[rota]["ids"].append(tid)
    hr = p.get("Hit_Rate")
    st = ST_CODE.get(p.get("Status"), None if p.get("Status") is None else "O")
    if rota or hr is not None or st:
        upsert_hit(tid, rota, hr, st)

# Hit rates for trechos that did not validate — identified by Name + id_trecho.
bloco_files = sorted(glob.glob(os.path.join(SRC, "Bloco_*_RuasSemRota_Atribuidas_linhas.geojson")))
n_bloco_hits = 0
n_bloco_skip = 0
for path in bloco_files:
    gj = load(path)
    for feat in gj["features"]:
        p = feat["properties"]
        tid_raw = p.get("id_trecho")
        name = p.get("Name")
        if tid_raw is None:
            n_bloco_skip += 1
            continue
        tid = int(tid_raw)
        t = trechos.get(tid)
        if t is None:
            n_bloco_skip += 1
            continue
        # Match on id_trecho; Name is a sanity check (accents/typos may differ).
        if name and fold_key(t["n"]) != fold_key(name):
            pass
        if t["b"] is None:
            b2 = fix_bairro(p.get("Bairro_logradouros"))
            if b2:
                t["b"] = b2
        rota = canonical_rota(p.get("Rota"))
        hr = p.get("Hit_Rate")
        st = ST_CODE.get(p.get("Status"), None if p.get("Status") is None else "O")
        if rota:
            ensure_route(rota, p, t.get("b"))
            if tid not in route_map[rota]["ids"]:
                route_map[rota]["ids"].append(tid)
            upsert_hit(tid, rota, hr, st)
        elif hr is not None or st:
            # Keep hit rate even when no neighbouring route was assigned.
            key = f"__bloco__|{p.get('Bloco') or ''}|{p.get('Turno') or ''}"
            upsert_hit(tid, key, hr, st)
        n_bloco_hits += 1

print("bloco join features", n_bloco_hits, "skipped", n_bloco_skip, "routes now", len(route_map))

# Assign route indices (stable: sorted by name)
routes = sorted(route_map.values(), key=lambda r: r["name"])
route_index = {r["name"]: i for i, r in enumerate(routes)}
for t in trechos.values():
    packed = []
    for item in t["r"]:
        name = item.get("_n")
        if name and name.startswith("__bloco__"):
            parts = name.split("|")
            packed.append(
                {
                    "i": None,
                    "hr": item["hr"],
                    "st": item["st"],
                    "bl": parts[1] or None if len(parts) > 1 else None,
                    "tu": parts[2] or None if len(parts) > 2 else None,
                }
            )
            continue
        packed.append(
            {
                "i": route_index[name] if name in route_index else None,
                "hr": item["hr"],
                "st": item["st"],
            }
        )
    t["r"] = packed

# Stats join
all_dates: set[str] = set()
idx_hora: dict[str, list[int]] = defaultdict(list)
idx_placa: dict[str, list[int]] = defaultdict(list)
placas_count: dict[str, int] = defaultdict(int)

PLATE_RE = re.compile(r"([A-Z]{3}\d[A-Z]\d{2}|[A-Z]{3}\d{4})")


def parse_top3(s):
    if not s:
        return []
    out = []
    for chunk in s.split(";"):
        chunk = chunk.strip()
        if not chunk:
            continue
        m = re.match(r"(.+?)\((\d+)\)\s*$", chunk)
        if m:
            out.append({"k": m.group(1).strip(), "n": int(m.group(2))})
        else:
            out.append({"k": chunk, "n": None})
    return out


for tid, t in trechos.items():
    c = cons_by.get(tid)
    f = faixa_by.get(tid)
    if c:
        dias = []
        if c.get("dias_obs"):
            dias = [d.strip() for d in str(c["dias_obs"]).split(",") if d.strip()]
            all_dates.update(dias)
        placa = c.get("placa_modal")
        if placa:
            idx_placa[placa].append(tid)
            placas_count[placa] += 1
        t["s"] = {
            "np": c.get("n_passagens"),
            "pl": placa,
            "pp": c.get("pct_modal"),
            "pt": parse_top3(c.get("placas_top3")),
            "fx": c.get("faixa_modal"),
            "nfx": c.get("n_faixa_modal"),
            "vm": c.get("vel_media"),
            "vd": c.get("vel_mediana"),
            "v75": c.get("vel_p75"),
            "va": c.get("pct_vel_alta"),
            "dias": dias,
            "nd": c.get("n_dias_obs"),
            "dow": (c.get("dow_obs") or "").split(",") if c.get("dow_obs") else [],
        }
        for item in t["s"]["pt"]:
            k = item["k"]
            if PLATE_RE.fullmatch(k):
                placas_count.setdefault(k, placas_count.get(k, 0))
    if f:
        modal = f.get("faixa_modal")
        if modal:
            idx_hora[modal].append(tid)
        t["h"] = {
            "nl": f.get("n_passagens_limpas"),
            "fx": modal,
            "pct": f.get("pct_faixa_modal"),
            "t3": parse_top3(f.get("top3_faixas")),
            "fd": f.get("faixa_modal_dow"),
            "pd": f.get("pct_faixa_modal_dow"),
            "t3d": parse_top3(f.get("top3_faixas_dow")),
            "dow": {
                k: f.get(f"faixa_modal_{k}")
                for k in ("seg", "ter", "qua", "qui", "sex", "sab", "dom")
                if f.get(f"faixa_modal_{k}")
            },
        }


class UnionFind:
    def __init__(self, items):
        self.p = {i: i for i in items}

    def find(self, x):
        while self.p[x] != x:
            self.p[x] = self.p[self.p[x]]
            x = self.p[x]
        return x

    def union(self, a, b):
        ra, rb = self.find(a), self.find(b)
        if ra != rb:
            self.p[rb] = ra


# Cluster logradouros: same name + geographically connected = one street.
# Distant homonyms (ex.: Rua da Paz no Bar dos Cavalheiros vs. em São Bento) stay split.
# SN / sem nome stays per neighbourhood so unnamed alleys are not fused city-wide.
by_name: dict[str, list[int]] = defaultdict(list)
unnamed_by_bairro: dict[str, list[int]] = defaultdict(list)
for tid, t in trechos.items():
    if is_unnamed(t["n"]):
        unnamed_by_bairro[t["b"] or "sem-bairro"].append(tid)
    else:
        by_name[fold_key(t["n"])].append(tid)

tid_bbox = {tid: parts_bbox(geom.get(str(tid)) or []) for tid in trechos}

street_clusters: list[dict] = []


def emit_cluster(name: str, ids: list[int], force_bairro: str | None = None):
    ids = sorted(set(ids))
    bairros = []
    seen_b = set()
    distrito = None
    counts: dict[str, int] = defaultdict(int)
    for tid in ids:
        b = trechos[tid]["b"]
        if b:
            counts[b] += 1
            if b not in seen_b:
                seen_b.add(b)
                bairros.append(b)
        if distrito is None:
            distrito = trechos[tid]["d"]
    bairros.sort(key=lambda b: (-counts[b], b))
    primary = force_bairro if force_bairro and force_bairro != "sem-bairro" else (bairros[0] if bairros else None)
    extra = primary or (force_bairro or "sem-bairro")
    # disambiguate homonyms of the same name with a short cluster tag
    sid = slug(name, extra)
    street_clusters.append(
        {
            "id": sid,
            "name": name,
            "bairro": primary,
            "bairros": bairros,
            "distrito": distrito,
            "ids": ids,
        }
    )


for key, ids in by_name.items():
    uf = UnionFind(ids)
    n = len(ids)
    display_tmp = trechos[ids[0]]["n"]
    gap = street_gap_m(display_tmp)
    for i in range(n):
        bi = tid_bbox[ids[i]]
        for j in range(i + 1, n):
            if bbox_gap_m(bi, tid_bbox[ids[j]]) <= gap:
                uf.union(ids[i], ids[j])
    groups: dict[int, list[int]] = defaultdict(list)
    for tid in ids:
        groups[uf.find(tid)].append(tid)
    display = trechos[ids[0]]["n"]
    # prefer the most frequent original spelling
    spell: dict[str, int] = defaultdict(int)
    for tid in ids:
        spell[trechos[tid]["n"]] += 1
    display = max(spell.items(), key=lambda kv: kv[1])[0]
    ordered = sorted(groups.values(), key=lambda g: -len(g))
    used_ids: set[str] = set()
    for g in ordered:
        bairros_g = sorted({trechos[tid]["b"] for tid in g if trechos[tid]["b"]})
        extra = bairros_g[0] if len(bairros_g) == 1 else (bairros_g[0] if bairros_g else "sem-bairro")
        if len(ordered) > 1 and len(bairros_g) > 1:
            extra = f"{extra}-{len(g)}"
        sid = slug(display, extra)
        # unique id if two clusters share the same primary bairro
        base = sid
        k = 2
        while sid in used_ids:
            sid = f"{base}-{k}"
            k += 1
        used_ids.add(sid)
        bairros = []
        seen_b = set()
        counts: dict[str, int] = defaultdict(int)
        distrito = None
        for tid in sorted(g):
            b = trechos[tid]["b"]
            if b:
                counts[b] += 1
                if b not in seen_b:
                    seen_b.add(b)
                    bairros.append(b)
            if distrito is None:
                distrito = trechos[tid]["d"]
        bairros.sort(key=lambda b: (-counts[b], b))
        street_clusters.append(
            {
                "id": sid,
                "name": display,
                "bairro": bairros[0] if bairros else None,
                "bairros": bairros,
                "distrito": distrito,
                "ids": sorted(g),
            }
        )

for bairro_key, ids in unnamed_by_bairro.items():
    display = trechos[ids[0]]["n"] if ids else "SN"
    emit_cluster(display, ids, force_bairro=bairro_key if bairro_key != "sem-bairro" else None)

# Street bboxes
streets = []
used = set()
for s in street_clusters:
    if s["id"] in used:
        s["id"] = s["id"] + "-x"
    used.add(s["id"])
    xs, ys = [], []
    km = 0.0
    for tid in s["ids"]:
        parts = geom.get(str(tid)) or []
        bb = parts_bbox(parts)
        if bb:
            xs.extend([bb[0], bb[2]])
            ys.extend([bb[1], bb[3]])
        e = trechos[tid].get("e") or 0
        km += float(e)
    s["bbox"] = [min(xs), min(ys), max(xs), max(ys)] if xs else None
    s["n"] = len(s["ids"])
    s["km"] = round(km / 1000, 3)
    streets.append(s)

streets.sort(key=lambda s: ((s["name"] or "").lower(), s["bairro"] or ""))

# Route bboxes + km
for r in routes:
    xs, ys = [], []
    km = 0.0
    for tid in r["ids"]:
        parts = geom.get(str(tid)) or []
        bb = parts_bbox(parts)
        if bb:
            xs.extend([bb[0], bb[2]])
            ys.extend([bb[1], bb[3]])
        e = trechos[tid].get("e") or 0
        km += float(e)
    r["bbox"] = [min(xs), min(ys), max(xs), max(ys)] if xs else None
    r["n"] = len(r["ids"])
    r["km"] = round(km / 1000, 3)

all_xs, all_ys = [], []
km_rede = 0.0
km_gps = 0.0
n_val = 0
n_hr = 0
for tid, t in trechos.items():
    e = float(t.get("e") or 0)
    km_rede += e
    if "s" in t:
        km_gps += e
    if any(x.get("st") in ("V", "VR") for x in t["r"]):
        n_val += 1
    if any(x.get("hr") is not None for x in t["r"]):
        n_hr += 1
    parts = geom.get(str(tid)) or []
    bb = parts_bbox(parts)
    if bb:
        all_xs.extend([bb[0], bb[2]])
        all_ys.extend([bb[1], bb[3]])

dates = sorted(all_dates)
bairros = sorted({b for s in streets for b in (s["bairros"] or ([s["bairro"]] if s["bairro"] else [])) if b})
placas = sorted(placas_count.keys())


def hour_key(s):
    try:
        return int(s.split(":")[0])
    except Exception:
        return 99


faixas_hora = sorted(idx_hora.keys(), key=hour_key)

catalog = {
    "lote": "I",
    "periodo": {"inicio": dates[0] if dates else None, "fim": dates[-1] if dates else None},
    "limiarHitRate": 66.67,
    "bbox": [min(all_xs), min(all_ys), max(all_xs), max(all_ys)] if all_xs else None,
    "resumo": {
        "nTrechos": len(trechos),
        "nTrechosGps": sum(1 for t in trechos.values() if "s" in t),
        "nTrechosValidados": n_val,
        "nTrechosHitRate": n_hr,
        "nRuas": len(streets),
        "nRotas": len(routes),
        "nBairros": len(bairros),
        "nPlacas": len(placas),
        "kmRede": round(km_rede / 1000, 2),
        "kmComGps": round(km_gps / 1000, 2),
    },
    "bairros": bairros,
    "turnos": ["Madrugada", "Manhã", "Tarde", "Noite"],
    "placas": [{"placa": p, "n": placas_count[p]} for p in sorted(placas, key=lambda x: (-placas_count[x], x))],
    "faixasHora": faixas_hora,
    "dias": dates,
    "idxHora": {k: v for k, v in idx_hora.items()},
    "idxPlaca": {k: v for k, v in idx_placa.items()},
}

catalog_routes = [
    {
        "name": r["name"],
        "turno": r["turno"],
        "dias": r["dias"],
        "bloco": r["bloco"],
        "bairro": r["bairro"],
        "ids": r["ids"],
        "bbox": r["bbox"],
        "n": r["n"],
        "km": r["km"],
    }
    for r in routes
]

streets_out = [
    {
        "id": s["id"],
        "name": s["name"],
        "bairro": s["bairro"],
        "bairros": s["bairros"],
        "distrito": s["distrito"],
        "ids": s["ids"],
        "bbox": s["bbox"],
        "n": s["n"],
        "km": s["km"],
    }
    for s in streets
]

trechos_out = {str(k): v for k, v in trechos.items()}


def dump(name, obj):
    path = os.path.join(OUT, name)
    with open(path, "w") as f:
        json.dump(obj, f, ensure_ascii=False, separators=(",", ":"))
    print(name, round(os.path.getsize(path) / 1024, 1), "KB")


dump("catalog.json", catalog)
dump("streets.json", streets_out)
dump("routes.json", catalog_routes)
dump("trechos.json", trechos_out)
dump("geom.json", geom)
print("bbox", catalog["bbox"])
print("resumo", catalog["resumo"])
print("bairros", bairros)

# sanity: Brigadeiro + Rua da Paz
for needle in ("Avenida Brigadeiro Lima e Silva", "Rua da Paz", "Avenida Governador Leonel de Moura Brizola"):
    hits = [s for s in streets if s["name"] == needle]
    print(needle, "→", len(hits), "resultado(s)")
    for s in hits:
        print("  ", s["id"], s["bairros"], "n=", s["n"], "km=", s["km"])

print("done")
