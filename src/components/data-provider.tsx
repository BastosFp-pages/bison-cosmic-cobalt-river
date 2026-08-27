import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { loadShell, loadTrechos, type Bundle } from "@/lib/data";

const DataCtx = createContext<Bundle | null>(null);

export function useData(): Bundle {
  const v = useContext(DataCtx);
  if (!v) throw new Error("useData fora do DataProvider");
  return v;
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Bundle | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    loadShell()
      .then((b) => {
        if (!alive) return;
        setData(b);
        loadTrechos()
          .then((trechos) => {
            if (!alive) return;
            setData((prev) =>
              prev ? { ...prev, trechos, trechosReady: true } : prev,
            );
          })
          .catch((e: unknown) => {
            console.warn("Atributos dos trechos atrasaram", e);
          });
      })
      .catch((e: unknown) => {
        if (alive) setError(e instanceof Error ? e.message : "Erro ao carregar dados");
      });
    return () => {
      alive = false;
    };
  }, []);

  if (error) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-background px-6 text-center text-foreground">
        <p className="font-display text-xl">Não foi possível montar a malha</p>
        <p className="max-w-md text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-5 bg-header text-header-foreground">
        <img src="/pmc-brasao.svg" alt="" className="h-16 w-16" />
        <div className="text-center">
          <p className="font-display text-xl tracking-tight">Carregando a malha do Lote I</p>
          <p className="mt-1 text-sm text-header-foreground/70">
            Rotas validadas, estatísticas por trecho e índice de logradouros
          </p>
        </div>
        <div className="h-1 w-40 overflow-hidden rounded-full bg-header-foreground/15">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-header-foreground/70" />
        </div>
      </div>
    );
  }

  return <DataCtx.Provider value={data}>{children}</DataCtx.Provider>;
}
