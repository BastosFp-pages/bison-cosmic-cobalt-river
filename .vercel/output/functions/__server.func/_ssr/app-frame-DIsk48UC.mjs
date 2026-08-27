import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { a as Route, c as Gauge, d as ChartColumn, f as CalendarDays, n as Truck, o as Map, s as Info, t as X, u as ChevronDown } from "../_libs/lucide-react.mjs";
import { a as getTrecho, i as featureOf, n as useData, r as bboxOfIds } from "./router-D48McRM-.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { r as Slot } from "../_libs/@radix-ui/react-primitive+[...].mjs";
import { t as Root } from "../_libs/radix-ui__react-separator.mjs";
import { i as Viewport, n as Scrollbar, r as Thumb, t as Root$1 } from "../_libs/@radix-ui/react-scroll-area+[...].mjs";
import { t as create } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/app-frame-DIsk48UC.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function fold(s) {
	return s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();
}
function fmtKm(m) {
	if (m == null || Number.isNaN(m)) return "—";
	if (m >= 1e3) return `${(m / 1e3).toFixed(2).replace(".", ",")} km`;
	return `${Math.round(m)} m`;
}
function fmtKmDirect(km) {
	if (km == null || Number.isNaN(km)) return "—";
	return `${km.toFixed(2).replace(".", ",")} km`;
}
function fmtPct(n, digits = 1) {
	if (n == null || Number.isNaN(n)) return "—";
	return `${n.toFixed(digits).replace(".", ",")}%`;
}
function fmtNum(n, digits = 1) {
	if (n == null || Number.isNaN(n)) return "—";
	return n.toFixed(digits).replace(".", ",");
}
var DOW = {
	seg: "Seg",
	ter: "Ter",
	qua: "Qua",
	qui: "Qui",
	sex: "Sex",
	sab: "Sáb",
	dom: "Dom"
};
function labelDow(code) {
	return DOW[code] ?? code;
}
function formatDias(dias) {
	if (!dias || dias.length === 0) return "—";
	const labels = dias.map(labelDow);
	const key = dias.join(",");
	if (key === "seg,qua,sex") return "Seg / Qua / Sex";
	if (key === "ter,qui,sab") return "Ter / Qui / Sáb";
	if (key === "seg,ter,qua,qui,sex,sab") return "Seg a sáb";
	if (key === "dom") return "Domingo";
	return labels.join(", ");
}
function formatDatePt(iso) {
	const [y, m, d] = iso.split("-").map(Number);
	const dt = new Date(Date.UTC(y, m - 1, d));
	return new Intl.DateTimeFormat("pt-BR", {
		weekday: "short",
		day: "2-digit",
		month: "short",
		year: "numeric",
		timeZone: "UTC"
	}).format(dt);
}
function nextDayIso(iso) {
	const [y, m, d] = iso.split("-").map(Number);
	const dt = new Date(Date.UTC(y, m - 1, d));
	dt.setUTCDate(dt.getUTCDate() + 1);
	return dt.toISOString().slice(0, 10);
}
function AppHeader({ current }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
		className: "relative z-30 shrink-0 bg-header text-header-foreground",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-3 px-3 py-2.5 md:gap-4 md:px-5 md:py-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: "/pmc-brasao.svg",
					alt: "Brasão de Duque de Caxias",
					className: "h-11 w-11 shrink-0 md:h-12 md:w-12"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 flex-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[10px] font-medium uppercase tracking-[0.18em] text-header-foreground/70 md:text-[11px]",
							children: "Prefeitura de Duque de Caxias"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "font-display text-[1.05rem] leading-tight tracking-tight md:text-xl",
							children: "Central de informações da coleta de lixo"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "hidden text-[11px] text-header-foreground/65 sm:block",
							children: "Secretaria de Obras e Agricultura · Gerência de Limpeza Urbana · Lote I"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
					className: "flex shrink-0 items-center gap-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/",
						className: navClass(current === "mapa"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Map, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "hidden sm:inline",
							children: "Mapa"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/estatisticas",
						className: navClass(current === "estatisticas"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartColumn, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "hidden sm:inline",
							children: "Estatísticas"
						})]
					})]
				})
			]
		})
	});
}
function navClass(active) {
	return cn("inline-flex h-11 items-center gap-1.5 rounded-md px-3 text-sm font-medium transition-colors duration-150", active ? "bg-header-foreground/12 text-header-foreground" : "text-header-foreground/70 hover:bg-header-foreground/8 hover:text-header-foreground");
}
var badgeVariants = cva("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide", {
	variants: { variant: {
		default: "border-transparent bg-primary text-primary-foreground",
		secondary: "border-transparent bg-secondary text-secondary-foreground",
		outline: "border-border text-foreground",
		valid: "border-transparent bg-valid/15 text-valid",
		ponte: "border-transparent bg-ponte/15 text-ponte",
		muted: "border-transparent bg-muted text-muted-foreground"
	} },
	defaultVariants: { variant: "default" }
});
function Badge({ className, variant, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn(badgeVariants({ variant }), className),
		...props
	});
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,background-color,opacity,transform] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground hover:bg-primary/90",
			secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border",
			outline: "border border-border bg-card text-foreground hover:bg-muted",
			ghost: "text-foreground hover:bg-muted",
			link: "text-primary underline-offset-4 hover:underline px-0"
		},
		size: {
			default: "h-11 px-4 py-2",
			sm: "h-9 px-3 text-sm",
			lg: "h-12 px-5",
			icon: "h-11 w-11"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
var Button = import_react.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		ref,
		...props
	});
});
Button.displayName = "Button";
function Separator({ className, orientation = "horizontal", decorative = true, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root, {
		decorative,
		orientation,
		className: cn("shrink-0 bg-border", orientation === "horizontal" ? "h-px w-full" : "h-full w-px", className),
		...props
	});
}
function ScrollArea({ className, children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Root$1, {
		className: cn("relative overflow-hidden", className),
		...props,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Viewport, {
			className: "h-full w-full rounded-[inherit]",
			children
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scrollbar, {
			orientation: "vertical",
			className: "flex w-2.5 touch-none select-none p-px",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Thumb, { className: "relative flex-1 rounded-full bg-border" })
		})]
	});
}
var useApp = create((set) => ({
	query: "",
	bairro: null,
	streetId: null,
	trechoId: null,
	routeIndex: null,
	showAttendance: false,
	attendanceDate: null,
	statsKind: null,
	selectedHour: null,
	selectedPlate: null,
	legendOpen: false,
	setQuery: (q) => set({ query: q }),
	setBairro: (b) => set({ bairro: b }),
	selectStreet: (id) => set({
		streetId: id,
		trechoId: null,
		routeIndex: null,
		showAttendance: false,
		statsKind: null,
		selectedHour: null,
		selectedPlate: null
	}),
	selectTrecho: (id) => set({
		trechoId: id,
		routeIndex: null,
		showAttendance: false
	}),
	selectRoute: (i) => set({
		routeIndex: i,
		showAttendance: false,
		statsKind: null,
		selectedHour: null,
		selectedPlate: null
	}),
	setAttendance: (open, date) => set((s) => ({
		showAttendance: open,
		attendanceDate: date === void 0 ? s.attendanceDate : date
	})),
	setStats: (kind, value) => set({
		statsKind: kind,
		selectedHour: kind === "hora" ? value ?? null : null,
		selectedPlate: kind === "veiculo" ? value ?? null : null,
		streetId: null,
		trechoId: null,
		routeIndex: null,
		showAttendance: false
	}),
	setLegendOpen: (v) => set({ legendOpen: v }),
	resetSelection: () => set({
		streetId: null,
		trechoId: null,
		routeIndex: null,
		showAttendance: false,
		attendanceDate: null,
		statsKind: null,
		selectedHour: null,
		selectedPlate: null,
		query: ""
	})
}));
var ST_LABEL = {
	V: "Validado",
	VR: "Validado (rua sem rota)",
	P: "Preenchido (ponte)",
	O: "Outro"
};
function DetailPanel() {
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
	const street = streetId ? data.streets.find((s) => s.id === streetId) : void 0;
	const trecho = trechoId != null ? getTrecho(data, trechoId) : void 0;
	const route = routeIndex != null ? data.routes[routeIndex] : void 0;
	const waitingTrecho = trechoId != null && !trecho && !data.trechosReady;
	if (!Boolean(street || trecho || route || statsKind && (selectedHour || selectedPlate))) return null;
	const title = route ? route.name : trecho ? displayName(trecho.n) : street ? displayName(street.name) : statsKind === "hora" ? `Faixa ${selectedHour}` : `Veículo ${selectedPlate}`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		className: "pointer-events-auto flex max-h-[52vh] w-full flex-col rounded-t-xl border border-border bg-card shadow-lg md:max-h-none md:h-full md:w-[min(100%,26rem)] md:rounded-none md:border-y-0 md:border-r-0 md:shadow-none",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start gap-3 border-b border-border px-4 py-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] font-medium uppercase tracking-wider text-muted-foreground",
						children: route ? "Itinerário da rota" : trecho ? "Trecho selecionado" : street ? "Logradouro" : "Recorte estatístico"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-lg leading-snug tracking-tight",
						children: title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted-foreground",
						children: [trecho?.b ?? street?.bairro ?? route?.bairro ?? "Lote I", trecho?.d ? ` · ${trecho.d} distrito` : ""]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				size: "icon",
				"aria-label": "Fechar painel",
				onClick: () => {
					if (route) selectRoute(null);
					else if (trecho) selectTrecho(null);
					else resetSelection();
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {})
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
			className: "min-h-0 flex-1",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-5 px-4 py-4",
				children: [
					waitingTrecho ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "Carregando atributos do trecho…"
					}) : null,
					route ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RouteSummary, {
						turno: route.turno,
						dias: route.dias,
						n: route.n,
						km: route.km,
						onBack: () => selectRoute(null)
					}) : null,
					street && !trecho && !route ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StreetPrompt, {
						streetName: street.name,
						n: street.n,
						ids: street.ids
					}) : null,
					trecho && !route ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrechoBody, {
						trecho,
						limiar: data.catalog.limiarHitRate,
						routes: data.routes,
						dates: data.catalog.dias,
						showAttendance,
						attendanceDate,
						onRoute: (i) => selectRoute(i),
						onAttendance: (open, date) => setAttendance(open, date),
						onStreet: () => {
							const sid = data.streets.find((s) => s.name === trecho.n && s.bairro === trecho.b)?.id;
							if (sid) selectStreet(sid);
						}
					}) : null,
					statsKind && !trecho && !route ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatsHint, {
						kind: statsKind,
						hour: selectedHour,
						plate: selectedPlate
					}) : null
				]
			})
		})]
	});
}
function displayName(n) {
	if (n === "SN" || n.startsWith("SN ")) return n === "SN" ? "Sem nome cadastrado" : n;
	return n;
}
function StreetPrompt({ streetName, n, ids }) {
	const data = useData();
	const selectTrecho = useApp((s) => s.selectTrecho);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "rounded-lg border border-border bg-muted/60 p-3",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm leading-relaxed",
				children: [
					displayName(streetName),
					" está em destaque (",
					n,
					" trechos, quebrados a cada esquina). Toque no mapa ou escolha um trecho abaixo."
				]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "divide-y divide-border overflow-hidden rounded-lg border border-border",
			children: ids.map((id) => {
				const t = data.trechos[String(id)];
				const hr = t?.r.map((x) => x.hr).filter((x) => x != null);
				const best = hr && hr.length ? Math.max(...hr) : null;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => selectTrecho(id),
					className: "flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm hover:bg-muted",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						"Trecho ",
						id,
						t?.e != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-muted-foreground",
							children: [" · ", fmtKm(t.e)]
						}) : null
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs tabular-nums text-muted-foreground",
						children: best == null ? "s/ hit rate" : fmtPct(best)
					})]
				}) }, id);
			})
		})]
	});
}
function RouteSummary({ turno, dias, n, km, onBack }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [turno ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: turno }) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					variant: "outline",
					children: formatDias(dias)
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted-foreground",
				children: [
					n,
					" trechos · ",
					km.toFixed(2).replace(".", ","),
					" km de eixo. O traçado no mapa é a malha validada (eixo do logradouro), não o buffer de 5 m usado na análise espacial."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "outline",
				size: "sm",
				onClick: onBack,
				children: "Voltar ao trecho"
			})
		]
	});
}
function StatsHint({ kind, hour, plate }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm leading-relaxed text-muted-foreground",
		children: kind === "hora" ? `Faixa horária modal ${hour} nos trechos em destaque. Clique em um trecho para as demais faixas, inclusive por dia da semana.` : `Compactador modal ${plate} nos trechos em destaque. Clique em um trecho para o ranking de placas e as velocidades observadas.`
	});
}
function TrechoBody({ trecho, limiar, routes, dates, showAttendance, attendanceDate, onRoute, onAttendance, onStreet }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
			className: "grid grid-cols-2 gap-3 text-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
				label: "Extensão",
				value: fmtKm(trecho.e)
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
				label: "id_trecho",
				value: String(trecho.id)
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
				className: "mb-2 flex items-center gap-1.5 text-sm font-semibold",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, { className: "size-4" }), " Rotas neste trecho"]
			}),
			trecho.r.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Sem rota atribuída neste arquivo de validação. Pode ser lacuna, área militar ou logradouro ainda sem casamento com a lista da operadora."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "space-y-2",
				children: trecho.r.map((hit) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RouteRow, {
					hit,
					route: routes[hit.i],
					limiar,
					onOpen: () => onRoute(hit.i)
				}, hit.i))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 flex gap-1.5 text-[11px] leading-relaxed text-muted-foreground",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, { className: "mt-0.5 size-3.5 shrink-0" }),
					"Hit rate ≥ ",
					fmtPct(limiar, 1),
					" é o percentual suficiente para validação GPS do trecho no bloco de dias. Não leia 66,7% como atendimento baixo."
				]
			})
		] }),
		trecho.s ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
				className: "mb-2 flex items-center gap-1.5 text-sm font-semibold",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Truck, { className: "size-4" }), " Passagens GPS"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "grid grid-cols-2 gap-3 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Passagens",
						value: String(trecho.s.np ?? "—")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Dias com GPS",
						value: String(trecho.s.dias.length)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Placa modal",
						value: trecho.s.pl ?? "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Concentração",
						value: fmtPct(trecho.s.pp)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Faixa modal (30 min)",
						value: trecho.s.fx ?? "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Nessa faixa",
						value: String(trecho.s.nfx ?? "—")
					})
				]
			}),
			trecho.s.pt.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-xs text-muted-foreground",
				children: ["Top placas: ", trecho.s.pt.map((p) => `${p.k} (${p.n})`).join(" · ")]
			}) : null
		] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: "Sem estatística de passagem neste trecho no recorte consolidado."
		}),
		trecho.s ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
				className: "mb-2 flex items-center gap-1.5 text-sm font-semibold",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gauge, { className: "size-4" }), " Velocidade (km/h)"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "grid grid-cols-2 gap-3 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Média",
						value: fmtNum(trecho.s.vm)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Mediana",
						value: fmtNum(trecho.s.vd)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "P75",
						value: fmtNum(trecho.s.v75)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "% vel. alta",
						value: fmtPct(trecho.s.va)
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-[11px] text-muted-foreground",
				children: "A faixa modal horária abaixo já aplica o corte de velocidade de trânsito (passagens “limpas”), para não misturar deslocamento de transferência com coleta."
			})
		] }) : null,
		trecho.h ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mb-2 text-sm font-semibold",
				children: "Faixas horárias"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "grid grid-cols-2 gap-3 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Modal (1 h)",
						value: trecho.h.fx ?? "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Participação",
						value: fmtPct(trecho.h.pct)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Passagens limpas",
						value: String(trecho.h.nl ?? "—")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Modal × dia",
						value: trecho.h.fd ?? "—"
					})
				]
			}),
			trecho.h.t3.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "mt-2 space-y-1 text-xs",
				children: trecho.h.t3.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: item.k }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "tabular-nums text-muted-foreground",
						children: item.n
					})]
				}, item.k))
			}) : null,
			Object.keys(trecho.h.dow).length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-xs",
				children: Object.entries(trecho.h.dow).map(([d, fx]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-muted-foreground",
						children: labelDow(d)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "tabular-nums",
						children: fx
					})]
				}, d))
			}) : null
		] }) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
			className: "mb-2 flex items-center gap-1.5 text-sm font-semibold",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarDays, { className: "size-4" }), " Atendimento por dia"]
		}), !showAttendance ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "outline",
			size: "sm",
			onClick: () => {
				const first = trecho.s?.dias?.[0];
				onAttendance(true, first != null ? dates[first] : dates[0] ?? null);
			},
			children: "Ver dados de atendimento por dia"
		}) : trecho.s ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AttendanceBlock, {
			dates,
			observed: trecho.s.dias,
			selected: attendanceDate,
			onSelect: (d) => onAttendance(true, d)
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: "Este trecho não entra no consolidado de GPS, então não há calendário de passagem."
		})] }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: onStreet,
			className: "text-left text-xs text-primary underline-offset-4 hover:underline",
			children: "Ver todos os trechos desta rua"
		})
	] });
}
function RouteRow({ hit, route, limiar, onOpen }) {
	if (!route) return null;
	const validated = hit.st === "V" || hit.st === "VR";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
		className: "rounded-lg border border-border p-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: onOpen,
			className: "text-left text-sm font-medium text-primary underline-offset-4 hover:underline",
			children: route.name
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-1.5 flex flex-wrap items-center gap-1.5",
			children: [
				route.turno ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					variant: "secondary",
					children: route.turno
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					variant: "outline",
					children: formatDias(route.dias)
				}),
				hit.hr == null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					variant: hit.st === "P" ? "ponte" : "muted",
					children: hit.st === "P" ? "Ponte · sem hit rate" : "Sem hit rate"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
					variant: validated || hit.hr >= limiar ? "valid" : "muted",
					children: [
						fmtPct(hit.hr),
						" ",
						ST_LABEL[hit.st ?? ""] ?? "validado"
					]
				})
			]
		})]
	});
}
function AttendanceBlock({ dates, observed, selected, onSelect }) {
	const set = new Set(observed);
	const iso = selected ?? dates[0];
	const idx = dates.indexOf(iso);
	const hit = idx >= 0 && set.has(idx);
	const next = iso ? nextDayIso(iso) : "";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "block text-xs font-medium text-muted-foreground",
				children: ["Dia operacional", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
					className: "mt-1 block h-11 w-full rounded-md border border-border bg-card px-3 text-sm text-foreground",
					value: iso ?? "",
					onChange: (e) => onSelect(e.target.value),
					children: dates.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: d,
						children: formatDatePt(d)
					}, d))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: hit ? "rounded-lg border border-valid/30 bg-valid/10 px-3 py-2 text-sm text-valid" : "rounded-lg border border-border bg-muted px-3 py-2 text-sm text-muted-foreground",
				children: hit ? "Passagem do compactador registrada neste trecho." : "Sem passagem consolidada neste trecho nesse dia."
			}),
			iso ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-[11px] leading-relaxed text-muted-foreground",
				children: [
					"No setor, o dia começa às 6h e termina às 5h59 do dia seguinte. ",
					formatDatePt(iso),
					" ",
					"cobre de 6h00 até 5h59 de ",
					formatDatePt(next),
					". As datas abaixo vêm do consolidado GPS (não das camadas diárias de rotas associadas, que não acompanham este recorte)."
				]
			}) : null
		]
	});
}
function Stat({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
		className: "text-[11px] font-medium uppercase tracking-wider text-muted-foreground",
		children: label
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
		className: "font-medium tabular-nums",
		children: value
	})] });
}
/** Cartographic colours from the sector QGIS style (dias × turno). */
var BLOCO_TURNO = {
	"Ter_Qui_Sab|Noite": "#1a5276",
	"Seg_Qua_Sex|Noite": "#196f3d",
	"Ter_Qui_Sab|Manhã": "#2e86c1",
	"Seg_a_Sab|Manhã": "#c0392b",
	"Domingo|Manhã": "#6c3483",
	"Seg_a_Sab|Madrugada": "#922b21",
	"Domingo|Noite": "#4a235a",
	"Seg_a_Sab|Tarde": "#b9770e",
	"Domingo|Tarde": "#a93226",
	"Seg_Qua_Sex|Manhã": "#1e8449",
	"Ter_Qui_Sab|Tarde": "#b9770e",
	"Seg_Qua_Sex|Tarde": "#1e8449"
};
var TURNO_FALLBACK = {
	Noite: "#1a5276",
	Manhã: "#2e86c1",
	Madrugada: "#922b21",
	Tarde: "#b9770e"
};
var NETWORK = "#5c675f";
var STREET = "#123d2a";
var SELECTED = "#c0392b";
var STATS_HOUR = "#1a5276";
var STATS_PLATE = "#196f3d";
function routeColor(turno, bloco) {
	if (bloco && turno) {
		const hit = BLOCO_TURNO[`${bloco}|${turno}`];
		if (hit) return hit;
	}
	if (turno && TURNO_FALLBACK[turno]) return TURNO_FALLBACK[turno];
	return NETWORK;
}
function hourColor(faixa) {
	const h = Number.parseInt(faixa.slice(0, 2), 10);
	if (Number.isNaN(h)) return STATS_HOUR;
	if (h >= 0 && h < 5) return "#2c3e50";
	if (h < 8) return "#922b21";
	if (h < 12) return "#b9770e";
	if (h < 18) return "#1e8449";
	if (h < 21) return "#1a5276";
	return "#4a235a";
}
var LEGEND_BLOCOS = [
	{
		key: "tqs-n",
		label: "Ter/Qui/Sáb — noite",
		color: BLOCO_TURNO["Ter_Qui_Sab|Noite"]
	},
	{
		key: "sqs-n",
		label: "Seg/Qua/Sex — noite",
		color: BLOCO_TURNO["Seg_Qua_Sex|Noite"]
	},
	{
		key: "tqs-m",
		label: "Ter/Qui/Sáb — manhã",
		color: BLOCO_TURNO["Ter_Qui_Sab|Manhã"]
	},
	{
		key: "sas-m",
		label: "Seg a sáb — manhã",
		color: BLOCO_TURNO["Seg_a_Sab|Manhã"]
	},
	{
		key: "dom-m",
		label: "Domingo — manhã",
		color: BLOCO_TURNO["Domingo|Manhã"]
	},
	{
		key: "sas-mad",
		label: "Seg a sáb — madrugada",
		color: BLOCO_TURNO["Seg_a_Sab|Madrugada"]
	},
	{
		key: "dom-n",
		label: "Domingo — noite",
		color: BLOCO_TURNO["Domingo|Noite"]
	},
	{
		key: "sas-t",
		label: "Seg a sáb — tarde",
		color: BLOCO_TURNO["Seg_a_Sab|Tarde"]
	},
	{
		key: "dom-t",
		label: "Domingo — tarde",
		color: BLOCO_TURNO["Domingo|Tarde"]
	},
	{
		key: "sqs-m",
		label: "Seg/Qua/Sex — manhã",
		color: BLOCO_TURNO["Seg_Qua_Sex|Manhã"]
	}
];
function MapLegend() {
	const [open, setOpen] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pointer-events-auto max-w-[16rem] rounded-lg border border-border bg-card/95 text-xs shadow-md backdrop-blur-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			className: "flex h-10 w-full items-center justify-between gap-2 px-3 font-medium",
			onClick: () => setOpen((v) => !v),
			"aria-expanded": open,
			children: ["Legenda (bloco × turno)", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: cn("size-4 transition-transform", open && "rotate-180") })]
		}), open ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
			className: "space-y-1.5 border-t border-border px-3 py-2",
			children: [LEGEND_BLOCOS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "h-0.5 w-5 shrink-0 rounded-full",
					style: { background: item.color },
					"aria-hidden": true
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: item.label })]
			}, item.key)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "flex items-center gap-2 pt-1 text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "h-0.5 w-5 rounded-full bg-muted-foreground/40",
					"aria-hidden": true
				}), "Malha do Lote I"]
			})]
		}) : null]
	});
}
function MapView() {
	const hostRef = (0, import_react.useRef)(null);
	const mapRef = (0, import_react.useRef)(null);
	const Lref = (0, import_react.useRef)(null);
	const netRef = (0, import_react.useRef)(null);
	const hlRef = (0, import_react.useRef)(null);
	const [ready, setReady] = (0, import_react.useState)(false);
	const data = useData();
	const streetId = useApp((s) => s.streetId);
	const trechoId = useApp((s) => s.trechoId);
	const routeIndex = useApp((s) => s.routeIndex);
	const statsKind = useApp((s) => s.statsKind);
	const selectedHour = useApp((s) => s.selectedHour);
	const selectedPlate = useApp((s) => s.selectedPlate);
	const selectTrecho = useApp((s) => s.selectTrecho);
	(0, import_react.useEffect)(() => {
		if (!hostRef.current) return;
		let cancelled = false;
		let map;
		let resize;
		(async () => {
			const L = await import("../_libs/leaflet.mjs").then((n) => /* @__PURE__ */ __toESM(n.t()));
			if (cancelled || !hostRef.current) return;
			Lref.current = L;
			map = L.map(hostRef.current, {
				zoomControl: false,
				attributionControl: true
			});
			const bbox = data.catalog.bbox;
			if (bbox) map.fitBounds([[bbox[1], bbox[0]], [bbox[3], bbox[2]]], {
				padding: [24, 24],
				maxZoom: 14
			});
			else map.setView([-22.786, -43.305], 13);
			L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
				attribution: "&copy; <a href=\"https://www.openstreetmap.org/copyright\">OSM</a> &copy; <a href=\"https://carto.com/attributions\">CARTO</a>",
				maxZoom: 19,
				subdomains: "abcd"
			}).addTo(map);
			L.control.zoom({ position: "bottomright" }).addTo(map);
			L.control.scale({
				imperial: false,
				position: "bottomleft"
			}).addTo(map);
			map.createPane("network");
			const netPane = map.getPane("network");
			if (netPane) netPane.style.zIndex = "350";
			map.createPane("highlight");
			const hlPane = map.getPane("highlight");
			if (hlPane) hlPane.style.zIndex = "450";
			const net = L.layerGroup([], { pane: "network" }).addTo(map);
			const hl = L.layerGroup([], { pane: "highlight" }).addTo(map);
			netRef.current = net;
			hlRef.current = hl;
			mapRef.current = map;
			paintNetwork(L, net, data);
			setReady(true);
			resize = new ResizeObserver(() => {
				map?.invalidateSize();
			});
			if (hostRef.current) resize.observe(hostRef.current);
		})();
		return () => {
			cancelled = true;
			resize?.disconnect();
			setReady(false);
			map?.remove();
			mapRef.current = null;
			netRef.current = null;
			hlRef.current = null;
		};
	}, []);
	(0, import_react.useEffect)(() => {
		if (!ready) return;
		const L = Lref.current;
		const map = mapRef.current;
		const hl = hlRef.current;
		if (!L || !map || !hl) return;
		hl.clearLayers();
		const addLine = (id, style, interactive) => {
			const feat = featureOf(data, id);
			if (!feat) return;
			const layer = L.geoJSON(feat, {
				style: {
					...style,
					lineCap: "round",
					lineJoin: "round"
				},
				interactive,
				pane: "highlight"
			});
			if (interactive) layer.on("click", (e) => {
				L.DomEvent.stopPropagation(e);
				selectTrecho(id);
			});
			layer.addTo(hl);
		};
		let fit = null;
		if (statsKind === "hora" && selectedHour) {
			const ids = data.catalog.idxHora[selectedHour] ?? [];
			for (const id of ids) addLine(id, {
				color: hourColor(selectedHour),
				weight: trechoId === id ? 7 : 3.5,
				opacity: trechoId === id ? 1 : .85
			}, true);
			fit = bboxOfIds(data, ids);
		} else if (statsKind === "veiculo" && selectedPlate) {
			const ids = data.catalog.idxPlaca[selectedPlate] ?? [];
			for (const id of ids) addLine(id, {
				color: STATS_PLATE,
				weight: trechoId === id ? 7 : 3.5,
				opacity: trechoId === id ? 1 : .85
			}, true);
			fit = bboxOfIds(data, ids);
		} else if (routeIndex != null) {
			const route = data.routes[routeIndex];
			if (route) {
				const color = routeColor(route.turno, route.bloco);
				for (const id of route.ids) addLine(id, {
					color: trechoId === id ? SELECTED : color,
					weight: trechoId === id ? 7 : 4,
					opacity: .95
				}, true);
				fit = route.bbox;
			}
		} else if (streetId) {
			const street = data.streets.find((s) => s.id === streetId);
			if (street) {
				for (const id of street.ids) {
					const selected = trechoId === id;
					addLine(id, {
						color: selected ? SELECTED : STREET,
						weight: selected ? 7 : 4.5,
						opacity: .95
					}, true);
				}
				fit = street.bbox;
			}
		}
		if (fit && (routeIndex != null || statsKind || !trechoId)) map.fitBounds([[fit[1], fit[0]], [fit[3], fit[2]]], {
			padding: [40, 40],
			maxZoom: 17
		});
		else if (trechoId) {
			const tb = bboxOfIds(data, [trechoId]);
			if (tb) {
				const lat = (tb[1] + tb[3]) / 2;
				const lng = (tb[0] + tb[2]) / 2;
				if (!map.getBounds().contains([lat, lng])) map.panTo([lat, lng]);
			}
		}
	}, [
		ready,
		data,
		streetId,
		trechoId,
		routeIndex,
		statsKind,
		selectedHour,
		selectedPlate,
		selectTrecho
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref: hostRef,
		className: "absolute inset-0 z-0 h-full w-full"
	});
}
function paintNetwork(L, group, data) {
	const features = Object.keys(data.geom).map((id) => ({
		type: "Feature",
		properties: { id: Number(id) },
		geometry: {
			type: "MultiLineString",
			coordinates: data.geom[id]
		}
	}));
	L.geoJSON({
		type: "FeatureCollection",
		features
	}, {
		style: {
			color: NETWORK,
			weight: 2.2,
			opacity: .55,
			lineCap: "round",
			lineJoin: "round"
		},
		interactive: false,
		pane: "network",
		renderer: L.canvas({
			pane: "network",
			padding: .5
		})
	}).addTo(group);
}
function AppFrame({ current, overlay, footer }) {
	const { catalog } = useData();
	const r = catalog.resumo;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-dvh flex-col bg-background text-foreground",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppHeader, { current }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative flex min-h-0 flex-1 flex-col md:flex-row",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative z-0 min-h-0 flex-1 isolate",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapView, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-3 md:p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: overlay }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-end justify-between gap-3 pb-7",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "pointer-events-auto max-w-[min(100%,22rem)] rounded-md border border-border bg-card/92 px-2.5 py-1.5 text-[11px] leading-snug text-muted-foreground shadow-sm backdrop-blur-sm",
								children: [
									"Lote I · ",
									r.nRuas,
									" logradouros · ",
									r.nTrechos,
									" trechos · ",
									fmtKmDirect(r.kmRede),
									" ·",
									" ",
									r.nRotas,
									" rotas",
									catalog.periodo.inicio ? ` · GPS ${catalog.periodo.inicio.slice(8)}/${catalog.periodo.inicio.slice(5, 7)}–${catalog.periodo.fim?.slice(8)}/${catalog.periodo.fim?.slice(5, 7)}/${catalog.periodo.fim?.slice(0, 4)}` : ""
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapLegend, {})]
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailPanel, {})]
			}),
			footer
		]
	});
}
//#endregion
export { fmtKmDirect as a, cn as i, Button as n, fold as o, ScrollArea as r, useApp as s, AppFrame as t };
