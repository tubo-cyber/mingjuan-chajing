import { ORIGIN } from "./catalog";
import {
  decodePage,
  extractEbooks,
  extractLinks,
  parseArticle,
  type Block,
  type IndexLink,
} from "./parse-html";

const ALLOW =
  /^(Old Testament|New Testament|Topics|individual|intro|index-|Reference)/i;

export function assertSafePath(path: string): string {
  let p = path.replace(/^\/+/, "").replace(/\\/g, "/");
  try {
    p = decodeURIComponent(p);
  } catch {
    /* keep */
  }
  if (p.includes("..") || /^(https?:)?\/\//i.test(p) || p.includes("\\")) {
    throw new Error("不合法的路徑");
  }
  if (!ALLOW.test(p)) {
    throw new Error("不合法的路徑");
  }
  if (!/\.(htm|html|pdf)$/i.test(p) && !/index/i.test(p)) {
    throw new Error("不合法的路徑");
  }
  return p;
}

function encodePath(path: string): string {
  return path
    .split("/")
    .map((seg) => encodeURIComponent(seg))
    .join("/");
}

/** 以賽亞／耶利米／以西結章註解 C↔A 互換。 */
function fallbackPaths(path: string): string[] {
  const name = path.split("/").pop() ?? "";
  const m = name.match(/^(\d{2})([CA])([TSE])(\d+\.(?:htm|html|pdf))$/i);
  if (!m) return [path];
  const altLetter = m[2].toUpperCase() === "C" ? "A" : "C";
  const altName = `${m[1]}${altLetter}${m[3]}${m[4]}`;
  const alt = path.replace(/[^/]+$/, altName);
  return alt === path ? [path] : [path, alt];
}

type CacheEntry = { at: number; value: unknown };
const cache = new Map<string, CacheEntry>();
const TTL = 1000 * 60 * 15;

function cached<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL) return Promise.resolve(hit.value as T);
  return fn().then((value) => {
    const status = (value as { status?: number }).status;
    if (status && status >= 400) return value;
    cache.set(key, { at: Date.now(), value });
    return value;
  });
}

export type ArticlePayload = {
  title: string;
  blocks: Block[];
  sourceUrl: string;
  isPdf: boolean;
  status: number;
};

async function fetchHtml(path: string): Promise<{ ok: boolean; status: number; url: string; buf?: ArrayBuffer }> {
  const url = `${ORIGIN}/${encodePath(path)}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "MingJuanBibleReader/1.0", Accept: "text/html" },
    redirect: "follow",
  });
  if (!res.ok) return { ok: false, status: res.status, url };
  return { ok: true, status: res.status, url, buf: await res.arrayBuffer() };
}

export async function fetchArticle(path: string, fallbackTitle: string): Promise<ArticlePayload> {
  const safe = assertSafePath(path);
  return cached(`a3:${safe}`, async () => {
    const isPdf = /\.pdf$/i.test(safe);
    if (isPdf) {
      return {
        title: fallbackTitle,
        blocks: [],
        sourceUrl: `${ORIGIN}/${encodePath(safe)}`,
        isPdf: true,
        status: 200,
      } satisfies ArticlePayload;
    }
    let lastStatus = 404;
    let lastUrl = `${ORIGIN}/${encodePath(safe)}`;
    for (const p of fallbackPaths(safe)) {
      const got = await fetchHtml(p);
      lastStatus = got.status;
      lastUrl = got.url;
      if (!got.ok || !got.buf) continue;
      const html = decodePage(got.buf);
      const parsed = parseArticle(html, fallbackTitle);
      return {
        title: parsed.title,
        blocks: parsed.blocks,
        sourceUrl: got.url,
        isPdf: false,
        status: 200,
      } satisfies ArticlePayload;
    }
    return {
      title: fallbackTitle,
      blocks: [{ t: "p", text: `原文頁面暫時無法取得（${lastStatus}）。可改試其他章節或資料類型。` }],
      sourceUrl: lastUrl,
      isPdf: false,
      status: lastStatus,
    } satisfies ArticlePayload;
  });
}

export type IndexPayload = {
  title: string;
  links: IndexLink[];
  sourceUrl: string;
  status: number;
};

export async function fetchIndex(path: string, fallbackTitle: string): Promise<IndexPayload> {
  const safe = assertSafePath(path);
  return cached(`i3:${safe}`, async () => {
    const url = `${ORIGIN}/${encodePath(safe)}`;
    const res = await fetch(url, {
      headers: { "User-Agent": "MingJuanBibleReader/1.0", Accept: "text/html" },
      redirect: "follow",
    });
    if (!res.ok) {
      return { title: fallbackTitle, links: [], sourceUrl: url, status: res.status };
    }
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
    return { title: fallbackTitle, links, sourceUrl: url, status: 200 };
  });
}
