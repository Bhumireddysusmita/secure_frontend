import { useEffect, useState, type ReactNode } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { firstName, useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Button, ButtonLink } from "./Button";
import { BrandMark, CheckIcon, CloseIcon, MenuIcon } from "./Icons";

export const APP_NAME = "SecureAI";

export function Logo({ light = false, testId = "logo" }: { light?: boolean; testId?: string }) {
  return (
    <Link
      to="/"
      className={`flex items-center gap-2.5 rounded-lg text-xl font-bold tracking-tight ${light ? "text-white" : "text-ink"}`}
      data-testid={testId}
    >
      <BrandMark className="h-8 w-8" light={light} />
      <span>{APP_NAME}</span>
    </Link>
  );
}

function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:shadow"
    >
      Skip to content
    </a>
  );
}

const NAV = [
  { label: "Home", to: "/", hash: "" },
  { label: "Features", to: "/#features", hash: "#features" },
  { label: "Security", to: "/#security", hash: "#security" },
  { label: "FAQ", to: "/#faq", hash: "#faq" },
];

function useLogout() {
  const { logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  async function run() {
    setBusy(true);
    await logout();
    setBusy(false);
    toast("You've been logged out");
    navigate("/", { replace: true });
  }
  return { busy, run };
}

function Header() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const { busy, run: onLogout } = useLogout();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [location.pathname, location.hash]);

  const isActive = (hash: string) => location.pathname === "/" && location.hash === hash;
  const linkClass = (active: boolean) =>
    `relative py-1 text-sm font-medium transition hover:text-primary-600 ${
      active
        ? "text-primary-600 after:absolute after:-bottom-1.5 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-primary-600"
        : "text-slate-700"
    }`;

  // Rendered twice (desktop header and phone menu), so each copy gets its own test IDs.
  const accountActions = (prefix: "header" | "mobile") =>
    loading ? null : user ? (
      <>
        <ButtonLink to="/dashboard" variant="ghost" pill className="px-4" data-testid={`${prefix}-dashboard`}>
          Hi, {firstName(user.name)}
        </ButtonLink>
        <Button variant="secondary" pill onClick={onLogout} loading={busy} data-testid={`${prefix}-logout`}>
          Log out
        </Button>
      </>
    ) : (
      <>
        <ButtonLink to="/login" variant="secondary" pill className="px-6" data-testid={`${prefix}-login`}>
          Login
        </ButtonLink>
        <ButtonLink to="/signup" variant="primary" pill className="px-6" data-testid={`${prefix}-signup`}>
          Sign Up
        </ButtonLink>
      </>
    );

  return (
    <header className="sticky top-0 z-40 border-b border-white/60 bg-white/75 backdrop-blur-lg">
      <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />
        <nav aria-label="Main" className="hidden items-center gap-8 md:flex">
          {NAV.map((n) => (
            <Link key={n.label} to={n.to} className={linkClass(isActive(n.hash))} aria-current={isActive(n.hash) ? "page" : undefined}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">{accountActions("header")}</div>
        <button
          type="button"
          className="rounded-lg p-2 text-slate-700 hover:bg-primary-50 md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((o) => !o)}
          data-testid="menu-toggle"
        >
          {open ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
        </button>
      </div>
      {open && (
        <div id="mobile-menu" className="border-t border-slate-100 bg-white px-4 pb-5 pt-2 md:hidden">
          <nav aria-label="Mobile" className="flex flex-col">
            {NAV.map((n) => (
              <Link key={n.label} to={n.to} className="rounded-lg px-3 py-3 text-[15px] font-medium text-slate-700 hover:bg-primary-50">
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="mt-3 grid grid-cols-2 gap-2 [&>*]:w-full">{accountActions("mobile")}</div>
        </div>
      )}
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-200/70 bg-white/60">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-8 text-sm text-slate-500 sm:px-6 md:flex-row md:justify-between">
        <div className="flex flex-col items-center gap-3 md:flex-row md:gap-6">
          <Logo testId="footer-logo" />
          <p>© {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
        </div>
        <nav aria-label="Legal" className="flex items-center gap-3">
          <NavLink to="/privacy" className="hover:text-primary-600">
            Privacy Policy
          </NavLink>
          <span aria-hidden="true">|</span>
          <NavLink to="/terms" className="hover:text-primary-600">
            Terms of Service
          </NavLink>
          <span aria-hidden="true">|</span>
          <Link to="/#faq" className="hover:text-primary-600">
            Support
          </Link>
        </nav>
      </div>
    </footer>
  );
}

/** Scrolls to #hash targets on navigation (React Router doesn't), otherwise to the top. */
function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
    }
    window.scrollTo({ top: 0 });
  }, [pathname, hash]);
  return null;
}

/** Marketing / app layout: sticky header, page content, footer. */
export function SiteLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-page-glow">
      <SkipLink />
      <ScrollManager />
      <Header />
      <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

/** Split-panel layout for sign up / login: brand panel on the left, form on the right. */
export function AuthShell({
  panelTitle,
  panelText,
  panelPoints,
  illustration,
  title,
  subtitle,
  children,
}: {
  panelTitle: string;
  panelText: string;
  panelPoints?: string[];
  illustration: ReactNode;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-page-glow px-3 py-6 sm:px-6 sm:py-10 lg:flex lg:items-center lg:justify-center">
      <SkipLink />
      <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-[0_30px_80px_-30px_rgba(49,46,129,0.35)] lg:grid-cols-[5fr_6fr]">
        <aside className="relative overflow-hidden bg-brand-panel px-6 py-8 text-white sm:px-10 sm:py-10">
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
          <div className="pointer-events-none absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-accent-400/30 blur-3xl" aria-hidden="true" />
          <div className="relative flex h-full flex-col">
            <Logo light />
            <h2 className="mt-8 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:mt-12">{panelTitle}</h2>
            <p className="mt-3 max-w-xs text-[15px] leading-relaxed text-indigo-100">{panelText}</p>
            {panelPoints && (
              <ul className="mt-6 hidden space-y-3 sm:block">
                {panelPoints.map((p) => (
                  <li key={p} className="flex items-center gap-3 text-sm font-medium">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-success-500">
                      <CheckIcon className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                    </span>
                    {p}
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-auto hidden pt-8 lg:block">{illustration}</div>
          </div>
        </aside>

        <main id="main" tabIndex={-1} className="px-5 py-8 focus:outline-none sm:px-12 sm:py-12">
          <div className="mx-auto w-full max-w-md">
            <h1 className="text-3xl font-extrabold tracking-tight text-ink">{title}</h1>
            <p className="mt-1.5 text-[15px] text-slate-600">{subtitle}</p>
            <div className="mt-7">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
