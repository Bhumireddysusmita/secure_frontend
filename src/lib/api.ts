// Thin fetch wrapper for the backend. Every call is same-origin (/api is
// proxied in dev), sends the HttpOnly session cookie, and normalises the
// backend's { ok, error: { code, message, fields } } envelope.

export type User = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

export type ApiError = {
  code: string;
  message: string;
  fields?: Record<string, string>;
};

export type ApiResult<T> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; error: ApiError; retryAfterSeconds?: number };

export const NETWORK_ERROR_MESSAGE = "Can't reach the server, check your connection";

async function request<T>(method: "GET" | "POST", path: string, body?: unknown): Promise<ApiResult<T>> {
  let res: Response;
  try {
    res = await fetch(`/api${path}`, {
      method,
      credentials: "same-origin",
      cache: "no-store",
      headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    return { ok: false, status: 0, error: { code: "network_error", message: NETWORK_ERROR_MESSAGE } };
  }

  let json: Record<string, unknown> = {};
  if (res.status !== 204) {
    try {
      json = await res.json();
    } catch {
      // A proxy error page or empty body: treat as server unreachable / failed.
      if (res.status >= 500 || res.status === 0) {
        return { ok: false, status: res.status, error: { code: "network_error", message: NETWORK_ERROR_MESSAGE } };
      }
    }
  }

  if (res.ok) return { ok: true, status: res.status, data: json as T };

  const retryHeader = res.headers.get("Retry-After");
  const retryAfterSeconds = retryHeader ? Number.parseInt(retryHeader, 10) || undefined : undefined;
  const error = (json.error as ApiError | undefined) ?? {
    code: res.status >= 500 ? "server_error" : "request_failed",
    message: res.status >= 500 ? "Something went wrong on our side. Please try again." : "Request failed.",
  };
  return { ok: false, status: res.status, error, retryAfterSeconds };
}

export const api = {
  me: () => request<{ ok: true; user: User }>("GET", "/auth/me"),
  signup: (body: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    acceptTerms: boolean;
    captchaToken: string;
  }) =>
    request<{ ok: true; user: User }>("POST", "/auth/signup", body),
  login: (body: { email: string; password: string; captchaToken: string }) =>
    request<{ ok: true; user: User }>("POST", "/auth/login", body),
  logout: () => request<void>("POST", "/auth/logout"),
};

/** "Try again in N min" helper for 429 responses. */
export function minutesFrom(seconds?: number): number {
  return Math.max(1, Math.ceil((seconds ?? 60) / 60));
}

/** Only allow same-site relative paths for ?next= redirects (blocks //evil.com and /\evil.com). */
export function safeNextPath(next: string | null): string | null {
  if (!next) return null;
  if (!next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return null;
  return next;
}
