import { useEffect, type ReactNode } from "react";
import { ButtonLink } from "../components/Button";
import {
  ArrowRightIcon,
  BoltIcon,
  ChevronDownIcon,
  ClockIcon,
  EyeOffIcon,
  FingerprintIcon,
  KeyIcon,
  LockIcon,
  ServerIcon,
  ShieldCheckIcon,
  SparkleIcon,
} from "../components/Icons";
import { HeroIllustration, LaptopShieldIllustration } from "../components/Illustrations";
import { APP_NAME } from "../components/Layout";
import { useAuth } from "../context/AuthContext";

const trust: { icon: ReactNode; label: string }[] = [
  { icon: <ShieldCheckIcon className="h-7 w-7" />, label: "Bank-grade password hashing" },
  { icon: <FingerprintIcon className="h-7 w-7" />, label: "Server-verified CAPTCHA" },
  { icon: <BoltIcon className="h-7 w-7" />, label: "Fast & reliable" },
  { icon: <EyeOffIcon className="h-7 w-7" />, label: "Privacy first" },
];

const features: { title: string; text: string; icon: ReactNode; tone: string }[] = [
  {
    title: "Secure Access",
    text: "Passwords are hashed with bcrypt and never stored or logged in plain text.",
    icon: <LockIcon className="h-7 w-7" />,
    tone: "from-fuchsia-50 to-violet-50 text-accent-600",
  },
  {
    title: "Smart Verification",
    text: "Every sign-up and login passes a CAPTCHA that our server verifies.",
    icon: <BoltIcon className="h-7 w-7" />,
    tone: "from-emerald-50 to-teal-50 text-emerald-600",
  },
  {
    title: "Real-Time Protection",
    text: "Rate limits and automatic lockouts stop brute-force attempts.",
    icon: <ShieldCheckIcon className="h-7 w-7" />,
    tone: "from-orange-50 to-amber-50 text-orange-500",
  },
  {
    title: "Seamless Experience",
    text: "Clear messages, keyboard-friendly forms and a layout that fits any screen.",
    icon: <SparkleIcon className="h-7 w-7" />,
    tone: "from-sky-50 to-indigo-50 text-primary-600",
  },
];

const security: { title: string; text: string; icon: ReactNode }[] = [
  { title: "bcrypt hashing (cost 12)", text: "Only a slow, salted hash of your password is stored.", icon: <KeyIcon /> },
  { title: "Cloudflare Turnstile", text: "Bot checks are verified server-side and fail closed.", icon: <FingerprintIcon /> },
  { title: "HttpOnly session cookies", text: "Scripts can't read your session; only its hash is in our database.", icon: <LockIcon /> },
  { title: "Lockout after 5 failures", text: "Repeated wrong passwords pause logins for 15 minutes.", icon: <ClockIcon /> },
  { title: "No account enumeration", text: "Wrong email or wrong password get the same message.", icon: <EyeOffIcon /> },
  { title: "Hardened headers", text: "Strict CSP, clickjacking and cross-site request protection.", icon: <ServerIcon /> },
];

const faqs: { q: string; a: string }[] = [
  {
    q: "How is my password stored?",
    a: "It never is. We store a bcrypt hash with a unique salt, so even we can't read your password, and it never appears in logs.",
  },
  {
    q: "Why do I see a CAPTCHA?",
    a: "It stops automated bots from creating accounts or guessing passwords. The check is quick, privacy-friendly and verified on our server.",
  },
  {
    q: "What happens if I enter the wrong password several times?",
    a: "After 5 failed attempts in 15 minutes, logins for that email pause briefly. You'll see how many minutes to wait.",
  },
  {
    q: "How long do I stay signed in?",
    a: "Sessions last up to 7 days. Logging out ends the session on our server immediately, not just in your browser.",
  },
  {
    q: "Is this a real product?",
    a: `${APP_NAME} is a demonstration app built for a technical assessment. Please don't use a real password you use elsewhere.`,
  },
];

function SectionHeading({ id, title, text }: { id: string; title: string; text: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <span className="eyebrow-dash" aria-hidden="true" />
      <h2 id={id} className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
        {title}
      </h2>
      <p className="mt-3 text-base text-slate-600">{text}</p>
    </div>
  );
}

export function LandingPage() {
  const { user, loading } = useAuth();

  useEffect(() => {
    document.title = `${APP_NAME}: secure sign-in, done right`;
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-6 px-4 pb-10 pt-10 sm:px-6 md:grid-cols-2 md:pt-16">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-white/80 px-3 py-1.5 text-xs font-semibold text-primary-700 shadow-sm">
              <ShieldCheckIcon className="h-4 w-4" />
              AI-built, security-first authentication
            </p>
            <h1 className="mt-5 font-extrabold tracking-tight text-ink" data-testid="landing-heading">
              <span className="block text-4xl sm:text-5xl">Welcome to</span>
              <span className="mt-1 block bg-brand-gradient bg-clip-text pb-2 text-6xl text-transparent sm:text-7xl">
                {APP_NAME}
              </span>
            </h1>
            <p className="mt-4 max-w-md text-lg font-medium leading-relaxed text-slate-700">
              Secure sign-in, done right: hashed passwords, CAPTCHA bot protection and sessions scripts can&apos;t read.
            </p>
            <p className="mt-3 max-w-md text-[15px] text-slate-500">Sign up, log in and experience a safer digital journey.</p>

            <div className="mt-8 flex min-h-[48px] flex-col gap-3 sm:flex-row sm:items-center">
              {loading ? null : user ? (
                <ButtonLink to="/dashboard" pill className="px-7 py-3 text-[15px]" data-testid="landing-dashboard">
                  Go to dashboard <ArrowRightIcon className="h-4 w-4" />
                </ButtonLink>
              ) : (
                <>
                  <ButtonLink to="/signup" pill className="px-7 py-3 text-[15px]" data-testid="landing-signup">
                    Get Started <ArrowRightIcon className="h-4 w-4" />
                  </ButtonLink>
                  <ButtonLink to="/login" variant="secondary" pill className="px-7 py-3 text-[15px]" data-testid="landing-login">
                    I have an account
                  </ButtonLink>
                </>
              )}
            </div>
          </div>
          <HeroIllustration className="mx-auto w-full max-w-lg" />
        </div>

        {/* Trust strip */}
        <div className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
          <ul className="grid grid-cols-2 gap-y-5 rounded-2xl border border-white bg-white/90 px-4 py-5 shadow-soft md:grid-cols-4 md:divide-x md:divide-slate-200 md:py-6">
            {trust.map((t) => (
              <li key={t.label} className="flex items-center justify-center gap-3 px-3">
                <span className="text-primary-600">{t.icon}</span>
                <span className="max-w-[9rem] text-sm font-semibold leading-tight text-ink">{t.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Features */}
      <section aria-labelledby="features" className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <SectionHeading
          id="features"
          title="Powerful Features"
          text="Everything you need for a safer and smoother authentication experience."
        />
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <li
              key={f.title}
              className={`rounded-2xl border border-white bg-gradient-to-b p-6 text-center shadow-soft transition hover:-translate-y-1 ${f.tone}`}
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">{f.icon}</div>
              <h3 className="mt-4 text-base font-bold text-ink">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{f.text}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Security */}
      <section aria-labelledby="security" className="bg-white/70 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading
            id="security"
            title="How we protect your account"
            text="Real safeguards, verified by an automated test suite on every change."
          />
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {security.map((s) => (
              <li key={s.title} className="card flex gap-4 p-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                  {s.icon}
                </span>
                <div>
                  <h3 className="font-bold text-ink">{s.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{s.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section aria-labelledby="faq" className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <SectionHeading id="faq" title="Frequently asked questions" text="Quick answers about how your account is kept safe." />
        <div className="mt-10 space-y-3">
          {faqs.map((f) => (
            <details key={f.q} className="card group p-0 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-2xl px-5 py-4 font-semibold text-ink hover:text-primary-700">
                {f.q}
                <ChevronDownIcon className="h-5 w-5 shrink-0 text-slate-400 transition group-open:rotate-180" />
              </summary>
              <p className="px-5 pb-5 text-[15px] leading-relaxed text-slate-600">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA banner */}
      {!user && (
        <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-accent-600 via-primary-600 to-primary-700 px-6 py-10 text-white shadow-glow sm:px-12">
            <div className="pointer-events-none absolute -left-10 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
            <div className="relative grid items-center gap-6 md:grid-cols-[1fr_auto_260px]">
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Join {APP_NAME} Today</h2>
                <p className="mt-2 text-indigo-100">Experience secure authentication like never before.</p>
              </div>
              <ButtonLink to="/signup" variant="white" pill className="w-fit px-7 py-3 text-[15px]" data-testid="cta-signup">
                Create Account <ArrowRightIcon className="h-4 w-4" />
              </ButtonLink>
              <LaptopShieldIllustration className="hidden w-full md:block" />
            </div>
          </div>
        </section>
      )}
    </>
  );
}
