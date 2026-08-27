import { Clock, Truck } from "lucide-react";
import { useData } from "@/components/data-provider";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/store";
import { cn, fmtKmDirect } from "@/lib/utils";

export function StatsControls() {
  const data = useData();
  const statsKind = useApp((s) => s.statsKind);
  const selectedHour = useApp((s) => s.selectedHour);
  const selectedPlate = useApp((s) => s.selectedPlate);
  const setStats = useApp((s) => s.setStats);
  const selectTrecho = useApp((s) => s.selectTrecho);

  const ids =
    statsKind === "hora" && selectedHour
      ? (data.catalog.idxHora[selectedHour] ?? [])
      : statsKind === "veiculo" && selectedPlate
        ? (data.catalog.idxPlaca[selectedPlate] ?? [])
        : [];
  let km = 0;
  for (const id of ids) {
    km += (data.trechos[String(id)]?.e ?? 0) / 1000;
  }

  return (
    <div className="pointer-events-auto w-[min(100%,24rem)] rounded-xl border border-border bg-card/95 p-3 shadow-md backdrop-blur-sm">
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        Recorte estatístico
      </p>
      <div className="mt-2 grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
        <Button
          type="button"
          size="sm"
          variant={statsKind === "hora" ? "default" : "ghost"}
          className="h-10"
          onClick={() => {
            selectTrecho(null);
            setStats("hora", data.catalog.faixasHora[6] ?? data.catalog.faixasHora[0]);
          }}
        >
          <Clock className="size-4" /> Faixas
        </Button>
        <Button
          type="button"
          size="sm"
          variant={statsKind === "veiculo" ? "default" : "ghost"}
          className="h-10"
          onClick={() => {
            selectTrecho(null);
            setStats("veiculo", data.catalog.placas[0]?.placa ?? null);
          }}
        >
          <Truck className="size-4" /> Veículos
        </Button>
      </div>

      {statsKind === "hora" ? (
        <div className="mt-3">
          <label className="text-xs font-medium text-muted-foreground">Faixa horária modal</label>
          <select
            className="mt-1 block h-11 w-full rounded-md border border-border bg-card px-3 text-sm"
            value={selectedHour ?? ""}
            onChange={(e) => {
              selectTrecho(null);
              setStats("hora", e.target.value);
            }}
          >
            {data.catalog.faixasHora.map((fx) => (
              <option key={fx} value={fx}>
                {fx}
              </option>
            ))}
          </select>
          <p className="mt-2 text-sm leading-relaxed">
            Faixa horária modal nos seguintes trechos
            {ids.length ? (
              <span className="text-muted-foreground">
                {" "}
                — {ids.length} trechos · {fmtKmDirect(km)}
              </span>
            ) : null}
          </p>
        </div>
      ) : null}

      {statsKind === "veiculo" ? (
        <div className="mt-3">
          <label className="text-xs font-medium text-muted-foreground">
            Placa do compactador modal
          </label>
          <select
            className="mt-1 block h-11 w-full rounded-md border border-border bg-card px-3 text-sm"
            value={selectedPlate ?? ""}
            onChange={(e) => {
              selectTrecho(null);
              setStats("veiculo", e.target.value);
            }}
          >
            {data.catalog.placas.map((p) => (
              <option key={p.placa} value={p.placa}>
                {p.placa} ({p.n} trechos)
              </option>
            ))}
          </select>
          <p className="mt-2 text-sm leading-relaxed">
            Veículo compactador mais frequente nos seguintes trechos
            {ids.length ? (
              <span className="text-muted-foreground">
                {" "}
                — {ids.length} trechos · {fmtKmDirect(km)}
              </span>
            ) : null}
          </p>
        </div>
      ) : null}

      {!statsKind ? (
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Escolha faixas horárias ou veículos. O mapa mostra só os trechos em que aquele valor
          é o modal — o mais frequente no consolidado GPS, com corte de velocidade nas faixas.
        </p>
      ) : null}

      {ids.length > 0 ? <MiniList ids={ids} /> : null}
    </div>
  );
}

function MiniList({ ids }: { ids: number[] }) {
  const data = useData();
  const selectTrecho = useApp((s) => s.selectTrecho);
  const trechoId = useApp((s) => s.trechoId);
  const sample = ids.slice(0, 8);
  return (
    <ul className="mt-2 max-h-36 overflow-auto rounded-md border border-border">
      {sample.map((id) => {
        const t = data.trechos[String(id)];
        if (!t) return null;
        return (
          <li key={id}>
            <button
              type="button"
              onClick={() => selectTrecho(id)}
              className={cn(
                "flex w-full flex-col items-start px-3 py-2 text-left text-xs hover:bg-muted",
                trechoId === id && "bg-primary/10",
              )}
            >
              <span className="font-medium">{t.n === "SN" ? "Sem nome" : t.n}</span>
              <span className="text-muted-foreground">{t.b}</span>
            </button>
          </li>
        );
      })}
      {ids.length > 8 ? (
        <li className="px-3 py-2 text-[11px] text-muted-foreground">
          + {ids.length - 8} trechos no mapa
        </li>
      ) : null}
    </ul>
  );
}
