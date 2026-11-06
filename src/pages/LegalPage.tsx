import { useEffect } from "react";
import { Link } from "react-router-dom";
import { APP_NAME } from "../components/Layout";

const CONTENT = {
  terms: {
    title: "Terms of Service",
    sections: [
      ["Demonstration service", `${APP_NAME} is a demonstration application built for a technical assessment. It is provided as is, without warranties of any kind.`],
      ["Your account", "Provide accurate details, keep your password private and do not reuse a password you use on other sites."],
      ["Acceptable use", "Don't try to break, overload or bypass the security of the service, including its CAPTCHA and rate limits."],
      ["Changes", "Accounts may be removed at any time, for example when the assessment ends."],
    ],
  },
  privacy: {
    title: "Privacy Policy",
    sections: [
      ["What we store", "Your name, email address, a bcrypt hash of your password, active session records (hashed tokens only) and login attempt records (email, IP address, time and outcome) used for rate limiting."],
      ["What we never store", "Your plain-text password, or your session token in readable form. Logs mask email addresses."],
      ["CAPTCHA", "Sign-up and login use Cloudflare Turnstile to block bots. Cloudflare processes limited technical data to run the check."],
      ["Cookies", "One essential, HttpOnly session cookie named sid. No tracking or advertising cookies."],
    ],
  },
} as const;

export function LegalPage({ kind }: { kind: keyof typeof CONTENT }) {
  const page = CONTENT[kind];
  useEffect(() => {
    document.title = `${page.title} · ${APP_NAME}`;
  }, [page.title]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="card p-6 sm:p-10">
        <h1 className="text-3xl font-extrabold tracking-tight">{page.title}</h1>
        <p className="mt-2 text-sm text-slate-500">Last updated November 2026</p>
        <div className="mt-8 space-y-6">
          {page.sections.map(([heading, body]) => (
            <section key={heading}>
              <h2 className="text-lg font-bold">{heading}</h2>
              <p className="mt-1.5 leading-relaxed text-slate-600">{body}</p>
            </section>
          ))}
        </div>
        <Link to="/" className="link mt-10 inline-block">
          Back to home
        </Link>
      </div>
    </div>
  );
}
