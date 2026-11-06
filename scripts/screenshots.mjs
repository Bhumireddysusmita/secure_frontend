// Captures every page at phone (375px) and desktop (1280px) widths into docs/screenshots/.
// Usage (API + Vite dev server running): node scripts/screenshots.mjs [http://localhost:5173]
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const BASE = (process.argv[2] ?? "http://localhost:5173").replace(/\/$/, "");
const OUT = resolve(dirname(fileURLToPath(import.meta.url)), "../../docs/screenshots");
mkdirSync(OUT, { recursive: true });

const widths = [
  { name: "mobile", width: 375, height: 812 },
  { name: "desktop", width: 1280, height: 860 },
];
const publicPages = [
  { name: "landing", path: "/" },
  { name: "signup", path: "/signup" },
  { name: "login", path: "/login" },
  { name: "not-found", path: "/does-not-exist" },
];

const browser = await chromium.launch();
for (const vp of widths) {
  const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
  const page = await context.newPage();

  for (const p of publicPages) {
    await page.goto(BASE + p.path, { waitUntil: "networkidle" });
    // Give the Turnstile iframe a moment to paint on the auth pages.
    if (p.name === "signup" || p.name === "login") await page.waitForTimeout(2500);
    await page.screenshot({ path: `${OUT}/${p.name}-${vp.width}.png`, fullPage: true });
    console.log(`saved ${p.name}-${vp.width}.png`);
  }

  // Dashboard: create a throwaway fictional account through the API, sharing the browser's cookies.
  const stamp = Date.now();
  const res = await context.request.post(`${BASE}/api/auth/signup`, {
    headers: { Origin: BASE },
    data: {
      name: "Avery Quill",
      email: `screenshot.${vp.name}.${stamp}@example.com`,
      password: `Shot${stamp}x`,
      confirmPassword: `Shot${stamp}x`,
      acceptTerms: true,
      captchaToken: "XXXX.DUMMY.TOKEN.XXXX",
    },
  });
  if (res.status() !== 201) throw new Error(`signup for dashboard screenshot failed: ${res.status()}`);
  await page.goto(BASE + "/dashboard", { waitUntil: "networkidle" });
  await page.screenshot({ path: `${OUT}/dashboard-${vp.width}.png`, fullPage: true });
  console.log(`saved dashboard-${vp.width}.png`);
  await context.close();
}
await browser.close();
