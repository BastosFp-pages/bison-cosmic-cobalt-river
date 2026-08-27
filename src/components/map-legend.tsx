import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { LEGEND_BLOCOS } from "@/lib/colors";
import { cn } from "@/lib/utils";

export function MapLegend() {
  const [open, setOpen] = useState(false);
  return (
    <div className="pointer-events-auto max-w-[16rem] rounded-lg border border-border bg-card/95 text-xs shadow-md backdrop-blur-sm">
      <button
        type="button"
        className="flex h-10 w-full items-center justify-between gap-2 px-3 font-medium"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        Legenda (bloco × turno)
        <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
      </button>
      {open ? (
        <ul className="space-y-1.5 border-t border-border px-3 py-2">
          {LEGEND_BLOCOS.map((item) => (
            <li key={item.key} className="flex items-center gap-2">
              <span
                className="h-0.5 w-5 shrink-0 rounded-full"
                style={{ background: item.color }}
                aria-hidden
              />
              <span>{item.label}</span>
            </li>
          ))}
          <li className="flex items-center gap-2 pt-1 text-muted-foreground">
            <span className="h-0.5 w-5 rounded-full bg-muted-foreground/40" aria-hidden />
            Malha do Lote I
          </li>
        </ul>
      ) : null}
    </div>
  );
}
