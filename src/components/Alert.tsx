import type { ReactNode } from "react";

type Kind = "error" | "success" | "info";

const styles: Record<Kind, string> = {
  error: "border-danger-200 bg-danger-50 text-danger-700",
  success: "border-success-200 bg-success-50 text-success-700",
  info: "border-primary-200 bg-primary-50 text-primary-800",
};

const icons: Record<Kind, ReactNode> = {
  error: (
    <path
      fillRule="evenodd"
      d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
      clipRule="evenodd"
    />
  ),
  success: (
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
      clipRule="evenodd"
    />
  ),
  info: (
    <path
      fillRule="evenodd"
      d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z"
      clipRule="evenodd"
    />
  ),
};

export function Alert({ kind = "error", children, testId }: { kind?: Kind; children: ReactNode; testId?: string }) {
  return (
    <div
      role="alert"
      data-testid={testId ?? `alert-${kind}`}
      className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm ${styles[kind]}`}
    >
      <svg viewBox="0 0 20 20" fill="currentColor" className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true">
        {icons[kind]}
      </svg>
      <div className="flex-1">{children}</div>
    </div>
  );
}
