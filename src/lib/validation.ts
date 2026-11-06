// Client-side validation. Mirrors backend/app/validation.py rule for rule, in the same
// order, with the same messages; test-data/validation-cases.json proves they agree.
// The client copy is for instant feedback only. The server is always the source of truth.

import { isCommonPassword } from "./commonPasswords";

export const NAME_MIN = 2;
export const NAME_MAX = 80;
export const EMAIL_MAX = 254;
export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 72;

export const MSG = {
  invalidValue: "Invalid value",
  nameRequired: "Full name is required",
  nameMin: `Name must be at least ${NAME_MIN} characters`,
  nameMax: `Name must be at most ${NAME_MAX} characters`,
  nameChars: "Use letters, single spaces, hyphens and apostrophes only",
  emailRequired: "Email is required",
  emailMax: `Email must be at most ${EMAIL_MAX} characters`,
  emailInvalid: "Enter a valid email address",
  passwordRequired: "Password is required",
  passwordMin: `Password must be at least ${PASSWORD_MIN} characters`,
  passwordMax: `Password must be at most ${PASSWORD_MAX} characters`,
  passwordChars: "Password contains characters that aren't allowed",
  passwordLetter: "Password must contain a letter",
  passwordNumber: "Password must contain a number",
  passwordCommon: "This password is too common. Choose a less predictable one",
  passwordPersonal: "Password must not contain your name or email",
  confirmRequired: "Please confirm your password",
  confirmMismatch: "Passwords do not match",
  terms: "Please accept the Terms of Service and Privacy Policy",
  loginPasswordMax: "Password is too long",
} as const;

export type SignupField = "name" | "email" | "password" | "confirmPassword" | "acceptTerms";
export type LoginField = "email" | "password";
export type FieldErrors<K extends string> = Partial<Record<K, string>>;

const WRONG = Symbol("wrong-type");
type Raw = string | null | typeof WRONG;

function get(body: Record<string, unknown>, key: string): Raw {
  const v = body[key];
  if (v === undefined || v === null) return null;
  return typeof v === "string" ? v : WRONG;
}

/** Length in Unicode code points, matching Python's len(). */
const cpLength = (s: string) => [...s].length;
const utf8Length = (s: string) => new TextEncoder().encode(s).length;

const NAME_RE = /^\p{L}[\p{L}\p{M}]*(?:[ '-]\p{L}[\p{L}\p{M}]*)*$/u;
const EMAIL_RE =
  /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,63}$/;

export function normaliseName(raw: string): string {
  return raw
    .normalize("NFC")
    .replace(/[’‘ʼ]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export const normaliseEmail = (raw: string) => raw.trim().toLowerCase();

type Result = [value: string | null, error: string | null];

export function checkName(raw: Raw): Result {
  if (raw === WRONG) return [null, MSG.invalidValue];
  if (raw === null || !raw.trim()) return [null, MSG.nameRequired];
  const name = normaliseName(raw);
  if (cpLength(name) < NAME_MIN) return [null, MSG.nameMin];
  if (cpLength(name) > NAME_MAX) return [null, MSG.nameMax];
  if (!NAME_RE.test(name)) return [null, MSG.nameChars];
  return [name, null];
}

export function checkEmail(raw: Raw): Result {
  if (raw === WRONG) return [null, MSG.invalidValue];
  if (raw === null || !raw.trim()) return [null, MSG.emailRequired];
  const email = normaliseEmail(raw);
  if (cpLength(email) > EMAIL_MAX) return [null, MSG.emailMax];
  if (!EMAIL_RE.test(email) || email.split("@")[0].length > 64) return [null, MSG.emailInvalid];
  return [email, null];
}

function personalTokens(name: string | null, email: string | null): string[] {
  const tokens: string[] = [];
  if (name) tokens.push(...name.toLowerCase().split(/[ '-]/));
  if (email) tokens.push(...email.split("@")[0].split(/[._+-]/));
  return tokens.filter((t) => cpLength(t) >= 4);
}

export function checkNewPassword(raw: Raw, name: string | null = null, email: string | null = null): Result {
  if (raw === WRONG) return [null, MSG.invalidValue];
  if (raw === null || raw === "") return [null, MSG.passwordRequired];
  if (cpLength(raw) < PASSWORD_MIN) return [null, MSG.passwordMin];
  if (cpLength(raw) > PASSWORD_MAX || utf8Length(raw) > PASSWORD_MAX) return [null, MSG.passwordMax];
  if (/\p{Cc}/u.test(raw)) return [null, MSG.passwordChars];
  if (!/\p{L}/u.test(raw)) return [null, MSG.passwordLetter];
  if (!/\p{Nd}/u.test(raw)) return [null, MSG.passwordNumber];
  if (isCommonPassword(raw)) return [null, MSG.passwordCommon];
  const lowered = raw.toLowerCase();
  if (personalTokens(name, email).some((t) => lowered.includes(t))) return [null, MSG.passwordPersonal];
  return [raw, null];
}

export function validateSignup(body: Record<string, unknown>): FieldErrors<SignupField> {
  const errors: FieldErrors<SignupField> = {};

  const [name, nameErr] = checkName(get(body, "name"));
  if (nameErr) errors.name = nameErr;
  const [email, emailErr] = checkEmail(get(body, "email"));
  if (emailErr) errors.email = emailErr;
  const [, passwordErr] = checkNewPassword(get(body, "password"), name, email);
  if (passwordErr) errors.password = passwordErr;

  const confirm = get(body, "confirmPassword");
  if (confirm === WRONG) errors.confirmPassword = MSG.invalidValue;
  else if (!confirm) errors.confirmPassword = MSG.confirmRequired;
  else if (confirm !== get(body, "password")) errors.confirmPassword = MSG.confirmMismatch;

  if (body.acceptTerms !== true) errors.acceptTerms = MSG.terms;
  return errors;
}

export function validateLogin(body: Record<string, unknown>): FieldErrors<LoginField> {
  const errors: FieldErrors<LoginField> = {};

  const [, emailErr] = checkEmail(get(body, "email"));
  if (emailErr) errors.email = emailErr;

  const password = get(body, "password");
  if (password === WRONG) errors.password = MSG.invalidValue;
  else if (!password) errors.password = MSG.passwordRequired;
  else if (cpLength(password) > PASSWORD_MAX || utf8Length(password) > PASSWORD_MAX)
    errors.password = MSG.loginPasswordMax;

  return errors;
}
