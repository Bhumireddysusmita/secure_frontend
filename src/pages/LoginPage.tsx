import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Alert } from "../components/Alert";
import { Button } from "../components/Button";
import { ArrowRightIcon, LockIcon, MailIcon } from "../components/Icons";
import { LaptopShieldIllustration } from "../components/Illustrations";
import { APP_NAME, AuthShell } from "../components/Layout";
import { PasswordField, TextField } from "../components/TextField";
import { TurnstileWidget, type TurnstileHandle } from "../components/TurnstileWidget";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { api, minutesFrom, safeNextPath } from "../lib/api";
import { validateLogin, type FieldErrors } from "../lib/validation";

type Field = "email" | "password";
const FIELDS: Field[] = ["email", "password"];

export function LoginPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const toast = useToast();
  const { setUser } = useAuth();

  const [values, setValues] = useState<Record<Field, string>>({ email: "", password: "" });
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [serverErrors, setServerErrors] = useState<FieldErrors<Field>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const captchaRef = useRef<TurnstileHandle>(null);
  const inputRefs = useRef<Partial<Record<Field, HTMLInputElement | null>>>({});

  useEffect(() => {
    document.title = `Sign in · ${APP_NAME}`;
  }, []);

  const clientErrors = useMemo(() => validateLogin(values), [values]);
  const errorFor = (f: Field) => serverErrors[f] ?? (touched[f] ? clientErrors[f] : undefined);

  function update(f: Field, v: string) {
    setValues((prev) => ({ ...prev, [f]: v }));
    if (serverErrors[f]) setServerErrors((prev) => ({ ...prev, [f]: undefined }));
  }

  function focusFirst(errors: FieldErrors<Field>) {
    const first = FIELDS.find((f) => errors[f]);
    if (first) inputRefs.current[first]?.focus();
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setFormError(null);
    setTouched({ email: true, password: true });

    if (Object.keys(clientErrors).length > 0) {
      focusFirst(clientErrors);
      return;
    }
    if (!captchaToken) {
      setFormError("Please complete the CAPTCHA check.");
      return;
    }

    setSubmitting(true);
    const res = await api.login({ ...values, captchaToken });
    captchaRef.current?.reset();
    setSubmitting(false);

    if (res.ok) {
      setUser(res.data.user);
      toast("Welcome back!");
      navigate(safeNextPath(params.get("next")) ?? "/dashboard", { replace: true });
      return;
    }

    // Never keep a rejected password around.
    setValues((prev) => ({ ...prev, password: "" }));

    switch (res.status) {
      case 400: {
        const fields = (res.error.fields ?? {}) as FieldErrors<Field>;
        setServerErrors(fields);
        if (Object.keys(fields).length) focusFirst(fields);
        else setFormError(res.error.message);
        break;
      }
      case 401:
        setFormError("Incorrect email or password");
        inputRefs.current.password?.focus();
        break;
      case 403:
        setFormError("CAPTCHA check failed, please try again.");
        break;
      case 429:
        setFormError(
          `Too many failed attempts. Your login is temporarily locked; try again in ${minutesFrom(res.retryAfterSeconds)} min.`,
        );
        break;
      default:
        setFormError(res.error.message);
    }
  }

  return (
    <AuthShell
      panelTitle="Welcome Back!"
      panelText="Sign in to continue your secure journey."
      illustration={<LaptopShieldIllustration className="mx-auto w-full max-w-sm" />}
      title="Sign In"
      subtitle="Access your account securely."
    >
      <form noValidate onSubmit={onSubmit} className="space-y-2.5" data-testid="login-form" aria-label="Sign in">
        {formError && <Alert testId="login-error">{formError}</Alert>}

        <TextField
          ref={(el) => (inputRefs.current.email = el)}
          label="Email address"
          placeholder="you@example.com"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          icon={<MailIcon />}
          testId="login-email"
          value={values.email}
          onChange={(e) => update("email", e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, email: true }))}
          error={errorFor("email")}
          required
        />
        <PasswordField
          ref={(el) => (inputRefs.current.password = el)}
          label="Password"
          placeholder="Your password"
          name="password"
          autoComplete="current-password"
          icon={<LockIcon />}
          testId="login-password"
          value={values.password}
          onChange={(e) => update("password", e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, password: true }))}
          error={errorFor("password")}
          required
        />

        <TurnstileWidget ref={captchaRef} onToken={setCaptchaToken} action="login" />

        <Button
          type="submit"
          fullWidth
          loading={submitting}
          disabled={!captchaToken}
          data-testid="login-submit"
          className="py-3 text-[15px]"
        >
          {submitting ? (
            "Signing in…"
          ) : (
            <>
              Sign In <ArrowRightIcon className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Don&apos;t have an account?{" "}
        <Link to="/signup" className="link" data-testid="login-to-signup">
          Sign Up
        </Link>
      </p>
    </AuthShell>
  );
}
