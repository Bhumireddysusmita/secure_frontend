import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { ClockIcon, LockIcon, LogoutIcon, MailIcon, ShieldCheckIcon, UserIcon } from "../components/Icons";
import { APP_NAME } from "../components/Layout";
import { firstName, useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

function InfoRow({ icon, label, children, testId }: { icon: ReactNode; label: string; children: ReactNode; testId: string }) {
  return (
    // A <dl> row may only contain <dt>/<dd>, so the icon sits inside the <dt>.
    <div className="relative px-6 py-4 pl-[4.5rem] sm:px-8 sm:pl-[5.5rem]">
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        <span
          className="absolute left-6 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl bg-primary-50 text-primary-600 sm:left-8"
          aria-hidden="true"
        >
          {icon}
        </span>
        {label}
      </dt>
      <dd className="mt-0.5 break-all text-[15px] font-medium text-ink" data-testid={testId}>
        {children}
      </dd>
    </div>
  );
}

export function DashboardPage() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    document.title = `Dashboard · ${APP_NAME}`;
  }, []);

  if (!user) return null; // RequireAuth guarantees a user; this keeps TypeScript happy.

  const memberSince = new Date(user.createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  async function onLogout() {
    setBusy(true);
    await logout();
    toast("You've been logged out");
    navigate("/", { replace: true });
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="relative overflow-hidden rounded-3xl bg-brand-panel p-6 text-white shadow-glow sm:p-10">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-2xl font-extrabold ring-1 ring-white/30"
              aria-hidden="true"
            >
              {firstName(user.name).charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl" data-testid="dashboard-welcome">
                Welcome, {firstName(user.name)}
              </h1>
              <span
                className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-success-500/20 px-3 py-1 text-xs font-semibold text-white ring-1 ring-inset ring-success-500/60"
                data-testid="dashboard-badge"
              >
                <span className="h-2 w-2 rounded-full bg-success-500" aria-hidden="true" />
                Signed in
              </span>
            </div>
          </div>
          <Button variant="white" pill onClick={onLogout} loading={busy} data-testid="dashboard-logout" className="w-fit px-6">
            <LogoutIcon className="h-4 w-4" /> Log out
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[3fr_2fr]">
        <section aria-labelledby="account-heading" className="card overflow-hidden">
          <h2 id="account-heading" className="border-b border-slate-100 px-6 py-4 text-base font-bold sm:px-8">
            Account details
          </h2>
          <dl className="divide-y divide-slate-100">
            <InfoRow icon={<UserIcon />} label="Full name" testId="dashboard-name">
              {user.name}
            </InfoRow>
            <InfoRow icon={<MailIcon />} label="Email" testId="dashboard-email">
              {user.email}
            </InfoRow>
            <InfoRow icon={<ClockIcon />} label="Member since" testId="dashboard-member-since">
              {memberSince}
            </InfoRow>
          </dl>
        </section>

        <section aria-labelledby="security-heading" className="card p-6">
          <h2 id="security-heading" className="text-base font-bold">
            Your security
          </h2>
          <ul className="mt-4 space-y-4 text-sm">
            <li className="flex gap-3">
              <ShieldCheckIcon className="h-5 w-5 shrink-0 text-success-600" />
              <span className="text-slate-600">Your password is stored only as a bcrypt hash.</span>
            </li>
            <li className="flex gap-3">
              <LockIcon className="h-5 w-5 shrink-0 text-success-600" />
              <span className="text-slate-600">This session lives in an HttpOnly cookie and expires after 7 days.</span>
            </li>
            <li className="flex gap-3">
              <LogoutIcon className="h-5 w-5 shrink-0 text-success-600" />
              <span className="text-slate-600">Logging out ends the session on the server immediately.</span>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
