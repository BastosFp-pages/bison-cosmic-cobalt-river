import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { l as Clock, n as Truck } from "../_libs/lucide-react.mjs";
import { n as useData } from "./router-D48McRM-.mjs";
import { a as fmtKmDirect, i as cn, n as Button, s as useApp, t as AppFrame } from "./app-frame-DIsk48UC.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/estatisticas-DXbIGj0j.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function StatsControls() {
	const data = useData();
	const statsKind = useApp((s) => s.statsKind);
	const selectedHour = useApp((s) => s.selectedHour);
	const selectedPlate = useApp((s) => s.selectedPlate);
	const setStats = useApp((s) => s.setStats);
	const selectTrecho = useApp((s) => s.selectTrecho);
	const ids = statsKind === "hora" && selectedHour ? data.catalog.idxHora[selectedHour] ?? [] : statsKind === "veiculo" && selectedPlate ? data.catalog.idxPlaca[selectedPlate] ?? [] : [];
	let km = 0;
	for (const id of ids) km += (data.trechos[String(id)]?.e ?? 0) / 1e3;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pointer-events-auto w-[min(100%,24rem)] rounded-xl border border-border bg-card/95 p-3 shadow-md backdrop-blur-sm",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[11px] font-medium uppercase tracking-wider text-muted-foreground",
				children: "Recorte estatístico"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 grid grid-cols-2 gap-1 rounded-lg bg-muted p-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "button",
					size: "sm",
					variant: statsKind === "hora" ? "default" : "ghost",
					className: "h-10",
					onClick: () => {
						selectTrecho(null);
						setStats("hora", data.catalog.faixasHora[6] ?? data.catalog.faixasHora[0]);
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "size-4" }), " Faixas"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "button",
					size: "sm",
					variant: statsKind === "veiculo" ? "default" : "ghost",
					className: "h-10",
					onClick: () => {
						selectTrecho(null);
						setStats("veiculo", data.catalog.placas[0]?.placa ?? null);
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Truck, { className: "size-4" }), " Veículos"]
				})]
			}),
			statsKind === "hora" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "text-xs font-medium text-muted-foreground",
						children: "Faixa horária modal"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						className: "mt-1 block h-11 w-full rounded-md border border-border bg-card px-3 text-sm",
						value: selectedHour ?? "",
						onChange: (e) => {
							selectTrecho(null);
							setStats("hora", e.target.value);
						},
						children: data.catalog.faixasHora.map((fx) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: fx,
							children: fx
						}, fx))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-sm leading-relaxed",
						children: ["Faixa horária modal nos seguintes trechos", ids.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-muted-foreground",
							children: [
								" ",
								"— ",
								ids.length,
								" trechos · ",
								fmtKmDirect(km)
							]
						}) : null]
					})
				]
			}) : null,
			statsKind === "veiculo" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "text-xs font-medium text-muted-foreground",
						children: "Placa do compactador modal"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						className: "mt-1 block h-11 w-full rounded-md border border-border bg-card px-3 text-sm",
						value: selectedPlate ?? "",
						onChange: (e) => {
							selectTrecho(null);
							setStats("veiculo", e.target.value);
						},
						children: data.catalog.placas.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
							value: p.placa,
							children: [
								p.placa,
								" (",
								p.n,
								" trechos)"
							]
						}, p.placa))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-sm leading-relaxed",
						children: ["Veículo compactador mais frequente nos seguintes trechos", ids.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-muted-foreground",
							children: [
								" ",
								"— ",
								ids.length,
								" trechos · ",
								fmtKmDirect(km)
							]
						}) : null]
					})
				]
			}) : null,
			!statsKind ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm leading-relaxed text-muted-foreground",
				children: "Escolha faixas horárias ou veículos. O mapa mostra só os trechos em que aquele valor é o modal — o mais frequente no consolidado GPS, com corte de velocidade nas faixas."
			}) : null,
			ids.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniList, { ids }) : null
		]
	});
}
function MiniList({ ids }) {
	const data = useData();
	const selectTrecho = useApp((s) => s.selectTrecho);
	const trechoId = useApp((s) => s.trechoId);
	const sample = ids.slice(0, 8);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
		className: "mt-2 max-h-36 overflow-auto rounded-md border border-border",
		children: [sample.map((id) => {
			const t = data.trechos[String(id)];
			if (!t) return null;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => selectTrecho(id),
				className: cn("flex w-full flex-col items-start px-3 py-2 text-left text-xs hover:bg-muted", trechoId === id && "bg-primary/10"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-medium",
					children: t.n === "SN" ? "Sem nome" : t.n
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-muted-foreground",
					children: t.b
				})]
			}) }, id);
		}), ids.length > 8 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
			className: "px-3 py-2 text-[11px] text-muted-foreground",
			children: [
				"+ ",
				ids.length - 8,
				" trechos no mapa"
			]
		}) : null]
	});
}
function Estatisticas() {
	const { catalog } = useData();
	const r = catalog.resumo;
	(0, import_react.useEffect)(() => {
		useApp.setState({
			streetId: null,
			trechoId: null,
			routeIndex: null,
			showAttendance: false
		});
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppFrame, {
		current: "estatisticas",
		overlay: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatsControls, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pointer-events-auto hidden max-w-[24rem] rounded-xl border border-border bg-card/90 p-3 text-xs leading-relaxed text-muted-foreground shadow-sm backdrop-blur-sm md:block",
				children: [
					r.nTrechosGps,
					" trechos com GPS (",
					r.kmComGps.toFixed(1).replace(".", ","),
					" km) em",
					" ",
					r.nPlacas,
					" compactadores. A faixa horária usa passagens com corte de velocidade; a placa modal é a mais frequente no consolidado, sem esse corte."
				]
			})]
		})
	});
}
//#endregion
export { Estatisticas as component };
