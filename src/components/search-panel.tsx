import { useMemo, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { useData } from "@/components/data-provider";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useApp } from "@/lib/store";
import { cn, fold, fmtKmDirect } from "@/lib/utils";

export function SearchPanel() {
  const data = useData();
  const query = useApp((s) => s.query);
  const bairro = useApp((s) => s.bairro);
  const streetId = useApp((s) => s.streetId);
  const setQuery = useApp((s) => s.setQuery);
  const setBairro = useApp((s) => s.setBairro);
  const selectStreet = useApp((s) => s.selectStreet);
  const [open, setOpen] = useState(false);
  const [bairroOpen, setBairroOpen] = useState(false);

  const results = useMemo(() => {
    const q = fold(query);
    if (q.length < 2 && !bairro) return [];
    const hits = data.streets.filter((s) => {
      const bairros = s.bairros?.length ? s.bairros : s.bairro ? [s.bairro] : [];
      if (bairro && !bairros.includes(bairro)) return false;
      if (q.length < 2) return true;
      return fold(s.name).includes(q) || bairros.some((b) => fold(b).includes(q));
    });
    hits.sort((a, b) => {
      const fa = fold(a.name);
      const fb = fold(b.name);
      const ea = fa === q ? 0 : fa.startsWith(q) ? 1 : 2;
      const eb = fb === q ? 0 : fb.startsWith(q) ? 1 : 2;
      if (ea !== eb) return ea - eb;
      return b.n - a.n;
    });
    return hits.slice(0, 40);
  }, [data.streets, query, bairro]);

  const showList = open && (query.length >= 2 || Boolean(bairro));

  return (
    <div className="pointer-events-auto w-[min(100%,22rem)]">
      <div className="rounded-xl border border-border bg-card/95 p-3 shadow-md backdrop-blur-sm">
        <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Buscar logradouro
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder="Nome da rua, avenida, travessa…"
            className="pr-10 pl-9"
            aria-label="Nome do logradouro"
            autoComplete="off"
          />
          {query ? (
            <button
              type="button"
              className="absolute top-1/2 right-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
              onClick={() => {
                setQuery("");
                selectStreet(null);
              }}
              aria-label="Limpar busca"
            >
              <X className="size-4" />
            </button>
          ) : null}
        </div>
        <div className="mt-2">
          <p className="text-[11px] font-medium text-muted-foreground">Bairro</p>
          <button
            type="button"
            className="mt-1 flex h-10 w-full items-center justify-between rounded-md border border-border bg-card px-3 text-left text-sm"
            onClick={() => setBairroOpen((v) => !v)}
            aria-expanded={bairroOpen}
          >
            <span className="truncate">{bairro ?? "Todos os bairros do Lote I"}</span>
            <ChevronDown
              className={cn("size-4 shrink-0 text-muted-foreground transition-transform", bairroOpen && "rotate-180")}
            />
          </button>
          {bairroOpen ? (
            <ul className="mt-1 max-h-40 overflow-auto rounded-md border border-border bg-card">
              <li>
                <button
                  type="button"
                  className={cn(
                    "flex h-10 w-full items-center px-3 text-left text-sm hover:bg-muted",
                    !bairro && "bg-primary/10",
                  )}
                  onClick={() => {
                    setBairro(null);
                    setBairroOpen(false);
                  }}
                >
                  Todos os bairros do Lote I
                </button>
              </li>
              {data.catalog.bairros.map((b) => (
                <li key={b}>
                  <button
                    type="button"
                    className={cn(
                      "flex h-10 w-full items-center px-3 text-left text-sm hover:bg-muted",
                      bairro === b && "bg-primary/10",
                    )}
                    onClick={() => {
                      setBairro(b);
                      setBairroOpen(false);
                      setOpen(true);
                    }}
                  >
                    {b}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        {showList ? (
          <ScrollArea className="mt-2 h-52 rounded-lg border border-border">
            {results.length === 0 ? (
              <p className="px-3 py-4 text-sm text-muted-foreground">
                Nenhum logradouro com esse nome
                {bairro ? ` em ${bairro}` : ""}.
              </p>
            ) : (
              <ul className="p-1">
                {results.map((s) => {
                  const label =
                    s.name === "SN" || s.name.startsWith("SN")
                      ? "Sem nome cadastrado"
                      : s.name;
                  return (
                    <li key={s.id}>
                      <button
                        type="button"
                        onClick={() => {
                          selectStreet(s.id);
                          setQuery(s.name);
                          setOpen(false);
                        }}
                        className={cn(
                          "flex w-full flex-col items-start rounded-md px-3 py-2.5 text-left transition-colors duration-150",
                          streetId === s.id ? "bg-primary/10" : "hover:bg-muted",
                        )}
                      >
                        <span className="text-sm font-medium text-foreground">{label}</span>
                        <span className="text-xs text-muted-foreground">
                          {bairroLabel(s)}
                          {s.distrito ? ` · ${s.distrito} distrito` : ""} · {s.n} trechos ·{" "}
                          {fmtKmDirect(s.km)}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </ScrollArea>
        ) : (
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Clique no mapa para abrir o trecho. Homônimos em bairros distantes
            aparecem separados; a mesma avenida contínua, mesmo cruzando bairros,
            entra como um único resultado.
          </p>
        )}
      </div>
    </div>
  );
}

function bairroLabel(s: { bairro: string | null; bairros?: string[] }) {
  const list = s.bairros?.length ? s.bairros : s.bairro ? [s.bairro] : [];
  if (list.length === 0) return "Bairro não informado";
  if (list.length === 1) return list[0];
  if (list.length === 2) return `${list[0]} e ${list[1]}`;
  return `${list[0]}, ${list[1]} e +${list.length - 2}`;
}
