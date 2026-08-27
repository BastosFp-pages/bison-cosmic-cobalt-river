import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { i as Search, t as X, u as ChevronDown } from "../_libs/lucide-react.mjs";
import { n as useData } from "./router-D48McRM-.mjs";
import { a as fmtKmDirect, i as cn, o as fold, r as ScrollArea, s as useApp, t as AppFrame } from "./app-frame-DIsk48UC.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-kcCbdCVO.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Input = import_react.forwardRef(({ className, type, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
	type,
	className: cn("flex h-11 w-full rounded-md border border-border bg-card px-3 py-2 text-base text-foreground shadow-none transition-[border-color,box-shadow] duration-150 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", className),
	ref,
	...props
}));
Input.displayName = "Input";
function SearchPanel() {
	const data = useData();
	const query = useApp((s) => s.query);
	const bairro = useApp((s) => s.bairro);
	const streetId = useApp((s) => s.streetId);
	const setQuery = useApp((s) => s.setQuery);
	const setBairro = useApp((s) => s.setBairro);
	const selectStreet = useApp((s) => s.selectStreet);
	const [open, setOpen] = (0, import_react.useState)(false);
	const [bairroOpen, setBairroOpen] = (0, import_react.useState)(false);
	const results = (0, import_react.useMemo)(() => {
		const q = fold(query);
		if (q.length < 2 && !bairro) return [];
		return data.streets.filter((s) => {
			if (bairro && s.bairro !== bairro) return false;
			if (q.length < 2) return true;
			return fold(s.name).includes(q) || fold(s.bairro ?? "").includes(q);
		}).slice(0, 40);
	}, [
		data.streets,
		query,
		bairro
	]);
	const showList = open && (query.length >= 2 || Boolean(bairro));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "pointer-events-auto w-[min(100%,22rem)]",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-xl border border-border bg-card/95 p-3 shadow-md backdrop-blur-sm",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
					className: "mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground",
					children: "Buscar logradouro"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: query,
							onChange: (e) => {
								setQuery(e.target.value);
								setOpen(true);
							},
							onFocus: () => setOpen(true),
							placeholder: "Nome da rua, avenida, travessa…",
							className: "pr-10 pl-9",
							"aria-label": "Nome do logradouro",
							autoComplete: "off"
						}),
						query ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "absolute top-1/2 right-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted",
							onClick: () => {
								setQuery("");
								selectStreet(null);
							},
							"aria-label": "Limpar busca",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
						}) : null
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] font-medium text-muted-foreground",
							children: "Bairro"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "mt-1 flex h-10 w-full items-center justify-between rounded-md border border-border bg-card px-3 text-left text-sm",
							onClick: () => setBairroOpen((v) => !v),
							"aria-expanded": bairroOpen,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "truncate",
								children: bairro ?? "Todos os bairros do Lote I"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: cn("size-4 shrink-0 text-muted-foreground transition-transform", bairroOpen && "rotate-180") })]
						}),
						bairroOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
							className: "mt-1 max-h-40 overflow-auto rounded-md border border-border bg-card",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: cn("flex h-10 w-full items-center px-3 text-left text-sm hover:bg-muted", !bairro && "bg-primary/10"),
								onClick: () => {
									setBairro(null);
									setBairroOpen(false);
								},
								children: "Todos os bairros do Lote I"
							}) }), data.catalog.bairros.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: cn("flex h-10 w-full items-center px-3 text-left text-sm hover:bg-muted", bairro === b && "bg-primary/10"),
								onClick: () => {
									setBairro(b);
									setBairroOpen(false);
									setOpen(true);
								},
								children: b
							}) }, b))]
						}) : null
					]
				}),
				showList ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
					className: "mt-2 h-52 rounded-lg border border-border",
					children: results.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "px-3 py-4 text-sm text-muted-foreground",
						children: [
							"Nenhum logradouro com esse nome",
							bairro ? ` em ${bairro}` : "",
							"."
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "p-1",
						children: results.map((s) => {
							const label = s.name === "SN" || s.name.startsWith("SN") ? "Sem nome cadastrado" : s.name;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => {
									selectStreet(s.id);
									setQuery(s.name);
									setOpen(false);
								},
								className: cn("flex w-full flex-col items-start rounded-md px-3 py-2.5 text-left transition-colors duration-150", streetId === s.id ? "bg-primary/10" : "hover:bg-muted"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-sm font-medium text-foreground",
									children: label
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-xs text-muted-foreground",
									children: [
										s.bairro ?? "Bairro não informado",
										s.distrito ? ` · ${s.distrito} distrito` : "",
										" · ",
										s.n,
										" trechos ·",
										" ",
										fmtKmDirect(s.km)
									]
								})]
							}) }, s.id);
						})
					})
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-xs leading-relaxed text-muted-foreground",
					children: "Homônimos aparecem com o bairro. Escolha a rua e, no mapa, o trecho."
				})
			]
		})
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppFrame, {
		current: "mapa",
		overlay: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchPanel, {}),
		footer: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
			className: "shrink-0 border-t border-border bg-card px-4 py-2.5 text-center text-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/estatisticas",
				className: "font-medium text-primary underline-offset-4 hover:underline",
				children: "Veja mais sobre Estatísticas"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "text-muted-foreground",
				children: [" ", "— faixas horárias modais e compactadores mais frequentes por trecho."]
			})]
		})
	});
}
//#endregion
export { Home as component };
