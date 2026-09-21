import { a as ORIGIN } from "./catalog-B1oBBaoq.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/fetch-source.server-BFn5CBpH.js
var ENTITIES = {
	nbsp: " ",
	amp: "&",
	lt: "<",
	gt: ">",
	quot: "\"",
	apos: "'",
	ndash: "–",
	mdash: "—",
	hellip: "…",
	lsquo: "‘",
	rsquo: "’",
	ldquo: "“",
	rdquo: "”"
};
function decodeEntities(s) {
	return s.replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16))).replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d))).replace(/&([a-zA-Z]+);/g, (_, n) => ENTITIES[n] ?? `&${n};`);
}
function decodePage(buf) {
	const bytes = new Uint8Array(buf);
	const utf8 = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
	const sniff = utf8.slice(0, 4e3);
	const charset = /charset\s*=\s*["']?([\w-]+)/i.exec(sniff)?.[1]?.toLowerCase() ?? "";
	const tryDec = (label) => {
		try {
			return new TextDecoder(label).decode(bytes);
		} catch {
			return null;
		}
	};
	const quality = (s) => {
		if (!s) return {
			s: "",
			cjk: 0,
			bad: 1e9,
			score: -0xe8d4a51000
		};
		const cjk = (s.match(/[\u4e00-\u9fff]/g) ?? []).length;
		const bad = (s.match(/\uFFFD/g) ?? []).length;
		const ents = (s.match(/&#(?:x[0-9a-fA-F]+|\d+);/gi) ?? []).length;
		return {
			s,
			cjk,
			bad,
			score: cjk * 2 + ents - bad * 80
		};
	};
	const candidates = [];
	const add = (s, bonus = 0) => {
		const q = quality(s);
		if (!s) return;
		candidates.push({
			...q,
			score: q.score + bonus
		});
	};
	add(utf8);
	if (charset.includes("big5")) add(tryDec("big5"), 400);
	else if (charset.includes("gb2312") || charset.includes("gbk") || charset.includes("gb18030")) add(tryDec("gbk"), 400);
	else if (charset.includes("1252") || charset.includes("8859") || charset.includes("latin")) add(tryDec("windows-1252") ?? tryDec("iso-8859-1") ?? tryDec("latin1"), 500);
	const utfQ = quality(utf8);
	if (utfQ.bad === 0 && utfQ.cjk > 20 && !charset.includes("big5") && !charset.includes("gb")) return utf8;
	if (utfQ.bad > 0) {
		if (!charset.includes("big5")) add(tryDec("big5"));
		add(tryDec("windows-1252") ?? tryDec("latin1"));
	}
	candidates.sort((a, b) => b.score - a.score || a.bad - b.bad);
	return candidates[0]?.s ?? utf8;
}
function stripJunk(html) {
	let s = html.replace(/<!--[\s\S]*?-->/g, "").replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<xml[\s\S]*?<\/xml>/gi, "").replace(/<\/?(?:o|v|w|m|st1):[^>]*>/gi, "");
	for (let i = 0; i < 8; i++) {
		const next = s.replace(/<([a-z][a-z0-9]*)\b[^>]*(?:mso-hide\s*:\s*all|display\s*:\s*none)[^>]*>[\s\S]*?<\/\1>/gi, "");
		if (next === s) break;
		s = next;
	}
	return s;
}
function cleanReaderText(text) {
	return text.replace(/\{\\?Section:[^}]*\}/gi, "").replace(/\{\\?ShowRefList\}/gi, "").replace(/\{\\?[A-Za-z][A-Za-z0-9]*[^}]*\}/g, "").replace(/\uFFFD+/g, "").replace(/[ \t\u00a0]+/g, " ").trim();
}
function extractLinks(html, basePath) {
	const body = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)?.[1] ?? html;
	const links = [];
	const seen = /* @__PURE__ */ new Set();
	const re = /<a\s[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
	let m;
	while (m = re.exec(body)) {
		let href = m[1].trim();
		if (!href || href.startsWith("javascript:") || href.startsWith("#") || href.startsWith("mailto:")) continue;
		const text = decodeEntities(m[2].replace(/<[^>]+>/g, "").replace(/\s+/g, " ")).replace(/\uFFFD+/g, "").trim();
		if (!text) continue;
		if (/返回|首頁|首页|簡體|简体|繁體|繁体|^EN$/.test(text) && text.length < 16) continue;
		if (/^https?:/i.test(href) && !href.includes("ccbiblestudy.org")) continue;
		href = href.replace(/^https?:\/\/(?:www\.)?ccbiblestudy\.org\//i, "");
		if (href.startsWith("../") || !href.includes("/")) href = resolveRelative(basePath, href);
		href = href.split("?")[0];
		if (seen.has(href + text)) continue;
		seen.add(href + text);
		links.push({
			href,
			text,
			pdf: /\.pdf$/i.test(href)
		});
	}
	return links;
}
function resolveRelative(basePath, href) {
	const clean = href.replace(/^\.\//, "");
	const dir = basePath.replace(/\/[^/]+$/, "/");
	if (clean.startsWith("../") || clean.includes("/../")) {
		const parts = dir.split("/").filter(Boolean);
		const segs = clean.split("/");
		for (const s of segs) if (s === "..") parts.pop();
		else if (s && s !== ".") parts.push(s);
		return parts.join("/");
	}
	return dir + clean;
}
/** 原站目錄頁用 BOOK_CONFIG.books 列出電子書／地圖／圖表，不是 <a> 連結。 */
function extractEbooks(html, basePath) {
	const m = html.match(/"books"\s*:\s*\[([\s\S]*?)\]\s*[,}]/);
	if (!m) return [];
	const arr = m[1];
	const out = [];
	const seen = /* @__PURE__ */ new Set();
	for (const item of arr.matchAll(/\{[^{}]+\}/g)) {
		const block = item[0];
		const at = item.index ?? 0;
		const lineStart = arr.lastIndexOf("\n", at);
		if (arr.slice(lineStart + 1, at).includes("//")) continue;
		const title = /"title"\s*:\s*"([^"]+)"/.exec(block)?.[1];
		if (!title) continue;
		const author = /"author"\s*:\s*"([^"]*)"/.exec(block)?.[1] ?? "";
		const hrefRaw = /"href"\s*:\s*"([^"]+)"/.exec(block)?.[1];
		const pending = (/"status"\s*:\s*"([^"]+)"/.exec(block)?.[1] ?? "") === "not-ready" || !hrefRaw;
		const href = hrefRaw ? resolveRelative(basePath, hrefRaw) : "";
		const key = href || title;
		if (seen.has(key)) continue;
		seen.add(key);
		out.push({
			href,
			text: author ? `${title} · ${author}` : title,
			pdf: /\.pdf$/i.test(hrefRaw ?? ""),
			pending
		});
	}
	return out;
}
var SKIP_LINE = /返回首頁|返回首页|返回本書|返回本书|返回講道|返回讲道|返回本|個人專欄|个人专栏/;
var LABELS = "呂振中譯|吕振中译|原文直譯|原文直译|原文字義|原文字义|背景註解|背景注解|文意註解|文意注解|靈意註解|灵意注解|問題改正|问题改正|話中之光|话中之光|串珠";
function isVerseRef(ref) {
	const t = ref.replace(/\s+/g, "");
	if (!t || t.length > 18) return false;
	return /[0-9０-９一二三四五六七八九十零百]/.test(t);
}
function splitVerseChunks(line) {
	if (!line) return [];
	if (!line.includes("【") || line.startsWith("【")) return [line];
	const parts = [];
	const re = /【[^】]{0,18}】/g;
	let last = 0;
	let m;
	while (m = re.exec(line)) {
		if (!isVerseRef(m[0].slice(1, -1))) continue;
		if (m.index > last) {
			const before = line.slice(last, m.index).trim();
			if (before) parts.push(before);
		}
		last = m.index;
	}
	if (last === 0) return [line];
	parts.push(line.slice(last).trim());
	return parts.filter(Boolean);
}
function parseArticle(html, fallbackTitle) {
	const raw = stripJunk(html);
	const lines = decodeEntities((raw.match(/<body[^>]*>([\s\S]*)<\/body>/i)?.[1] ?? raw).replace(/<br\s*\/?>/gi, "\n").replace(/<\/p>/gi, "\n").replace(/<p(?:\s[^>]*)?>/gi, "\n").replace(/<\/h[1-6]>/gi, "\n").replace(/<h[1-6](?:\s[^>]*)?>/gi, "\n").replace(/<\/div>/gi, "\n").replace(/<\/tr>/gi, "\n").replace(/<\/li>/gi, "\n").replace(/<[^>]+>/g, " ")).split(/\n+/).flatMap((l) => splitVerseChunks(cleanReaderText(l))).filter((l) => l.length > 0 && !SKIP_LINE.test(l) && !/^[|〔〕﹝﹞【】\s]+$/.test(l));
	const blocks = [];
	let title = fallbackTitle;
	let tookTitle = false;
	const labelRe = new RegExp(`^[〔﹝【\\[]?(${LABELS})[〕﹞】\\]]?`);
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		if (!tookTitle && line.length < 48 && /(註解|注解|拾穗|例證|例证|信息|綱目|纲目|第.+[章篇])/.test(line)) {
			title = line.replace(/^[〔﹝]|[〕﹞]$/g, "");
			blocks.push({
				t: "title",
				text: title
			});
			tookTitle = true;
			continue;
		}
		const verseOnly = line.match(/^【([^】]*)】\s*(.*)$/);
		if (verseOnly && isVerseRef(verseOnly[1])) {
			let quote = verseOnly[2].replace(/^[「『"]/, "").replace(/[」』"]$/, "").trim();
			if (!quote && lines[i + 1] && /^[「『"]/.test(lines[i + 1])) {
				quote = lines[i + 1].replace(/^[「『"]/, "").replace(/[」』"]$/, "").trim();
				i += 1;
			}
			blocks.push({
				t: "verse",
				ref: verseOnly[1].replace(/\s+/g, ""),
				quote: quote || void 0
			});
			continue;
		}
		if (/^[壹貳參叁肆伍陸柒捌玖拾]+、/.test(line)) {
			blocks.push({
				t: "h",
				text: line
			});
			continue;
		}
		const lab = labelRe.exec(line);
		if (lab) {
			const rest = line.slice(lab[0].length).trim().replace(/^「/, "").replace(/」$/, "").trim();
			if (!rest || /^[「」"'：:\s（）()一二三四五六七八九十、.．]+$/.test(rest)) continue;
			blocks.push({
				t: "note",
				label: lab[1],
				text: rest
			});
			continue;
		}
		if (line.length < 2) continue;
		blocks.push({
			t: "p",
			text: line
		});
	}
	if (!tookTitle) blocks.unshift({
		t: "title",
		text: fallbackTitle
	});
	return {
		title,
		blocks
	};
}
var ALLOW = /^(Old Testament|New Testament|Topics|individual|intro|index-|Reference)/i;
function assertSafePath(path) {
	let p = path.replace(/^\/+/, "").replace(/\\/g, "/");
	try {
		p = decodeURIComponent(p);
	} catch {}
	if (p.includes("..") || /^(https?:)?\/\//i.test(p) || p.includes("\\")) throw new Error("不合法的路徑");
	if (!ALLOW.test(p)) throw new Error("不合法的路徑");
	if (!/\.(htm|html|pdf)$/i.test(p) && !/index/i.test(p)) throw new Error("不合法的路徑");
	return p;
}
function encodePath(path) {
	return path.split("/").map((seg) => encodeURIComponent(seg)).join("/");
}
/** 以賽亞／耶利米／以西結章註解 C↔A 互換。 */
function fallbackPaths(path) {
	const m = (path.split("/").pop() ?? "").match(/^(\d{2})([CA])([TSE])(\d+\.(?:htm|html|pdf))$/i);
	if (!m) return [path];
	const altLetter = m[2].toUpperCase() === "C" ? "A" : "C";
	const altName = `${m[1]}${altLetter}${m[3]}${m[4]}`;
	const alt = path.replace(/[^/]+$/, altName);
	return alt === path ? [path] : [path, alt];
}
var cache = /* @__PURE__ */ new Map();
var TTL = 9e5;
function cached(key, fn) {
	const hit = cache.get(key);
	if (hit && Date.now() - hit.at < TTL) return Promise.resolve(hit.value);
	return fn().then((value) => {
		const status = value.status;
		if (status && status >= 400) return value;
		cache.set(key, {
			at: Date.now(),
			value
		});
		return value;
	});
}
async function fetchHtml(path) {
	const url = `${ORIGIN}/${encodePath(path)}`;
	const res = await fetch(url, {
		headers: {
			"User-Agent": "MingJuanBibleReader/1.0",
			Accept: "text/html"
		},
		redirect: "follow"
	});
	if (!res.ok) return {
		ok: false,
		status: res.status,
		url
	};
	return {
		ok: true,
		status: res.status,
		url,
		buf: await res.arrayBuffer()
	};
}
async function fetchArticle(path, fallbackTitle) {
	const safe = assertSafePath(path);
	return cached(`a3:${safe}`, async () => {
		if (/\.pdf$/i.test(safe)) return {
			title: fallbackTitle,
			blocks: [],
			sourceUrl: `${ORIGIN}/${encodePath(safe)}`,
			isPdf: true,
			status: 200
		};
		let lastStatus = 404;
		let lastUrl = `${ORIGIN}/${encodePath(safe)}`;
		for (const p of fallbackPaths(safe)) {
			const got = await fetchHtml(p);
			lastStatus = got.status;
			lastUrl = got.url;
			if (!got.ok || !got.buf) continue;
			const parsed = parseArticle(decodePage(got.buf), fallbackTitle);
			return {
				title: parsed.title,
				blocks: parsed.blocks,
				sourceUrl: got.url,
				isPdf: false,
				status: 200
			};
		}
		return {
			title: fallbackTitle,
			blocks: [{
				t: "p",
				text: `原文頁面暫時無法取得（${lastStatus}）。可改試其他章節或資料類型。`
			}],
			sourceUrl: lastUrl,
			isPdf: false,
			status: lastStatus
		};
	});
}
async function fetchIndex(path, fallbackTitle) {
	const safe = assertSafePath(path);
	return cached(`i3:${safe}`, async () => {
		const url = `${ORIGIN}/${encodePath(safe)}`;
		const res = await fetch(url, {
			headers: {
				"User-Agent": "MingJuanBibleReader/1.0",
				Accept: "text/html"
			},
			redirect: "follow"
		});
		if (!res.ok) return {
			title: fallbackTitle,
			links: [],
			sourceUrl: url,
			status: res.status
		};
		const html = decodePage(await res.arrayBuffer());
		const fromAnchors = extractLinks(html, safe);
		const fromConfig = extractEbooks(html, safe);
		const seen = new Set(fromAnchors.map((l) => l.href + l.text));
		const links = [...fromAnchors];
		for (const l of fromConfig) {
			const key = l.href + l.text;
			if (seen.has(key)) continue;
			seen.add(key);
			links.push(l);
		}
		return {
			title: fallbackTitle,
			links,
			sourceUrl: url,
			status: 200
		};
	});
}
//#endregion
export { fetchArticle, fetchIndex };
