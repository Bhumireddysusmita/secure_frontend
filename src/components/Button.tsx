import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";

type Variant = "primary" | "secondary" | "ghost" | "white";

const base =
  "inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold transition duration-150 " +
  "disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none " +
  "focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand-gradient text-white shadow-glow hover:brightness-110 active:brightness-95 disabled:hover:brightness-100",
  secondary: "border border-slate-200 bg-white text-ink shadow-sm hover:border-primary-200 hover:bg-primary-50",
  ghost: "text-slate-700 hover:bg-primary-50 hover:text-primary-700",
  white: "bg-white text-primary-700 shadow-soft hover:bg-primary-50",
};

export function Spinner({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="4" />
      <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

type Common = { variant?: Variant; pill?: boolean; className?: string; children: ReactNode };

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  Common & {
    loading?: boolean;
    fullWidth?: boolean;
  };

const shape = (pill?: boolean) => (pill ? "rounded-full" : "rounded-lg");

export function Button({
  variant = "primary",
  pill,
  loading = false,
  fullWidth = false,
  disabled,
  className = "",
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`${base} ${shape(pill)} ${variants[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...rest}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}

export function ButtonLink({
  to,
  variant = "primary",
  pill,
  className = "",
  children,
  ...rest
}: Common & { to: string; "data-testid"?: string }) {
  return (
    <Link to={to} className={`${base} ${shape(pill)} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </Link>
  );
}
