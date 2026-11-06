// Brief section 01, exercised only through the real forms (no direct API calls):
// sign up, duplicate, login, ?next= handling, wrong password, lockout, CAPTCHA failure,
// server unreachable, double-submit, Enter key, password toggle, logout (desktop + phone),
// signed-in redirects, 404.
//
// Needs two instances of the production build served by FastAPI with Cloudflare TEST keys:
//   PASS_URL: TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA (always passes)
//   FAIL_URL: TURNSTILE_SECRET_KEY=2x0000000000000000000000000000000AA (always fails)
// and the frontend built with VITE_TURNSTILE_SITE_KEY=1x00000000000000000000AA.
// Usage: node scripts/audit-ui-flows.mjs http://127.0.0.1:8010 http://127.0.0.1:8011
import { chromium } from "@playwright/test";

const PASS = (process.argv[2] ?? "http://127.0.0.1:8010").replace(/\/$/, "");
const FAIL = (process.argv[3] ?? "http://127.0.0.1:8011").replace(/\/$/, "");
const results = [];
const record = (area, check, ok, detail = "") => {
  results.push({ area, check, ok });
  console.log(`${ok ? "PASS" : "FAIL"}  [${area}] ${check}${detail ? `  (${detail})` : ""}`);
};
const safe = async (area, check, fn) => {
  try {
    await fn();
  } catch (e) {
    record(area, check, false, String(e.message).split("\n")[0]);
  }
};

const browser = await chromium.launch();
const stamp = Date.now();
const user = { name: "Juniper  Okafor", email: `Juniper.Okafor${stamp}@Example.com`, password: `Orbit${String(stamp).slice(-6)}k` };
const emailLower = user.email.toLowerCase();

async function waitEnabled(locator, ms = 20000) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    if (!(await locator.isDisabled())) return true;
    await new Promise((r) => setTimeout(r, 150));
  }
  return false;
}
async function toastText(page) {
  const t = page.getByTestId("toast").last();
  await t.waitFor({ timeout: 5000 });
  return t.innerText();
}
async function fillSignup(page, u) {
  await page.getByTestId("signup-name").fill(u.name);
  await page.getByTestId("signup-email").fill(u.email);
  await page.getByTestId("signup-password").fill(u.password);
  await page.getByTestId("signup-confirm-password").fill(u.password);
  await page.getByTestId("signup-terms").check();
}
async function fillLogin(page, email, password) {
  await page.getByTestId("login-email").fill(email);
  await page.getByTestId("login-password").fill(password);
}

// ---------- Sign up through the form ----------
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();

await safe("Sign up", "form sign-up -> dashboard, 'Account created', one request", async () => {
  let posts = 0;
  page.on("request", (r) => r.method() === "POST" && r.url().endsWith("/api/auth/signup") && posts++);
  await page.goto(PASS + "/signup", { waitUntil: "networkidle" });
  await fillSignup(page, user);
  const submit = page.getByTestId("signup-submit");
  if (!(await waitEnabled(submit))) throw new Error("CAPTCHA token never arrived");
  await submit.dblclick(); // double-click must still send exactly one request
  await page.waitForURL(PASS + "/dashboard");
  const toast = await toastText(page);
  const welcome = await page.getByTestId("dashboard-welcome").innerText();
  const email = await page.getByTestId("dashboard-email").innerText();
  const name = await page.getByTestId("dashboard-name").innerText();
  record("Sign up", "form sign-up -> dashboard, 'Account created', one request",
    toast.includes("Account created") && welcome.includes("Juniper") && posts === 1,
    `toast="${toast}", requests=${posts}`);
  record("Sign up", "saved name normalised and email lowercased", name === "Juniper Okafor" && email === emailLower, `${name} / ${email}`);
});

await safe("Login/logout", "signed-in: /signup and /login redirect to dashboard; landing shows 'Go to dashboard'", async () => {
  await page.goto(PASS + "/signup", { waitUntil: "networkidle" });
  const a = page.url().endsWith("/dashboard");
  await page.goto(PASS + "/login", { waitUntil: "networkidle" });
  const b = page.url().endsWith("/dashboard");
  await page.goto(PASS + "/", { waitUntil: "networkidle" });
  const c = await page.getByTestId("landing-dashboard").isVisible();
  record("Login/logout", "signed-in: /signup and /login redirect to dashboard; landing shows 'Go to dashboard'", a && b && c);
});

await safe("Login/logout", "dashboard logout -> home + message", async () => {
  await page.goto(PASS + "/dashboard", { waitUntil: "networkidle" });
  await page.getByTestId("dashboard-logout").click();
  await page.waitForURL(PASS + "/");
  record("Login/logout", "dashboard logout -> home + message", (await toastText(page)).includes("logged out"));
});

// ---------- Duplicate through the form ----------
await safe("Sign up", "duplicate email (different case) -> clear message + link to log in", async () => {
  await page.goto(PASS + "/signup", { waitUntil: "networkidle" });
  await fillSignup(page, { ...user, email: user.email.toUpperCase() });
  const submit = page.getByTestId("signup-submit");
  await waitEnabled(submit);
  await submit.click();
  const alert = page.getByTestId("signup-error");
  await alert.waitFor();
  const text = await alert.innerText();
  const link = await page.getByTestId("signup-duplicate-login").getAttribute("href");
  const fieldErr = await page.getByTestId("signup-email-error").innerText();
  record("Sign up", "duplicate email (different case) -> clear message + link to log in",
    text.includes("already exists") && link === "/login" && fieldErr.includes("already exists"), text);
});

// ---------- Login through the form ----------
await safe("Login/logout", "form login (uppercase email) -> dashboard + 'Welcome back!'", async () => {
  await page.goto(PASS + "/login", { waitUntil: "networkidle" });
  await fillLogin(page, user.email.toUpperCase(), user.password);
  const submit = page.getByTestId("login-submit");
  await waitEnabled(submit);
  await page.getByTestId("login-password").press("Enter"); // Enter key submits
  await page.waitForURL(PASS + "/dashboard");
  record("Login/logout", "form login (uppercase email) -> dashboard + 'Welcome back!'", (await toastText(page)).includes("Welcome back"));
});

await safe("Login/logout", "header logout", async () => {
  await page.getByTestId("header-logout").click();
  await page.waitForURL(PASS + "/");
  record("Login/logout", "header logout", (await toastText(page)).includes("logged out"));
});

await safe("Login/logout", "?next=/dashboard honoured; ?next=//evil.example ignored", async () => {
  await page.goto(PASS + "/dashboard", { waitUntil: "networkidle" });
  const redirected = page.url().includes("/login?next=%2Fdashboard");
  await fillLogin(page, user.email, user.password);
  await waitEnabled(page.getByTestId("login-submit"));
  await page.getByTestId("login-submit").click();
  await page.waitForURL(PASS + "/dashboard");
  await page.getByTestId("header-logout").click();
  await page.waitForURL(PASS + "/");
  await page.goto(PASS + "/login?next=//evil.example/steal", { waitUntil: "networkidle" });
  await fillLogin(page, user.email, user.password);
  await waitEnabled(page.getByTestId("login-submit"));
  await page.getByTestId("login-submit").click();
  await page.waitForURL(PASS + "/dashboard");
  record("Login/logout", "?next=/dashboard honoured; ?next=//evil.example ignored", redirected && page.url() === PASS + "/dashboard");
  await page.getByTestId("header-logout").click();
  await page.waitForURL(PASS + "/");
});

await safe("Experience", "password show/hide toggle", async () => {
  await page.goto(PASS + "/login", { waitUntil: "networkidle" });
  const pw = page.getByTestId("login-password");
  const before = await pw.getAttribute("type");
  await page.getByTestId("login-password-toggle").click();
  const after = await pw.getAttribute("type");
  const label = await page.getByTestId("login-password-toggle").getAttribute("aria-label");
  record("Experience", "password show/hide toggle", before === "password" && after === "text" && label === "Hide password");
});

await safe("Login/logout", "wrong password -> generic message, password cleared and focused", async () => {
  await page.goto(PASS + "/login", { waitUntil: "networkidle" });
  await fillLogin(page, user.email, "NotMyPass123");
  await waitEnabled(page.getByTestId("login-submit"));
  await page.getByTestId("login-submit").click();
  const alert = page.getByTestId("login-error");
  await alert.waitFor();
  const text = await alert.innerText();
  const pw = await page.getByTestId("login-password").inputValue();
  const focused = await page.evaluate(() => document.activeElement?.getAttribute("data-testid"));
  record("Login/logout", "wrong password -> generic message, password cleared and focused",
    text === "Incorrect email or password" && pw === "" && focused === "login-password", text);
});

await safe("Login/logout", "unknown email -> same generic message", async () => {
  await page.goto(PASS + "/login", { waitUntil: "networkidle" });
  await fillLogin(page, `nobody${stamp}@example.com`, "NotMyPass123");
  await waitEnabled(page.getByTestId("login-submit"));
  await page.getByTestId("login-submit").click();
  const alert = page.getByTestId("login-error");
  await alert.waitFor();
  record("Login/logout", "unknown email -> same generic message", (await alert.innerText()) === "Incorrect email or password");
});

await safe("Login/logout", "lockout after 5 wrong passwords -> message with minutes", async () => {
  // One wrong attempt already made above; four more reach the limit of five.
  for (let i = 0; i < 4; i++) {
    await page.goto(PASS + "/login", { waitUntil: "networkidle" });
    await fillLogin(page, user.email, "NotMyPass123");
    await waitEnabled(page.getByTestId("login-submit"));
    await page.getByTestId("login-submit").click();
    await page.getByTestId("login-error").waitFor();
  }
  await page.goto(PASS + "/login", { waitUntil: "networkidle" });
  await fillLogin(page, user.email, user.password); // even the right password is refused while locked
  await waitEnabled(page.getByTestId("login-submit"));
  await page.getByTestId("login-submit").click();
  const alert = page.getByTestId("login-error");
  await alert.waitFor();
  const text = await alert.innerText();
  record("Login/logout", "lockout after 5 wrong passwords -> message with minutes", /temporarily locked; try again in \d+ min/.test(text), text);
});

await safe("Experience", "server unreachable -> connection message", async () => {
  await page.goto(PASS + "/login", { waitUntil: "networkidle" });
  await page.route("**/api/auth/login", (r) => r.abort("connectionrefused"));
  await fillLogin(page, `someone${stamp}@example.com`, "Whatever123");
  await waitEnabled(page.getByTestId("login-submit"));
  await page.getByTestId("login-submit").click();
  const alert = page.getByTestId("login-error");
  await alert.waitFor();
  record("Experience", "server unreachable -> connection message", (await alert.innerText()).includes("Can't reach the server"));
  await page.unroute("**/api/auth/login");
});

await safe("Experience", "404 page with working link home", async () => {
  await page.goto(PASS + "/does-not-exist", { waitUntil: "networkidle" });
  const shown = await page.getByTestId("not-found").isVisible();
  await page.getByTestId("not-found-home").click();
  await page.waitForURL(PASS + "/");
  record("Experience", "404 page with working link home", shown);
});
await ctx.close();

// ---------- Phone: sign up, logout from the menu ----------
await safe("Login/logout", "phone: sign up then log out from the menu", async () => {
  const m = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const p = await m.newPage();
  await p.goto(PASS + "/signup", { waitUntil: "networkidle" });
  await fillSignup(p, { name: "Talia Brennwood", email: `talia${stamp}@example.com`, password: `Lantern${String(stamp).slice(-5)}q` });
  await waitEnabled(p.getByTestId("signup-submit"));
  await p.getByTestId("signup-submit").click();
  await p.waitForURL(PASS + "/dashboard");
  await p.getByTestId("menu-toggle").click();
  await p.getByTestId("mobile-logout").click();
  await p.waitForURL(PASS + "/");
  record("Login/logout", "phone: sign up then log out from the menu", (await toastText(p)).includes("logged out"));
  await m.close();
});

// ---------- CAPTCHA rejected by the server ----------
for (const form of ["signup", "login"]) {
  await safe("Bot prevention", `${form}: server rejects CAPTCHA -> message, widget reset`, async () => {
    const c = await browser.newContext();
    const p = await c.newPage();
    await p.goto(`${FAIL}/${form}`, { waitUntil: "networkidle" });
    if (form === "signup") await fillSignup(p, { name: "Rowan Vexley", email: `rowan${stamp}@example.com`, password: `Harbor${String(stamp).slice(-5)}z` });
    else await fillLogin(p, `captcha.check${stamp}@example.com`, "Harbor12345z"); // not the locked-out account
    const submit = p.getByTestId(`${form}-submit`);
    await waitEnabled(submit);
    const resp = p.waitForResponse((r) => r.url().endsWith(`/api/auth/${form}`));
    await submit.click();
    const status = (await resp).status();
    const alert = p.getByTestId(`${form}-error`);
    await alert.waitFor();
    record("Bot prevention", `${form}: server rejects CAPTCHA -> message, widget reset`,
      status === 403 && (await alert.innerText()).includes("CAPTCHA check failed"), `status ${status}`);
    await c.close();
  });
}

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} UI checks passed`);
process.exit(failed.length ? 1 : 0);
