import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Alert } from "../components/Alert";
import { Button } from "../components/Button";
import { ArrowRightIcon, LockIcon, MailIcon, UserIcon } from "../components/Icons";
import { AccountShieldIllustration } from "../components/Illustrations";
import { APP_NAME, AuthShell } from "../components/Layout";
import { Checkbox, PasswordField, TextField } from "../components/TextField";
import { TurnstileWidget, type TurnstileHandle } from "../components/TurnstileWidget";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { api, minutesFrom } from "../lib/api";
import { validateSignup, type FieldErrors } from "../lib/validation";

type TextFieldName = "name" | "email" | "password" | "confirmPassword";
type Field = TextFieldName | "acceptTerms";
const FIELDS: Field[] = ["name", "email", "password", "confirmPassword", "acceptTerms"];
const EMPTY: Record<TextFieldName, string> = { name: "", email: "", password: "", confirmPassword: "" };

export function SignupPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { setUser } = useAuth();

  const [values, setValues] = useState(EMPTY);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [serverErrors, setServerErrors] = useState<FieldErrors<Field>>({});
  const [formError, setFormError] = useState<ReactNode>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const captchaRef = useRef<TurnstileHandle>(null);
  const inputRefs = useRef<Partial<Record<Field, HTMLInputElement | null>>>({});

  useEffect(() => {
    document.title = `Sign up · ${APP_NAME}`;
  }, []);

  const clientErrors = useMemo(() => validateSignup({ ...values, acceptTerms }), [values, acceptTerms]);
  const errorFor = (f: Field) => serverErrors[f] ?? (touched[f] ? clientErrors[f] : undefined);
  const touch = (f: Field) => setTouched((t) => ({ ...t, [f]: true }));

  function update(f: TextFieldName, v: string) {
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
    setTouched({ name: true, email: true, password: true, confirmPassword: true, acceptTerms: true });

    if (Object.keys(clientErrors).length > 0) {
      focusFirst(clientErrors);
      return;
    }
    if (!captchaToken) {
      setFormError("Please complete the CAPTCHA check.");
      return;
    }

    setSubmitting(true);
    const res = await api.signup({ ...values, acceptTerms, captchaToken });
    // Turnstile tokens are single-use, so always get a fresh one.
    captchaRef.current?.reset();
    setSubmitting(false);

    if (res.ok) {
      setValues(EMPTY);
      setUser(res.data.user);
      toast("Account created");
      navigate("/dashboard", { replace: true });
      return;
    }

    switch (res.status) {
      case 400: {
        const fields = (res.error.fields ?? {}) as FieldErrors<Field>;
        setServerErrors(fields);
        if (Object.keys(fields).length) focusFirst(fields);
        else setFormError(res.error.message);
        break;
      }
      case 409:
        setServerErrors({ email: "An account with this email already exists" });
        setFormError(
          <>
            An account with this email already exists.{" "}
            <Link to="/login" className="link" data-testid="signup-duplicate-login">
              Log in instead
            </Link>
          </>,
        );
        inputRefs.current.email?.focus();
        break;
      case 403:
        setFormError("CAPTCHA check failed, please try again.");
        break;
      case 429:
        setFormError(`Too many attempts, try again in ${minutesFrom(res.retryAfterSeconds)} min.`);
        break;
      default:
        setFormError(res.error.message);
    }
  }

  return (
    <AuthShell
      panelTitle="Create Your Account"
      panelText="Join our secure community and experience a smarter, safer platform."
      panelPoints={["Hashed, never-stored passwords", "Bot protection on every form", "Secure, revocable sessions"]}
      illustration={<AccountShieldIllustration className="mx-auto w-full max-w-xs" />}
      title="Sign Up"
      subtitle="Get started in just a few clicks."
    >
      <form noValidate onSubmit={onSubmit} className="space-y-2.5" data-testid="signup-form" aria-label="Sign up">
        {formError && <Alert testId="signup-error">{formError}</Alert>}

        <TextField
          ref={(el) => (inputRefs.current.name = el)}
          label="Full name"
          placeholder="Jane Doe"
          name="name"
          autoComplete="name"
          icon={<UserIcon />}
          testId="signup-name"
          value={values.name}
          onChange={(e) => update("name", e.target.value)}
          onBlur={() => touch("name")}
          error={errorFor("name")}
          maxLength={200}
          required
        />
        <TextField
          ref={(el) => (inputRefs.current.email = el)}
          label="Email address"
          placeholder="you@example.com"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          icon={<MailIcon />}
          testId="signup-email"
          value={values.email}
          onChange={(e) => update("email", e.target.value)}
          onBlur={() => touch("email")}
          error={errorFor("email")}
          required
        />
        <PasswordField
          ref={(el) => (inputRefs.current.password = el)}
          label="Password"
          placeholder="Create a password"
          name="password"
          autoComplete="new-password"
          icon={<LockIcon />}
          testId="signup-password"
          value={values.password}
          onChange={(e) => update("password", e.target.value)}
          onBlur={() => touch("password")}
          error={errorFor("password")}
          hint="8+ characters with a letter and a number. Avoid common words."
          required
        />
        <PasswordField
          ref={(el) => (inputRefs.current.confirmPassword = el)}
          label="Confirm password"
          placeholder="Repeat your password"
          name="confirmPassword"
          autoComplete="new-password"
          icon={<LockIcon />}
          testId="signup-confirm-password"
          value={values.confirmPassword}
          onChange={(e) => update("confirmPassword", e.target.value)}
          onBlur={() => touch("confirmPassword")}
          error={errorFor("confirmPassword")}
          required
        />

        <Checkbox
          ref={(el) => (inputRefs.current.acceptTerms = el)}
          testId="signup-terms"
          checked={acceptTerms}
          onChange={(e) => {
            setAcceptTerms(e.target.checked);
            touch("acceptTerms");
            if (serverErrors.acceptTerms) setServerErrors((p) => ({ ...p, acceptTerms: undefined }));
          }}
          error={errorFor("acceptTerms")}
          label={
            <>
              I agree to the{" "}
              <Link to="/terms" target="_blank" className="link">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/privacy" target="_blank" className="link">
                Privacy Policy
              </Link>
            </>
          }
        />

        <TurnstileWidget ref={captchaRef} onToken={setCaptchaToken} action="signup" />

        <Button
          type="submit"
          fullWidth
          loading={submitting}
          disabled={!captchaToken}
          data-testid="signup-submit"
          className="py-3 text-[15px]"
        >
          {submitting ? (
            "Creating account…"
          ) : (
            <>
              Create Account <ArrowRightIcon className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link to="/login" className="link" data-testid="signup-to-login">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
