// Tenor-compatible KLIPY v2, GIFs only. No persistent data or third-party SDK.
export const KLIPY_ID = /^\d{1,32}$/;
export const KLIPY_MARKER = /^\[gifrift:k:(\d{1,32})\]$/;
const API_ROOT = "https://api.klipy.com/v2/";
const FORMATS = "gif,tinygif";
const PAGE_SIZE = 12;

export function parseKlipyMarker(text) {
  return typeof text === "string" ? (KLIPY_MARKER.exec(text)?.[1] ?? null) : null;
}

function media(format, maxBytes) {
  if (!format || typeof format.url !== "string") return null;
  let url;
  try { url = new URL(format.url); } catch { return null; }
  if (url.protocol !== "https:" || url.hostname !== "static.klipy.com" || url.username || url.password) return null;
  if (!url.pathname.toLowerCase().endsWith(".gif")) return null;
  if (!Number.isSafeInteger(format.size) || format.size < 1 || format.size > maxBytes) return null;
  if (!Array.isArray(format.dims) || format.dims.length !== 2 ||
      !format.dims.every(n => Number.isSafeInteger(n) && n >= 1 && n <= 1600)) return null;
  return { url: format.url, width: format.dims[0], height: format.dims[1], size: format.size };
}

export function normalizeKlipy(item) {
  if (!item || typeof item.id !== "string" || !KLIPY_ID.test(item.id)) return null;
  if (typeof item.flags === "string" && /(?:^|,)(?:static|sticker)(?:,|$)/i.test(item.flags)) return null;
  const preview = media(item.media_formats?.tinygif, 1_000_000);
  const full = media(item.media_formats?.gif, 2_097_152);
  const display = full ?? preview;
  if (!preview || !display) return null;
  return {
    id: item.id,
    title: String(item.content_description || item.title || "GIF KLIPY").slice(0, 120),
    preview: preview.url,
    media: display.url,
    width: display.width,
    height: display.height,
    source: typeof item.content_description_source === "string" ? item.content_description_source.slice(0, 80) : ""
  };
}

export function createKlipyClient(key, fetcher = fetch) {
  async function request(route, options) {
    if (typeof key !== "string" || key.length < 8 || key === "REPLACE_WITH_KLIPY_APP_KEY") return { error: "missing-key" };
    const params = new URLSearchParams({
      key, media_filter: FORMATS
    });
    if (route !== "posts") {
      params.set("limit", String(PAGE_SIZE));
      params.set("contentfilter", "medium");
    }
    for (const [name, value] of Object.entries(options)) params.set(name, value);
    try {
      const response = await fetcher(API_ROOT + route + "?" + params, {
        signal: AbortSignal.timeout(8000),
        cache: "no-store",
        referrerPolicy: "no-referrer"
      });
      if (response.status === 401 || response.status === 403) return { error: "invalid-key" };
      if (response.status === 429) return { error: "rate-limit" };
      if (!response.ok) return { error: "unavailable" };
      const body = await response.json();
      if (!Array.isArray(body.results)) return { error: "malformed-response" };
      return {
        gifs: body.results.map(normalizeKlipy).filter(Boolean),
        next: typeof body.next === "string" && body.next.length <= 160 ? body.next : ""
      };
    } catch {
      return { error: "network" };
    }
  }
  function browse(query, pos = "") {
    if (typeof query !== "string" || query.length > 80 ||
        typeof pos !== "string" || pos.length > 160 ||
        (pos && !/^[A-Za-z0-9_~.+=/:-]+$/.test(pos))) {
      return Promise.resolve({ error: "invalid-query" });
    }
    const args = {};
    if (pos) args.pos = pos;
    if (query.trim()) {
      args.q = query;
      return request("search", args);
    }
    return request("featured", args);
  }
  function resolve(ids) {
    if (!Array.isArray(ids) || ids.length < 1 || ids.length > 6 ||
        !ids.every(id => typeof id === "string" && KLIPY_ID.test(id))) {
      return Promise.resolve({ error: "invalid-ids" });
    }
    return request("posts", { ids: [...new Set(ids)].join(",") });
  }
  return { browse, resolve };
}
