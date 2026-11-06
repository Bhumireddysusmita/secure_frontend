import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

// Minimal typing for the global Cloudflare Turnstile API.
type TurnstileApi = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  reset: (widgetId?: string) => void;
  remove: (widgetId?: string) => void;
};
declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
let scriptPromise: Promise<void> | null = null;

function loadScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = SCRIPT_SRC;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => {
      scriptPromise = null;
      reject(new Error("Turnstile script failed to load"));
    };
    document.head.appendChild(s);
  });
  return scriptPromise;
}

export type TurnstileHandle = { reset: () => void };

type Props = {
  onToken: (token: string | null) => void;
  action?: string;
};

/** Renders the Cloudflare Turnstile challenge and reports its token. Call ref.reset() after each submit. */
export const TurnstileWidget = forwardRef<TurnstileHandle, Props>(function TurnstileWidget({ onToken, action }, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const onTokenRef = useRef(onToken);
  onTokenRef.current = onToken;
  const [loadError, setLoadError] = useState(false);
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;

  useImperativeHandle(ref, () => ({
    reset: () => {
      onTokenRef.current(null);
      if (window.turnstile && widgetId.current) window.turnstile.reset(widgetId.current);
    },
  }));

  useEffect(() => {
    if (!siteKey) return;
    let cancelled = false;
    loadScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.turnstile) return;
        widgetId.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          action,
          theme: "light",
          callback: (token: string) => onTokenRef.current(token),
          "expired-callback": () => onTokenRef.current(null),
          "error-callback": () => onTokenRef.current(null),
        });
      })
      .catch(() => !cancelled && setLoadError(true));
    return () => {
      cancelled = true;
      if (window.turnstile && widgetId.current) window.turnstile.remove(widgetId.current);
      widgetId.current = null;
    };
  }, [siteKey, action]);

  if (!siteKey) {
    return (
      <p className="text-sm text-danger-700" data-testid="captcha-missing">
        CAPTCHA is not configured (set VITE_TURNSTILE_SITE_KEY).
      </p>
    );
  }

  return (
    <div>
      <div ref={containerRef} data-testid="captcha" className="min-h-[65px]" role="group" aria-label="CAPTCHA verification" />
      {loadError && (
        <p className="mt-1 text-sm text-danger-700" role="alert" data-testid="captcha-load-error">
          Couldn&apos;t load the CAPTCHA. Check your connection and reload the page.
        </p>
      )}
    </div>
  );
});
