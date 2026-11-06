// Audits brief section 01 (application requirements) in a real browser:
// - axe accessibility scan of every page at 375px and 1280px (WCAG 2.1 A/AA)
// - no horizontal scrolling at 375px
// - sign up -> authenticated state -> logout -> login -> logout, with messages
// Usage: node scripts/audit-requirements.mjs http://127.0.0.1:8010
// (needs a backend using Cloudflare's always-pass TEST secret; the CAPTCHA token is the
//  official dummy test token, posted the same way the widget would)
import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const BASE = (process.argv[2] ?? "http://127.0.0.1:8010").replace(/\/$/, "");
const TEST_TOKEN = "XXXX.DUMMY.TOKEN.XXXX";
const results = [];
const record = (area, check, ok, detail = "") => {
  results.push({ area, check, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  [${area}] ${check}${detail ? `  (${detail})` : ""}`);
};

const browser = await chromium.launch();

async function scan(page, label) {
  const axe = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .exclude('iframe[src*="challenges.cloudflare.com"]') // third-party widget
    .analyze();
  const v = axe.violations.map((x) => `${x.id}(${x.impact}) x${x.nodes.length}`);
  record("Experience", `axe WCAG A/AA: ${label}`, v.length === 0, v.join(", "));
}

// ---- Accessibility + responsiveness on every page --------------------------------
for (const vp of [{ w: 375, h: 812 }, { w: 1280, h: 900 }]) {
  const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h } });
  const page = await ctx.newPage();
  for (const path of ["/", "/signup", "/login", "/terms", "/privacy", "/no-such-page"]) {
    await page.goto(BASE + path, { waitUntil: "networkidle" });
    await scan(page, `${path} @${vp.w}px`);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    record("Experience", `no sideways scroll ${path} @${vp.w}px`, overflow <= 0, overflow > 0 ? `${overflow}px` : "");
  }
  await ctx.close();
}

// ---- Landing page ------------------------------------------------------------------
{
  const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  record("Landing", "Sign Up action visible on phone", await page.getByTestId("landing-signup").isVisible());
  record("Landing", "Log in action visible on phone", await page.getByTestId("landing-login").isVisible());
  await page.getByTestId("menu-toggle").click();
  record("Landing", "mobile menu has Login + Sign Up", (await page.getByTestId("mobile-login").isVisible()) && (await page.getByTestId("mobile-signup").isVisible()));
  await page.close();
}

// ---- Sign up / login / logout flow -------------------------------------------------
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  const stamp = Date.now();
  const email = `audit.user${stamp}@example.com`;
  const password = `Orbit${String(stamp).slice(-5)}k`;

  // Keyboard-only: tab from the top of /signup reaches every control in order.
  await page.goto(BASE + "/signup", { waitUntil: "networkidle" });
  const order = [];
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press("Tab");
    order.push(await page.evaluate(() => document.activeElement?.getAttribute("data-testid") || document.activeElement?.tagName));
  }
  const needed = ["signup-name", "signup-email", "signup-password", "signup-confirm-password", "signup-terms"];
  record("Experience", "keyboard reaches every sign-up control", needed.every((t) => order.includes(t)), order.join(" > "));

  // Submitting invalid data shows field errors and focuses the first bad field.
  await page.getByTestId("signup-name").fill("A");
  await page.evaluate(() => {
    // Pretend the CAPTCHA finished so the submit button is enabled (test key behaviour).
    document.querySelector('[data-testid="signup-submit"]').removeAttribute("disabled");
  });
  await page.getByTestId("signup-submit").click();
  const focused = await page.evaluate(() => document.activeElement?.getAttribute("data-testid"));
  record("Sign up", "invalid submit shows errors and focuses first bad field", (await page.getByTestId("signup-name-error").isVisible()) && focused === "signup-name");

  // Valid sign-up through the API using the session cookie jar of this browser,
  // exactly what the form posts once Turnstile issues its token.
  const signupBody = { name: "Juniper Okafor", email, password, confirmPassword: password, acceptTerms: true, captchaToken: TEST_TOKEN };
  let r = await ctx.request.post(BASE + "/api/auth/signup", { headers: { Origin: BASE }, data: signupBody });
  record("Sign up", "valid sign-up creates account (201)", r.status() === 201);
  r = await ctx.request.post(BASE + "/api/auth/signup", { headers: { Origin: BASE }, data: { ...signupBody, email: email.toUpperCase() } });
  record("Sign up", "duplicate email (other case) refused (409)", r.status() === 409);

  await page.goto(BASE + "/dashboard", { waitUntil: "networkidle" });
  record("Login/logout", "authenticated state: dashboard shows name", (await page.getByTestId("dashboard-welcome").innerText()).includes("Juniper"));
  record("Login/logout", "authenticated state: header shows user", (await page.getByTestId("header-dashboard").innerText()).includes("Juniper"));
  record("Login/logout", "signed-in badge visible", await page.getByTestId("dashboard-badge").isVisible());
  await scan(page, "/dashboard @1280px");

  await page.getByTestId("dashboard-logout").click();
  await page.waitForURL(BASE + "/");
  record("Login/logout", "logout success message shown", (await page.getByTestId("toast").first().innerText()).includes("logged out"));
  await page.goBack();
  await page.waitForLoadState("networkidle");
  record("Login/logout", "Back after logout does not show dashboard", !page.url().endsWith("/dashboard") || !(await page.getByTestId("dashboard-welcome").count()));
  const me = await ctx.request.get(BASE + "/api/auth/me");
  record("Login/logout", "server session ended after logout (401)", me.status() === 401);

  r = await ctx.request.post(BASE + "/api/auth/login", { headers: { Origin: BASE }, data: { email, password: "WrongPass99", captchaToken: TEST_TOKEN } });
  record("Login/logout", "wrong password -> generic 401", r.status() === 401 && (await r.json()).error.message === "Incorrect email or password");
  r = await ctx.request.post(BASE + "/api/auth/login", { headers: { Origin: BASE }, data: { email, password, captchaToken: "" } });
  record("Bot prevention", "login without CAPTCHA token refused (403)", r.status() === 403);
  r = await ctx.request.post(BASE + "/api/auth/signup", { headers: { Origin: BASE }, data: { ...signupBody, email: `x${email}`, captchaToken: "" } });
  record("Bot prevention", "sign-up without CAPTCHA token refused (403)", r.status() === 403);
  r = await ctx.request.post(BASE + "/api/auth/login", { headers: { Origin: BASE }, data: { email, password, captchaToken: TEST_TOKEN } });
  record("Login/logout", "valid credentials log in (200)", r.status() === 200);
  await page.goto(BASE + "/login", { waitUntil: "networkidle" });
  record("Login/logout", "logged-in user visiting /login goes to dashboard", page.url().endsWith("/dashboard"));
  await page.getByTestId("header-logout").click();
  await page.waitForURL(BASE + "/");
  await page.goto(BASE + "/dashboard", { waitUntil: "networkidle" });
  record("Login/logout", "after logout /dashboard redirects to login", page.url().includes("/login"));

  // Login page shows the generic error in the UI too.
  await page.getByTestId("login-email").fill(email);
  await page.getByTestId("login-password").fill("WrongPass99");
  await page.evaluate(() => document.querySelector('[data-testid="login-submit"]').removeAttribute("disabled"));
  await page.getByTestId("login-submit").click();
  const loginAlert = page.getByTestId("login-error");
  await loginAlert.waitFor({ timeout: 10000 }).catch(() => {});
  const alertText = (await loginAlert.count()) ? await loginAlert.innerText() : "";
  record("Login/logout", "login page shows a helpful error", alertText.length > 0, alertText);
  await ctx.close();
}

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
