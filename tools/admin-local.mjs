// Local admin dev harness for Skin Beauty Clinic.
//
// Why this exists: the site uses `output: "export"`, so Next.js route handlers
// under src/app/api break the static export build. Instead this standalone Node
// server gives the /admin SPA a local write API during development:
//
//   GET  /__localapi/health              -> { ok: true }
//   GET  /__localapi/file?path=<repo/rel> -> { content: "<utf8>" }
//   POST /__localapi/write { path, contentBase64 } -> writes bytes to disk
//
// Everything else (including HMR websockets) is proxied to `next dev` on :3000.
//
// Run:  npm run admin      then open  http://localhost:8787/admin/
//
// Security: dev-only. Only paths under src/data/ and public/ may be written.

import http from "node:http";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import net from "node:net";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");

const PORT = Number(process.env.ADMIN_PORT || 8787);
const NEXT_PORT = Number(process.env.NEXT_PORT || 3000);
const NEXT_HOST = "127.0.0.1";

const WRITABLE_PREFIXES = ["src/data/", "public/"];

// ----------------------------------------------------------------- helpers ---

function safeResolve(relPath) {
  const clean = String(relPath || "").replace(/^\/+/, "");
  const abs = path.resolve(REPO_ROOT, clean);
  if (abs !== REPO_ROOT && !abs.startsWith(REPO_ROOT + path.sep)) {
    throw new Error("path escapes repo root");
  }
  return { abs, rel: path.relative(REPO_ROOT, abs).split(path.sep).join("/") };
}

function json(res, code, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(code, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store, no-cache, must-revalidate",
    "Access-Control-Allow-Origin": "*",
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function waitForPort(port, host, timeoutMs) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const tryOnce = () => {
      const sock = net.connect(port, host);
      sock.on("connect", () => {
        sock.destroy();
        resolve();
      });
      sock.on("error", () => {
        sock.destroy();
        if (Date.now() - start > timeoutMs) reject(new Error("next dev did not start in time"));
        else setTimeout(tryOnce, 400);
      });
    };
    tryOnce();
  });
}

// --------------------------------------------------------------- local API ---

async function handleLocalApi(req, res, url) {
  if (url.pathname === "/__localapi/health") {
    return json(res, 200, { ok: true, root: REPO_ROOT });
  }

  if (url.pathname === "/__localapi/file" && req.method === "GET") {
    try {
      const { abs, rel } = safeResolve(url.searchParams.get("path"));
      if (!fs.existsSync(abs)) return json(res, 404, { error: "not found", path: rel });
      const content = fs.readFileSync(abs, "utf8");
      return json(res, 200, { content, path: rel });
    } catch (e) {
      return json(res, 400, { error: String(e.message || e) });
    }
  }

  if (url.pathname === "/__localapi/write" && req.method === "POST") {
    try {
      const raw = await readBody(req);
      const { path: relPath, contentBase64 } = JSON.parse(raw.toString("utf8"));
      const { abs, rel } = safeResolve(relPath);
      if (!WRITABLE_PREFIXES.some((p) => rel.startsWith(p))) {
        return json(res, 403, { error: `כתיבה מותרת רק ל- ${WRITABLE_PREFIXES.join(", ")}` });
      }
      fs.mkdirSync(path.dirname(abs), { recursive: true });
      fs.writeFileSync(abs, Buffer.from(String(contentBase64 || ""), "base64"));
      console.log(`  \u270E wrote ${rel}`);
      return json(res, 200, { ok: true, path: rel });
    } catch (e) {
      return json(res, 400, { error: String(e.message || e) });
    }
  }

  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    return res.end();
  }

  return json(res, 404, { error: "unknown local api route" });
}

// ------------------------------------------------------------------ proxy ----

function proxyToNext(req, res) {
  const opts = {
    host: NEXT_HOST,
    port: NEXT_PORT,
    method: req.method,
    path: req.url,
    headers: { ...req.headers, host: `${NEXT_HOST}:${NEXT_PORT}` },
  };
  const proxyReq = http.request(opts, (proxyRes) => {
    res.writeHead(proxyRes.statusCode || 502, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });
  proxyReq.on("error", (err) => {
    res.writeHead(502, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Dev server not ready: " + err.message);
  });
  req.pipe(proxyReq, { end: true });
}

// ------------------------------------------------------------------- boot ----

async function main() {
  console.log("\u25B6 starting next dev on :" + NEXT_PORT + " …");
  const child = spawn("npx", ["next", "dev", "-p", String(NEXT_PORT)], {
    cwd: REPO_ROOT,
    stdio: "inherit",
    env: { ...process.env },
    shell: process.platform === "win32",
  });
  child.on("exit", (code) => {
    console.log("next dev exited (" + code + ")");
    process.exit(code || 0);
  });

  const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    if (url.pathname.startsWith("/__localapi/")) return handleLocalApi(req, res, url);
    return proxyToNext(req, res);
  });

  // Proxy websocket upgrades (Next.js HMR) so live reload works through :8787.
  server.on("upgrade", (req, socket, head) => {
    const proxyReq = http.request({
      host: NEXT_HOST,
      port: NEXT_PORT,
      method: req.method,
      path: req.url,
      headers: req.headers,
    });
    proxyReq.on("upgrade", (proxyRes, proxySocket) => {
      socket.write(
        "HTTP/1.1 101 Switching Protocols\r\n" +
          Object.entries(proxyRes.headers)
            .map(([k, v]) => `${k}: ${v}`)
            .join("\r\n") +
          "\r\n\r\n"
      );
      proxySocket.write(head);
      proxySocket.pipe(socket);
      socket.pipe(proxySocket);
    });
    proxyReq.on("error", () => socket.destroy());
    proxyReq.end();
  });

  try {
    await waitForPort(NEXT_PORT, NEXT_HOST, 60000);
  } catch (e) {
    console.warn("\u26A0 " + e.message + " (proxy will retry per-request)");
  }

  server.listen(PORT, () => {
    console.log("\n──────────────────────────────────────────────");
    console.log("  Admin harness ready");
    console.log("  \u2192 open  http://localhost:" + PORT + "/admin/");
    console.log("  local write API at /__localapi/*");
    console.log("──────────────────────────────────────────────\n");
  });
}

process.on("SIGINT", () => process.exit(0));
process.on("SIGTERM", () => process.exit(0));

main();
