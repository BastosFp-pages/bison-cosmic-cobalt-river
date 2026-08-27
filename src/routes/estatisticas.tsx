import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppFrame } from "@/components/app-frame";
import { StatsControls } from "@/components/stats-controls";
import { useData } from "@/components/data-provider";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/estatisticas")({ component: Estatisticas });

function Estatisticas() {
  const { catalog } = useData();
  const r = catalog.resumo;
  useEffect(() => {
    useApp.setState({
      streetId: null,
      trechoId: null,
      routeIndex: null,
      showAttendance: false,
    });
  }, []);
  return (
    <AppFrame
      current="estatisticas"
      overlay={
        <div className="space-y-2">
          <StatsControls />
          <div className="pointer-events-auto hidden max-w-[24rem] rounded-xl border border-border bg-card/90 p-3 text-xs leading-relaxed text-muted-foreground shadow-sm backdrop-blur-sm md:block">
            {r.nTrechosGps} trechos com GPS ({r.kmComGps.toFixed(1).replace(".", ",")} km) em{" "}
            {r.nPlacas} compactadores. A faixa horária usa passagens com corte de velocidade;
            a placa modal é a mais frequente no consolidado, sem esse corte.
          </div>
        </div>
      }
    />
  );
}
