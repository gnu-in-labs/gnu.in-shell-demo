#!/usr/bin/env node
"use strict";

const fs = require("fs");
const http = require("http");
const os = require("os");
const path = require("path");

function loadPlaywright() {
  const candidates = [
    "playwright",
    process.env.PLAYWRIGHT_MODULE,
    path.join(os.homedir(), ".cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright")
  ].filter(Boolean);

  const errors = [];
  for (const candidate of candidates) {
    try {
      return require(candidate);
    } catch (error) {
      errors.push(`${candidate}: ${error && error.message ? error.message : String(error)}`);
    }
  }

  console.error("Playwright is required. Install it locally or set PLAYWRIGHT_MODULE.");
  console.error(errors.join("\n"));
  process.exit(2);
}

const { chromium } = loadPlaywright();
const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = process.env.OUT_DIR || path.join(ROOT, "artifacts", "canvas-smoke");

const VIEWPORTS = [
  { name: "desktop", width: 1280, height: 900 },
  { name: "mobile-393", width: 393, height: 852 }
];

const PAGES = [
  { file: "Gnu.In-Shell - Atlas Unifié.dc.html", requiredText: ["Atlas", "gnu.in-OS"] },
  { file: "Gnu.In-Shell - Fondations.dc.html", requiredText: ["Fondations", "tokens"] },
  { file: "Gnu.In-Shell - Atomes.dc.html", requiredText: ["Atomes", "Gnu"] },
  { file: "Gnu.In-Shell - Molécules.dc.html", requiredText: ["CM.18", "AgenticGnuContextMenu", "30 molécules"] },
  { file: "Gnu.In-Shell - Intégration.dc.html", requiredText: ["Settings map", "shell_settings", "Compositor profile"] },
  { file: "Gnu.In-Shell - Handoff.dc.html", requiredText: ["Handoff", "gnu.in-OS"] }
];

const FORBIDDEN_BODY_COPY = [
  /\bQML\b/i,
  /\bdemo\b/i,
  /Démo/i,
  /Auto-demo/i,
  /Current Work/i,
  /Current%20Work/i,
  /frontier/i,
  /wireframe/i,
  /pasted/i
];

const MIME = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml; charset=utf-8",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2"
};

function urlPath(file) {
  return `/${file.split("/").map(encodeURIComponent).join("/")}`;
}

function safeName(file) {
  return file.replace(/\.dc\.html$/i, "").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();
}

function startServer() {
  const server = http.createServer((req, res) => {
    let pathname = "/";
    try {
      pathname = decodeURIComponent(new URL(req.url, "http://127.0.0.1").pathname);
    } catch {
      res.writeHead(400);
      res.end("bad request");
      return;
    }

    const relative = pathname === "/" ? "/Gnu.In-Shell - Index.dc.html" : pathname;
    const filePath = path.normalize(path.join(ROOT, relative));
    if (!filePath.startsWith(ROOT + path.sep)) {
      res.writeHead(403);
      res.end("forbidden");
      return;
    }

    fs.readFile(filePath, (error, data) => {
      if (error) {
        res.writeHead(404);
        res.end("not found");
        return;
      }
      res.writeHead(200, { "content-type": MIME[path.extname(filePath).toLowerCase()] || "application/octet-stream" });
      res.end(data);
    });
  });

  return new Promise((resolve, reject) => {
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      resolve({ server, origin: `http://127.0.0.1:${address.port}` });
    });
  });
}

async function inspect(page, spec, viewport, status, logs) {
  return page.evaluate(async ({ spec, viewport, status, logs, patterns }) => {
    const html = document.documentElement;
    const body = document.body;
    const text = body.innerText || body.textContent || "";
    const regexes = patterns.map((pattern) => new RegExp(pattern.source, pattern.flags));
    const forbidden = regexes.filter((regex) => regex.test(text)).map((regex) => regex.toString());
    const icon = document.querySelector("link[rel~='icon']")?.getAttribute("href") || "";
    let iconStatus = null;
    try {
      iconStatus = await fetch(new URL(icon, location.href)).then((response) => response.status);
    } catch (error) {
      iconStatus = error && error.message ? error.message : String(error);
    }

    const canvasViewport = document.getElementById("gid-canvas-viewport");
    const canvasFrame = document.getElementById("gid-canvas-frame");
    const canvasRect = canvasViewport ? canvasViewport.getBoundingClientRect() : null;
    const frameRect = canvasFrame ? canvasFrame.getBoundingClientRect() : null;
    const screenLabels = [...document.querySelectorAll("[data-screen-label]")].map((node) => node.getAttribute("data-screen-label") || "");
    const brokenImages = [...document.images]
      .filter((img) => !img.complete || img.naturalWidth === 0)
      .map((img) => img.currentSrc || img.src || img.alt);

    return {
      file: spec.file,
      viewport: viewport.name,
      status,
      requiredTextMissing: spec.requiredText.filter((item) => !text.includes(item)),
      forbidden,
      icon,
      iconStatus,
      navExists: Boolean(document.getElementById("gid-nav")),
      railExists: Boolean(document.getElementById("gid-rail")),
      screenLabelCount: screenLabels.length,
      screenLabels,
      overflowX: Math.max(html.scrollWidth, body.scrollWidth) - html.clientWidth,
      brokenImages,
      canvasViewport: canvasRect && {
        top: Math.round(canvasRect.top),
        left: Math.round(canvasRect.left),
        width: Math.round(canvasRect.width),
        height: Math.round(canvasRect.height),
        scrollHeight: canvasViewport.scrollHeight,
        clientHeight: canvasViewport.clientHeight
      },
      canvasFrame: frameRect && {
        width: Math.round(frameRect.width),
        height: Math.round(frameRect.height)
      },
      logs
    };
  }, {
    spec,
    viewport,
    status,
    logs,
    patterns: FORBIDDEN_BODY_COPY.map((regex) => ({ source: regex.source, flags: regex.flags }))
  });
}

function validate(result) {
  const issues = [];
  if (result.status !== 200) issues.push(`status=${result.status}`);
  if (result.requiredTextMissing.length) issues.push(`missingText=${result.requiredTextMissing.join(",")}`);
  if (result.forbidden.length) issues.push(`forbidden=${result.forbidden.join(",")}`);
  if (result.icon !== "assets/symbols/cube.svg" || result.iconStatus !== 200) issues.push(`icon=${result.icon} status=${result.iconStatus}`);
  if (!result.navExists || !result.railExists) issues.push(`nav=${result.navExists} rail=${result.railExists}`);
  if (result.screenLabelCount < 1) issues.push("screen-labels=missing");
  if (result.overflowX > 1) issues.push(`overflowX=${result.overflowX}`);
  if (result.brokenImages.length) issues.push(`brokenImages=${result.brokenImages.join(",")}`);
  if (!result.canvasViewport) issues.push("canvas-viewport=missing");
  else {
    if (result.canvasViewport.height > result.viewportHeight - 70) issues.push(`canvas-height=${result.canvasViewport.height}`);
    if (result.canvasViewport.scrollHeight <= result.canvasViewport.clientHeight) issues.push("canvas-scroll=not-bounded");
  }
  if (result.logs.some((line) => line.startsWith("error") || line.startsWith("pageerror"))) {
    issues.push(`logs=${result.logs.join(" | ")}`);
  }
  return issues;
}

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const { server, origin } = await startServer();
  const browser = await chromium.launch({ headless: true });
  const results = [];

  try {
    for (const viewport of VIEWPORTS) {
      for (const spec of PAGES) {
        const page = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height }, isMobile: viewport.width <= 430 });
        const logs = [];
        page.on("console", (message) => {
          if (["error", "warning"].includes(message.type())) logs.push(`${message.type()}: ${message.text()}`);
        });
        page.on("pageerror", (error) => logs.push(`pageerror: ${error.message}`));
        const response = await page.goto(`${origin}${urlPath(spec.file)}`, { waitUntil: "networkidle" });
        await page.waitForSelector("#gid-nav", { timeout: 5000 });
        await page.waitForSelector("#gid-canvas-viewport", { timeout: 5000 });
        await page.waitForTimeout(250);
        const state = await inspect(page, spec, viewport, response ? response.status() : 0, logs);
        state.viewportHeight = viewport.height;
        state.issues = validate(state);
        results.push(state);
        await page.screenshot({ path: path.join(OUT_DIR, `${viewport.name}-${safeName(spec.file)}.png`), fullPage: false });
        await page.close();
      }
    }
  } finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }

  fs.writeFileSync(path.join(OUT_DIR, "canvas-smoke-results.json"), JSON.stringify(results, null, 2));
  for (const result of results) {
    if (result.issues.length) console.error(`FAIL ${result.viewport} ${result.file}: ${result.issues.join("; ")}`);
    else console.log(`PASS ${result.viewport} ${result.file}`);
  }
  if (results.some((result) => result.issues.length)) process.exit(1);
})().catch((error) => {
  console.error(error && error.stack ? error.stack : error);
  process.exit(1);
});
