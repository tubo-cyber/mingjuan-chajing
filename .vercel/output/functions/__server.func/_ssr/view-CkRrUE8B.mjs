import { i as __toESM } from "../_runtime.mjs";
import { u as parentOfArticle } from "./catalog-B1oBBaoq.mjs";
import { B as require_react, _ as Link, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as Star, u as ChevronLeft } from "../_libs/lucide-react.mjs";
import { c as useLibrary, o as Route$4 } from "./router-DNsaCTgr.mjs";
import { n as cn, t as AppShell } from "./app-shell-Bj0CnSBo.mjs";
import { t as ReaderView } from "./reader-view-BJDHl0PP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/view-CkRrUE8B.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ViewPage() {
	const { article, path } = Route$4.useLoaderData();
	const href = `/view?path=${encodeURIComponent(path)}`;
	const pushHistory = useLibrary((s) => s.pushHistory);
	const toggleStar = useLibrary((s) => s.toggleStar);
	const starred = useLibrary((s) => s.stars.some((x) => x.href === href));
	(0, import_react.useEffect)(() => {
		pushHistory({
			href,
			title: article.title
		});
	}, [
		href,
		article.title,
		pushHistory
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
		title: article.title,
		back: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArticleBack, { path }),
		action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: "grid size-11 place-items-center",
			onClick: () => toggleStar({
				href,
				title: article.title
			}),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: cn("size-5", starred ? "fill-accent text-accent" : "text-muted") })
		}),
		children: article.isPdf ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mb-4 text-sm text-muted",
			children: "這是 PDF 檔，請開啟原文閱讀。"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
			href: article.sourceUrl,
			target: "_blank",
			rel: "noreferrer",
			className: "inline-flex min-h-11 items-center rounded-[length:var(--radius-md)] bg-fg px-4 text-sm text-bg",
			children: "開啟 PDF"
		})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReaderView, {
			title: article.title,
			blocks: article.blocks
		})
	});
}
function ArticleBack({ path }) {
	const parent = parentOfArticle(path);
	const cls = "grid size-11 place-items-center";
	const icon = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-5" });
	if (parent.kind === "topic") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/topic/$topicId",
		params: { topicId: parent.topicId },
		className: cls,
		"aria-label": "返回主題",
		children: icon
	});
	if (parent.kind === "topics") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/topics",
		className: cls,
		"aria-label": "返回主題",
		children: icon
	});
	if (parent.kind === "column") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/column/$slug",
		params: { slug: parent.slug },
		className: cls,
		"aria-label": "返回專欄",
		children: icon
	});
	if (parent.kind === "columns") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/columns",
		className: cls,
		"aria-label": "返回專欄",
		children: icon
	});
	if (parent.kind === "book") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/book/$bookId",
		params: { bookId: parent.bookId },
		className: cls,
		"aria-label": "返回書卷",
		children: icon
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/",
		className: cls,
		"aria-label": "返回",
		children: icon
	});
}
//#endregion
export { ViewPage as component };
