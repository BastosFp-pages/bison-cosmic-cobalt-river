import { Link } from "@tanstack/react-router";
import { BarChart3, Map } from "lucide-react";
import { cn } from "@/lib/utils";

export function AppHeader({ current }: { current: "mapa" | "estatisticas" }) {
  return (
    <header className="relative z-30 shrink-0 bg-header text-header-foreground">
      <div className="flex items-center gap-3 px-3 py-2.5 md:gap-4 md:px-5 md:py-3">
        <img
          src="/pmc-brasao.svg"
          alt="Brasão de Duque de Caxias"
          className="h-11 w-11 shrink-0 md:h-12 md:w-12"
        />
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-header-foreground/70 md:text-[11px]">
            Prefeitura de Duque de Caxias
          </p>
          <h1 className="font-display text-[1.05rem] leading-tight tracking-tight md:text-xl">
            Central de informações da coleta de lixo
          </h1>
          <p className="hidden text-[11px] text-header-foreground/65 sm:block">
            Secretaria de Obras e Agricultura · Gerência de Limpeza Urbana · Lote I
          </p>
        </div>
        <nav className="flex shrink-0 items-center gap-1">
          <Link to="/" className={navClass(current === "mapa")}>
            <Map className="size-4" />
            <span className="hidden sm:inline">Mapa</span>
          </Link>
          <Link to="/estatisticas" className={navClass(current === "estatisticas")}>
            <BarChart3 className="size-4" />
            <span className="hidden sm:inline">Estatísticas</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}

function navClass(active: boolean) {
  return cn(
    "inline-flex h-11 items-center gap-1.5 rounded-md px-3 text-sm font-medium transition-colors duration-150",
    active
      ? "bg-header-foreground/12 text-header-foreground"
      : "text-header-foreground/70 hover:bg-header-foreground/8 hover:text-header-foreground",
  );
}
