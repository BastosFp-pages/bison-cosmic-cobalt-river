import { createFileRoute, Link } from "@tanstack/react-router";
import { AppFrame } from "@/components/app-frame";
import { SearchPanel } from "@/components/search-panel";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <AppFrame
      current="mapa"
      overlay={<SearchPanel />}
      footer={
        <footer className="shrink-0 border-t border-border bg-card px-4 py-2.5 text-center text-sm">
          <Link
            to="/estatisticas"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Veja mais sobre Estatísticas
          </Link>
          <span className="text-muted-foreground">
            {" "}
            — faixas horárias modais e compactadores mais frequentes por trecho.
          </span>
        </footer>
      }
    />
  );
}
