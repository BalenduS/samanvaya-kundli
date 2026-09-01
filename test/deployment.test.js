import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

test("manifest exposes installable PWA identity and available icons", async () => {
  const manifest = JSON.parse(await readFile(new URL("../manifest.webmanifest", import.meta.url), "utf8"));
  assert.equal(manifest.display, "standalone");
  assert.equal(manifest.start_url, "/");
  assert.ok(manifest.icons.some((icon) => icon.sizes === "192x192"));
  assert.ok(manifest.icons.some((icon) => icon.sizes === "512x512"));
  await Promise.all(manifest.icons.map((icon) => access(new URL(`..${icon.src}`, import.meta.url))));
});

test("service worker caches the complete local application shell", async () => {
  const worker = await readFile(new URL("../sw.js", import.meta.url), "utf8");
  for (const asset of ["/", "/styles.css", "/app.js", "/calculations.js", "/manifest.webmanifest", "/icons/icon-192.png", "/icons/icon-512.png"]) {
    assert.ok(worker.includes(`\"${asset}\"`), `${asset} should be precached`);
  }
  assert.match(worker, /caches\.match\("\/"\)/);
});

test("install UI is event-gated on Chromium and instructional on iOS", async () => {
  const app = await readFile(new URL("../app.js", import.meta.url), "utf8");
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  assert.match(app, /beforeinstallprompt/);
  assert.match(app, /installPrompt\.prompt\(\)/);
  assert.match(app, /isIos && !isStandalone/);
  assert.match(html, /Add to Home Screen/);
  assert.match(html, /id="installButton"[^>]*hidden/);
});

test("Vercel configuration keeps the service worker revalidated", async () => {
  const config = JSON.parse(await readFile(new URL("../vercel.json", import.meta.url), "utf8"));
  assert.equal(config.cleanUrls, true);
  const workerHeaders = config.headers.find((entry) => entry.source === "/sw.js")?.headers;
  assert.ok(workerHeaders);
  assert.ok(workerHeaders.some((header) => header.key === "Cache-Control" && header.value.includes("must-revalidate")));
  assert.ok(workerHeaders.some((header) => header.key === "Service-Worker-Allowed" && header.value === "/"));
});
