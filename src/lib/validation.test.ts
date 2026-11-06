// Runs test-data/validation-cases.json against the browser rules.
// backend/tests/test_validation_parity.py runs the same file against the server rules.
import { describe, expect, it } from "vitest";
import data from "../../../test-data/validation-cases.json";
import { normaliseName, validateLogin, validateSignup } from "./validation";

type Case = {
  id: string;
  form: "signup" | "login";
  serverOnly?: boolean;
  set?: Record<string, unknown>;
  body?: Record<string, unknown>;
  expect: Record<string, string>;
};

function expand(value: unknown): unknown {
  if (value && typeof value === "object" && "$repeat" in value) {
    const v = value as { $repeat: [string, number]; $suffix?: string };
    return v.$repeat[0].repeat(v.$repeat[1]) + (v.$suffix ?? "");
  }
  return value;
}

function buildBody(c: Case): Record<string, unknown> {
  if (c.body) return Object.fromEntries(Object.entries(c.body).map(([k, v]) => [k, expand(v)]));
  const base = { ...(c.form === "signup" ? data.signupBase : data.loginBase) } as Record<string, unknown>;
  for (const [k, v] of Object.entries(c.set ?? {})) base[k] = expand(v);
  return base;
}

const cases = (data.cases as Case[]).filter((c) => !c.serverOnly);

describe("browser validation matches the shared cases", () => {
  it.each(cases.map((c) => [c.id, c] as const))("%s", (_id, c) => {
    const errors = c.form === "signup" ? validateSignup(buildBody(c)) : validateLogin(buildBody(c));
    expect(errors).toEqual(c.expect);
  });
});

describe("normalisation", () => {
  it("collapses spaces and straightens apostrophes like the server", () => {
    expect(normaliseName("  Ada     D’Angelo  ")).toBe("Ada D'Angelo");
  });
});
