import { CalendarDays, Gauge, Info, Route as RouteIcon, Truck, X } from "lucide-react";
import { useData } from "@/components/data-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getTrecho } from "@/lib/data";
import { useApp } from "@/lib/store";
import type { RouteHit, Trecho } from "@/lib/types";
import {
  formatDatePt,
  formatDias,
  fmtKm,
  fmtNum,
  fmtPct,
  labelDow,
  nextDayIso,
} from "@/lib/utils";

const ST_LABEL: Record<string, string> = {
  V: "Validado",
  VR: "Validado (rua sem rota)",
  P: "Preenchido (ponte)",
  B: "Baixo hit rate",
  O: "Outro",
};

export function DetailPanel() {
  const data = useData();
  const streetId = useApp((s) => s.streetId);
  const trechoId = useApp((s) => s.trechoId);
  const routeIndex = useApp((s) => s.routeIndex);
  const showAttendance = useApp((s) => s.showAttendance);
  const attendanceDate = useApp((s) => s.attendanceDate);
  const statsKind = useApp((s) => s.statsKind);
  const selectedHour = useApp((s) => s.selectedHour);
  const selectedPlate = useApp((s) => s.selectedPlate);
  const resetSelection = useApp((s) => s.resetSelection);
  const selectTrecho = useApp((s) => s.selectTrecho);
  const selectRoute = useApp((s) => s.selectRoute);
  const setAttendance = useApp((s) => s.setAttendance);
  const selectStreet = useApp((s) => s.selectStreet);

  const street = streetId ? data.streets.find((s) => s.id === streetId) : undefined;
  const trecho = trechoId != null ? getTrecho(data, trechoId) : undefined;
  const route = routeIndex != null ? data.routes[routeIndex] : undefined;
  const waitingTrecho = trechoId != null && !trecho && !data.trechosReady;

  const open =
    Boolean(street || trecho || route || (statsKind && (selectedHour || selectedPlate)));
  if (!open) return null;

  const title = route
    ? route.name
    : trecho
      ? displayName(trecho.n)
      : street
        ? displayName(street.name)
        : statsKind === "hora"
          ? `Faixa ${selectedHour}`
          : `Veículo ${selectedPlate}`;

  return (
    <aside className="pointer-events-auto flex max-h-[52vh] w-full flex-col rounded-t-xl border border-border bg-card shadow-lg md:max-h-none md:h-full md:w-[min(100%,26rem)] md:rounded-none md:border-y-0 md:border-r-0 md:shadow-none">
      <div className="flex items-start gap-3 border-b border-border px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {route
              ? "Itinerário da rota"
              : trecho
                ? "Trecho selecionado"
                : street
                  ? "Logradouro"
                  : "Recorte estatístico"}
          </p>
          <h2 className="font-display text-lg leading-snug tracking-tight">{title}</h2>
          <p className="text-xs text-muted-foreground">
            {trecho?.b ??
              (street?.bairros?.length ? street.bairros.join(" · ") : street?.bairro) ??
              route?.bairro ??
              "Lote I"}
            {trecho?.d ? ` · ${trecho.d} distrito` : ""}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Fechar painel"
          onClick={() => {
            if (route) selectRoute(null);
            else if (trecho) selectTrecho(null);
            else resetSelection();
          }}
        >
          <X />
        </Button>
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-5 px-4 py-4">
          {waitingTrecho ? (
            <p className="text-sm text-muted-foreground">Carregando atributos do trecho…</p>
          ) : null}

          {route ? (
            <RouteSummary
              turno={route.turno}
              dias={route.dias}
              n={route.n}
              km={route.km}
              onBack={() => selectRoute(null)}
            />
          ) : null}

          {street && !trecho && !route ? (
            <StreetPrompt
              streetName={street.name}
              n={street.n}
              ids={street.ids}
              bairros={street.bairros ?? (street.bairro ? [street.bairro] : [])}
            />
          ) : null}

          {trecho && !route ? (
            <TrechoBody
              trecho={trecho}
              limiar={data.catalog.limiarHitRate}
              routes={data.routes}
              dates={data.catalog.dias}
              showAttendance={showAttendance}
              attendanceDate={attendanceDate}
              onRoute={(i) => selectRoute(i)}
              onAttendance={(open, date) => setAttendance(open, date)}
              onStreet={() => {
                const sid = data.streetByTid[trecho.id];
                if (sid) selectStreet(sid);
              }}
            />
          ) : null}

          {statsKind && !trecho && !route ? (
            <StatsHint kind={statsKind} hour={selectedHour} plate={selectedPlate} />
          ) : null}
        </div>
      </ScrollArea>
    </aside>
  );
}

function displayName(n: string) {
  if (n === "SN" || n.startsWith("SN ")) return n === "SN" ? "Sem nome cadastrado" : n;
  return n;
}

function StreetPrompt({
  streetName,
  n,
  ids,
  bairros,
}: {
  streetName: string;
  n: number;
  ids: number[];
  bairros: string[];
}) {
  const data = useData();
  const selectTrecho = useApp((s) => s.selectTrecho);
  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-border bg-muted/60 p-3">
        <p className="text-sm leading-relaxed">
          {displayName(streetName)} está em destaque ({n} trechos, quebrados a cada
          esquina
          {bairros.length > 1 ? ` · ${bairros.join(", ")}` : ""}). Toque no mapa ou
          escolha um trecho abaixo.
        </p>
      </div>
      <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border">
        {ids.map((id) => {
          const t = data.trechos[String(id)];
          const hr = t?.r.map((x) => x.hr).filter((x): x is number => x != null);
          const best = hr && hr.length ? Math.max(...hr) : null;
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => selectTrecho(id)}
                className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm hover:bg-muted"
              >
                <span>
                  Trecho {id}
                  {t?.e != null ? (
                    <span className="text-muted-foreground"> · {fmtKm(t.e)}</span>
                  ) : null}
                </span>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {best == null ? "s/ hit rate" : fmtPct(best)}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function RouteSummary({
  turno,
  dias,
  n,
  km,
  onBack,
}: {
  turno: string | null;
  dias: string[];
  n: number;
  km: number;
  onBack: () => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {turno ? <Badge>{turno}</Badge> : null}
        <Badge variant="outline">{formatDias(dias)}</Badge>
      </div>
      <p className="text-sm text-muted-foreground">
        {n} trechos · {km.toFixed(2).replace(".", ",")} km de eixo. O traçado no mapa é a
        malha validada (eixo do logradouro), não o buffer de 5 m usado na análise espacial.
      </p>
      <Button variant="outline" size="sm" onClick={onBack}>
        Voltar ao trecho
      </Button>
    </div>
  );
}

function StatsHint({
  kind,
  hour,
  plate,
}: {
  kind: "hora" | "veiculo";
  hour: string | null;
  plate: string | null;
}) {
  return (
    <p className="text-sm leading-relaxed text-muted-foreground">
      {kind === "hora"
        ? `Faixa horária modal ${hour} nos trechos em destaque. Clique em um trecho para as demais faixas, inclusive por dia da semana.`
        : `Compactador modal ${plate} nos trechos em destaque. Clique em um trecho para o ranking de placas e as velocidades observadas.`}
    </p>
  );
}

function TrechoBody({
  trecho,
  limiar,
  routes,
  dates,
  showAttendance,
  attendanceDate,
  onRoute,
  onAttendance,
  onStreet,
}: {
  trecho: Trecho;
  limiar: number;
  routes: { name: string; turno: string | null; dias: string[]; bloco: string | null }[];
  dates: string[];
  showAttendance: boolean;
  attendanceDate: string | null;
  onRoute: (i: number) => void;
  onAttendance: (open: boolean, date?: string | null) => void;
  onStreet: () => void;
}) {
  return (
    <>
      <dl className="grid grid-cols-2 gap-3 text-sm">
        <Stat label="Extensão" value={fmtKm(trecho.e)} />
        <Stat label="id_trecho" value={String(trecho.id)} />
      </dl>

      <section>
        <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
          <RouteIcon className="size-4" /> Rotas neste trecho
        </h3>
        {trecho.r.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Sem rota atribuída neste arquivo de validação. Pode ser lacuna, área militar ou
            logradouro ainda sem casamento com a lista da operadora.
          </p>
        ) : (
          <ul className="space-y-2">
            {trecho.r.map((hit, idx) => (
              <RouteRow
                key={`${hit.i ?? "x"}-${hit.bl ?? ""}-${hit.tu ?? ""}-${idx}`}
                hit={hit}
                route={hit.i != null ? routes[hit.i] : undefined}
                limiar={limiar}
                onOpen={() => {
                  if (hit.i != null) onRoute(hit.i);
                }}
              />
            ))}
          </ul>
        )}
        <p className="mt-2 flex gap-1.5 text-[11px] leading-relaxed text-muted-foreground">
          <Info className="mt-0.5 size-3.5 shrink-0" />
          Hit rate ≥ {fmtPct(limiar, 1)} é o percentual suficiente para validação GPS do
          trecho no bloco de dias. Não leia 66,7% como atendimento baixo.
        </p>
      </section>

      {trecho.s ? (
        <section>
          <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
            <Truck className="size-4" /> Passagens GPS
          </h3>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <Stat label="Passagens" value={String(trecho.s.np ?? "—")} />
            <Stat label="Dias com GPS" value={String(trecho.s.dias.length)} />
            <Stat label="Placa modal" value={trecho.s.pl ?? "—"} />
            <Stat label="Concentração" value={fmtPct(trecho.s.pp)} />
            <Stat label="Faixa modal (30 min)" value={trecho.s.fx ?? "—"} />
            <Stat label="Nessa faixa" value={String(trecho.s.nfx ?? "—")} />
          </dl>
          {trecho.s.pt.length > 0 ? (
            <p className="mt-2 text-xs text-muted-foreground">
              Top placas: {trecho.s.pt.map((p) => `${p.k} (${p.n})`).join(" · ")}
            </p>
          ) : null}
        </section>
      ) : (
        <p className="text-sm text-muted-foreground">
          Sem estatística de passagem neste trecho no recorte consolidado.
        </p>
      )}

      {trecho.s ? (
        <section>
          <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
            <Gauge className="size-4" /> Velocidade (km/h)
          </h3>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <Stat label="Média" value={fmtNum(trecho.s.vm)} />
            <Stat label="Mediana" value={fmtNum(trecho.s.vd)} />
            <Stat label="P75" value={fmtNum(trecho.s.v75)} />
            <Stat label="% vel. alta" value={fmtPct(trecho.s.va)} />
          </dl>
          <p className="mt-2 text-[11px] text-muted-foreground">
            A faixa modal horária abaixo já aplica o corte de velocidade de trânsito
            (passagens “limpas”), para não misturar deslocamento de transferência com coleta.
          </p>
        </section>
      ) : null}

      {trecho.h ? (
        <section>
          <h3 className="mb-2 text-sm font-semibold">Faixas horárias</h3>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <Stat label="Modal (1 h)" value={trecho.h.fx ?? "—"} />
            <Stat label="Participação" value={fmtPct(trecho.h.pct)} />
            <Stat label="Passagens limpas" value={String(trecho.h.nl ?? "—")} />
            <Stat label="Modal × dia" value={trecho.h.fd ?? "—"} />
          </dl>
          {trecho.h.t3.length > 0 ? (
            <ol className="mt-2 space-y-1 text-xs">
              {trecho.h.t3.map((item) => (
                <li key={item.k} className="flex justify-between gap-2">
                  <span>{item.k}</span>
                  <span className="tabular-nums text-muted-foreground">{item.n}</span>
                </li>
              ))}
            </ol>
          ) : null}
          {Object.keys(trecho.h.dow).length > 0 ? (
            <ul className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
              {Object.entries(trecho.h.dow).map(([d, fx]) => (
                <li key={d} className="flex justify-between gap-2">
                  <span className="text-muted-foreground">{labelDow(d)}</span>
                  <span className="tabular-nums">{fx}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ) : null}

      <Separator />

      <section>
        <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
          <CalendarDays className="size-4" /> Atendimento por dia
        </h3>
        {!showAttendance ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const first = trecho.s?.dias?.[0];
              const iso = first != null ? dates[first] : (dates[0] ?? null);
              onAttendance(true, iso);
            }}
          >
            Ver dados de atendimento por dia
          </Button>
        ) : trecho.s ? (
          <AttendanceBlock
            dates={dates}
            observed={trecho.s.dias}
            selected={attendanceDate}
            onSelect={(d) => onAttendance(true, d)}
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            Este trecho não entra no consolidado de GPS, então não há calendário de passagem.
          </p>
        )}
      </section>

      <button
        type="button"
        onClick={onStreet}
        className="text-left text-xs text-primary underline-offset-4 hover:underline"
      >
        Ver todos os trechos desta rua
      </button>
    </>
  );
}

function RouteRow({
  hit,
  route,
  limiar,
  onOpen,
}: {
  hit: RouteHit;
  route: { name: string; turno: string | null; dias: string[] } | undefined;
  limiar: number;
  onOpen: () => void;
}) {
  const validated = hit.st === "V" || hit.st === "VR";
  const baixo = hit.st === "B";
  const title = route?.name
    ?? (hit.st === "VR" || hit.i == null
      ? "Nenhuma rota próxima neste bloco"
      : "Rota não identificada");
  const turno = route?.turno ?? hit.tu ?? null;
  return (
    <li className="rounded-lg border border-border p-3">
      {route ? (
        <button
          type="button"
          onClick={onOpen}
          className="text-left text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          {title}
        </button>
      ) : (
        <p className="text-sm font-medium">{title}</p>
      )}
      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
        {turno ? <Badge variant="secondary">{turno}</Badge> : null}
        {route ? <Badge variant="outline">{formatDias(route.dias)}</Badge> : null}
        {hit.bl && !route ? (
          <Badge variant="outline">{labelBloco(hit.bl)}</Badge>
        ) : null}
        {hit.hr == null ? (
          <Badge variant={hit.st === "P" ? "ponte" : "muted"}>
            {hit.st === "P" ? "Ponte · sem hit rate" : "Sem hit rate"}
          </Badge>
        ) : (
          <Badge
            variant={
              baixo ? "baixo" : validated || hit.hr >= limiar ? "valid" : "muted"
            }
          >
            {fmtPct(hit.hr)} {ST_LABEL[hit.st ?? ""] ?? ""}
          </Badge>
        )}
      </div>
    </li>
  );
}

function labelBloco(bloco: string): string {
  if (bloco === "Seg_a_Sab") return "Seg a sáb";
  if (bloco === "Seg_Qua_Sex") return "Seg / Qua / Sex";
  if (bloco === "Ter_Qui_Sab") return "Ter / Qui / Sáb";
  if (bloco === "Domingo") return "Domingo";
  return bloco.replaceAll("_", " ");
}

function AttendanceBlock({
  dates,
  observed,
  selected,
  onSelect,
}: {
  dates: string[];
  observed: number[];
  selected: string | null;
  onSelect: (iso: string) => void;
}) {
  const set = new Set(observed);
  const iso = selected ?? dates[0];
  const idx = dates.indexOf(iso);
  const hit = idx >= 0 && set.has(idx);
  const next = iso ? nextDayIso(iso) : "";
  return (
    <div className="space-y-3">
      <label className="block text-xs font-medium text-muted-foreground">
        Dia operacional
        <select
          className="mt-1 block h-11 w-full rounded-md border border-border bg-card px-3 text-sm text-foreground"
          value={iso ?? ""}
          onChange={(e) => onSelect(e.target.value)}
        >
          {dates.map((d) => (
            <option key={d} value={d}>
              {formatDatePt(d)}
            </option>
          ))}
        </select>
      </label>
      <div
        className={
          hit
            ? "rounded-lg border border-valid/30 bg-valid/10 px-3 py-2 text-sm text-valid"
            : "rounded-lg border border-border bg-muted px-3 py-2 text-sm text-muted-foreground"
        }
      >
        {hit
          ? "Passagem do compactador registrada neste trecho."
          : "Sem passagem consolidada neste trecho nesse dia."}
      </div>
      {iso ? (
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          No setor, o dia começa às 6h e termina às 5h59 do dia seguinte. {formatDatePt(iso)}{" "}
          cobre de 6h00 até 5h59 de {formatDatePt(next)}. As datas abaixo vêm do consolidado
          GPS (não das camadas diárias de rotas associadas, que não acompanham este recorte).
        </p>
      ) : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="font-medium tabular-nums">{value}</dd>
    </div>
  );
}
