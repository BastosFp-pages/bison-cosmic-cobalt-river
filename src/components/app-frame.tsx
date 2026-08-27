import type { ReactNode } from "react";
import { AppHeader } from "@/components/app-header";
import { DetailPanel } from "@/components/detail-panel";
import { MapLegend } from "@/components/map-legend";
import { MapView } from "@/components/map-view";
import { useData } from "@/components/data-provider";
import { fmtKmDirect } from "@/lib/utils";

export function AppFrame({
  current,
  overlay,
  footer,
}: {
  current: "mapa" | "estatisticas";
  overlay: ReactNode;
  footer?: ReactNode;
}) {
  const { catalog } = useData();
  const r = catalog.resumo;
  return (
    <div className="flex h-dvh flex-col bg-background text-foreground">
      <AppHeader current={current} />
      <div className="relative flex min-h-0 flex-1 flex-col md:flex-row">
        <div className="relative z-0 min-h-0 flex-1 isolate">
          <MapView />
          <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-3 md:p-4">
            <div>{overlay}</div>
            <div className="flex items-end justify-between gap-3 pb-7">
              <div className="pointer-events-auto max-w-[min(100%,22rem)] rounded-md border border-border bg-card/92 px-2.5 py-1.5 text-[11px] leading-snug text-muted-foreground shadow-sm backdrop-blur-sm">
                Lote I · {r.nRuas} logradouros · {r.nTrechos} trechos · {fmtKmDirect(r.kmRede)} ·{" "}
                {r.nRotas} rotas
                {catalog.periodo.inicio
                  ? ` · GPS ${catalog.periodo.inicio.slice(8)}/${catalog.periodo.inicio.slice(5, 7)}–${catalog.periodo.fim?.slice(8)}/${catalog.periodo.fim?.slice(5, 7)}/${catalog.periodo.fim?.slice(0, 4)}`
                  : ""}
              </div>
              <MapLegend />
            </div>
          </div>
        </div>
        <DetailPanel />
      </div>
      {footer}
    </div>
  );
}
