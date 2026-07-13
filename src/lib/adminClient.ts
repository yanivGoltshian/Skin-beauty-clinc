// Admin CMS client library for Skin Beauty Clinic.
//
// The site is a Next.js static export hosted on GitHub Pages (no serverless).
// Write path:
//   - DEV  : local Node harness (tools/admin-local.mjs) at /__localapi/*
//   - PROD : GitHub Contents API committed directly from the browser with a
//            fine-grained PAT stored in localStorage (single-owner tool).
//
// Everything here runs in the browser ("use client" consumers only).

import type { Site, Homepage, Product, Category } from "@/lib/types";

// ------------------------------------------------------------------ config ---

export const REPO_OWNER = "yanivGoltshian";
export const REPO_NAME = "Skin-beauty-clinc";
export const REPO_BRANCH = "main";

// Friendly passcode gate in front of the PAT screen. Documented in docs/admin.md.
// (Not a real security boundary — the PAT is what authorizes commits.)
export const ADMIN_PASSCODE = "skin2025";

export const PATHS = {
  site: "src/data/site.json",
  homepage: "src/data/homepage.json",
  products: "src/data/products.json",
  categories: "src/data/categories.json",
} as const;

const LS = {
  token: "sbc-admin-pat",
  passOk: "sbc-admin-pass-ok",
  draft: "sbc-admin-draft-v2",
} as const;

// --------------------------------------------------------------- auth store --

export function getToken(): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(LS.token) || "";
}
export function setToken(t: string) {
  window.localStorage.setItem(LS.token, t.trim());
}
export function clearToken() {
  window.localStorage.removeItem(LS.token);
}

export function isPasscodeOk(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(LS.passOk) === "1";
}
export function setPasscodeOk(ok: boolean) {
  if (ok) window.localStorage.setItem(LS.passOk, "1");
  else window.localStorage.removeItem(LS.passOk);
}

// ------------------------------------------------------------- backend probe --

export type Backend = "local" | "github";
let _backend: Backend | null = null;

export async function detectBackend(): Promise<Backend> {
  if (_backend) return _backend;
  try {
    const r = await fetch("/__localapi/health", { cache: "no-store" });
    if (r.ok) {
      const j = await r.json().catch(() => null);
      if (j && j.ok) {
        _backend = "local";
        return _backend;
      }
    }
  } catch {
    /* not running the harness → prod path */
  }
  _backend = "github";
  return _backend;
}

export function cachedBackend(): Backend | null {
  return _backend;
}

// --------------------------------------------------------------- utilities ---

const enc = new TextEncoder();
const dec = new TextDecoder();

export function utf8ToBase64(str: string): string {
  const bytes = enc.encode(str);
  let bin = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(bin);
}

export function base64ToUtf8(b64: string): string {
  const clean = b64.replace(/\s/g, "");
  const bin = atob(clean);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return dec.decode(bytes);
}

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => {
      const res = String(fr.result);
      const comma = res.indexOf(",");
      resolve(comma >= 0 ? res.slice(comma + 1) : res);
    };
    fr.onerror = () => reject(fr.error);
    fr.readAsDataURL(blob);
  });
}

function ghHeaders(): Record<string, string> {
  const token = getToken();
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "Cache-Control": "no-cache",
  };
}

// ----------------------------------------------------------- low-level I/O ---

type ReadResult = { text: string; sha: string | null };

export async function readFileRaw(path: string): Promise<ReadResult> {
  const backend = await detectBackend();
  const bust = `t=${Date.now()}`;

  if (backend === "local") {
    const r = await fetch(`/__localapi/file?path=${encodeURIComponent(path)}&${bust}`, {
      cache: "no-store",
    });
    if (!r.ok) throw new Error(`קריאה נכשלה (${r.status})`);
    const j = await r.json();
    return { text: j.content ?? "", sha: null };
  }

  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}?ref=${REPO_BRANCH}&${bust}`;
  const r = await fetch(url, { headers: ghHeaders(), cache: "no-store" });
  if (r.status === 404) return { text: "", sha: null };
  if (!r.ok) throw new Error(await ghError(r));
  const j = await r.json();
  return { text: j.content ? base64ToUtf8(j.content) : "", sha: j.sha ?? null };
}

async function getSha(path: string): Promise<string | null> {
  const backend = await detectBackend();
  if (backend === "local") return null;
  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}?ref=${REPO_BRANCH}&t=${Date.now()}`;
  const r = await fetch(url, { headers: ghHeaders(), cache: "no-store" });
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(await ghError(r));
  const j = await r.json();
  return j.sha ?? null;
}

async function ghError(r: Response): Promise<string> {
  let detail = "";
  try {
    const j = await r.json();
    detail = j.message || "";
  } catch {
    /* ignore */
  }
  if (r.status === 401) return "אימות נכשל — בדקו את הטוקן (PAT).";
  if (r.status === 403) return "אין הרשאה — ודאו שהטוקן כולל הרשאת Contents: Read and write.";
  if (r.status === 409) return "התנגשות גרסאות — נסו לשמור שוב.";
  return `שגיאת GitHub (${r.status}) ${detail}`.trim();
}

// Write UTF-8 text (JSON). Re-reads sha immediately before PUT (lost-update guard).
async function writeFileText(path: string, text: string, message: string): Promise<void> {
  const backend = await detectBackend();

  if (backend === "local") {
    const r = await fetch("/__localapi/write", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path, contentBase64: utf8ToBase64(text), encoding: "base64" }),
    });
    if (!r.ok) throw new Error(`שמירה נכשלה (${r.status})`);
    return;
  }

  const sha = await getSha(path);
  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`;
  const body: Record<string, unknown> = {
    message,
    content: utf8ToBase64(text),
    branch: REPO_BRANCH,
  };
  if (sha) body.sha = sha;
  const r = await fetch(url, { method: "PUT", headers: ghHeaders(), body: JSON.stringify(body) });
  if (!r.ok) throw new Error(await ghError(r));
}

// Write binary (image/video) from a base64 payload.
export async function writeBinary(path: string, base64: string, message: string): Promise<void> {
  const backend = await detectBackend();

  if (backend === "local") {
    const r = await fetch("/__localapi/write", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path, contentBase64: base64, encoding: "base64" }),
    });
    if (!r.ok) throw new Error(`העלאה נכשלה (${r.status})`);
    return;
  }

  const sha = await getSha(path);
  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`;
  const body: Record<string, unknown> = { message, content: base64, branch: REPO_BRANCH };
  if (sha) body.sha = sha;
  const r = await fetch(url, { method: "PUT", headers: ghHeaders(), body: JSON.stringify(body) });
  if (!r.ok) throw new Error(await ghError(r));
}

// ---------------------------------------------------------- typed JSON I/O ---

export async function readJson<T>(path: string): Promise<T> {
  const { text } = await readFileRaw(path);
  if (!text.trim()) throw new Error(`הקובץ ${path} ריק או לא נמצא`);
  return JSON.parse(text) as T;
}

const pretty = (v: unknown) => JSON.stringify(v, null, 2) + "\n";

// Merge-on-save for object files (homepage.json / site.json): re-read latest,
// overwrite ONLY the top-level keys that changed vs the baseline snapshot.
export async function mergeSaveObject<T extends Record<string, unknown>>(
  path: string,
  baseline: T,
  current: T,
  message: string
): Promise<T> {
  const latest = (await readJson<T>(path)) as Record<string, unknown>;
  const changed: string[] = [];
  for (const k of Object.keys(current)) {
    if (JSON.stringify(current[k]) !== JSON.stringify(baseline[k])) changed.push(k);
  }
  const merged: Record<string, unknown> = { ...latest };
  for (const k of changed) merged[k] = current[k];
  await writeFileText(path, pretty(merged), message);
  return merged as T;
}

// Per-item patch for array files (products.json / categories.json): re-read the
// full array from disk and apply a mutation, then write the whole array back.
export async function patchArray<T>(
  path: string,
  mutate: (arr: T[]) => T[],
  message: string
): Promise<T[]> {
  const latest = await readJson<T[]>(path);
  const next = mutate([...latest]);
  await writeFileText(path, pretty(next), message);
  return next;
}

// Convenience typed loaders
export const loadSite = () => readJson<Site>(PATHS.site);
export const loadHomepage = () => readJson<Homepage>(PATHS.homepage);
export const loadProducts = () => readJson<Product[]>(PATHS.products);
export const loadCategories = () => readJson<Category[]>(PATHS.categories);

// ---------------------------------------------------------- image pipeline ---

export type ProcessOpts = {
  maxW?: number; // max output width (px)
  quality?: number; // 0..1 JPEG quality
  aspect?: number | null; // width/height; when set, crop to this ratio
  focal?: { x: number; y: number }; // 0..1 focal point for cropping
};

function loadImageEl(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // Same-origin assets don't taint the canvas; crossOrigin kept anonymous for safety.
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("טעינת התמונה נכשלה"));
    img.src = src;
  });
}

function renderToBlob(
  img: HTMLImageElement,
  opts: ProcessOpts
): Promise<{ blob: Blob; width: number; height: number }> {
  const { maxW = 1600, quality = 0.85, aspect = null, focal = { x: 0.5, y: 0.5 } } = opts;
  const sw = img.naturalWidth;
  const sh = img.naturalHeight;

  // Source crop rectangle (cover the target aspect around the focal point).
  let sx = 0;
  let sy = 0;
  let cw = sw;
  let ch = sh;
  if (aspect && aspect > 0) {
    const srcAspect = sw / sh;
    if (srcAspect > aspect) {
      // too wide → crop width
      cw = Math.round(sh * aspect);
      ch = sh;
      sx = Math.round((sw - cw) * clamp01(focal.x));
    } else {
      // too tall → crop height
      cw = sw;
      ch = Math.round(sw / aspect);
      sy = Math.round((sh - ch) * clamp01(focal.y));
    }
  }

  // Output dimensions (respect maxW, never upscale).
  let outW = Math.min(cw, maxW);
  let outH = Math.round((outW / cw) * ch);
  if (!isFinite(outH) || outH <= 0) {
    outW = cw;
    outH = ch;
  }

  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#ffffff"; // flatten transparency
  ctx.fillRect(0, 0, outW, outH);
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, sx, sy, cw, ch, 0, 0, outW, outH);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve({ blob, width: outW, height: outH }) : reject(new Error("עיבוד נכשל"))),
      "image/jpeg",
      quality
    );
  });
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

// Optimize a freshly-selected File → JPEG blob (+ base64 + local preview URL).
export async function processImageFile(
  file: File,
  opts: ProcessOpts
): Promise<{ blob: Blob; base64: string; previewUrl: string; width: number; height: number }> {
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImageEl(url);
    const { blob, width, height } = await renderToBlob(img, opts);
    const base64 = await blobToBase64(blob);
    return { blob, base64, previewUrl: URL.createObjectURL(blob), width, height };
  } finally {
    URL.revokeObjectURL(url);
  }
}

// Re-crop an already-deployed image (same-origin) to a new focal point/aspect.
export async function recropExisting(
  displaySrc: string,
  opts: ProcessOpts
): Promise<{ blob: Blob; base64: string; previewUrl: string }> {
  const img = await loadImageEl(displaySrc);
  const { blob } = await renderToBlob(img, opts);
  const base64 = await blobToBase64(blob);
  return { blob, base64, previewUrl: URL.createObjectURL(blob) };
}

// Raw (unoptimized) upload for video files — size-guarded, no canvas.
export async function processVideoFile(file: File): Promise<{ base64: string; previewUrl: string }> {
  const base64 = await blobToBase64(file);
  return { base64, previewUrl: URL.createObjectURL(file) };
}

// -------------------------------------------------------------- draft store --

export type Draft = {
  ts: number;
  site?: Site;
  homepage?: Homepage;
  products?: Product[];
  categories?: Category[];
};

export function saveDraft(d: Omit<Draft, "ts">) {
  try {
    window.localStorage.setItem(LS.draft, JSON.stringify({ ...d, ts: Date.now() }));
  } catch {
    /* quota — ignore */
  }
}
export function loadDraft(): Draft | null {
  try {
    const raw = window.localStorage.getItem(LS.draft);
    return raw ? (JSON.parse(raw) as Draft) : null;
  } catch {
    return null;
  }
}
export function clearDraft() {
  window.localStorage.removeItem(LS.draft);
}
