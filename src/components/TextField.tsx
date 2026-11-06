import { forwardRef, useId, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { EyeIcon, EyeOffIcon } from "./Icons";

type FieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
  label: string;
  hint?: ReactNode;
  error?: string;
  testId: string;
  /** Decorative icon shown inside the input on the left. */
  icon?: ReactNode;
};

function useDescribedBy(hint: ReactNode, error: string | undefined) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  return { id, hintId, errorId, describedBy: [errorId, hintId].filter(Boolean).join(" ") || undefined };
}

/**
 * Hint / error line under a field. It always reserves one line, so an error appearing on
 * blur never shifts the controls below it (which made clicks on them miss).
 */
function Messages({ testId, error, errorId, hint, hintId }: { testId: string; error?: string; errorId?: string; hint?: ReactNode; hintId?: string }) {
  return (
    <div className="min-h-[20px] text-[13px] leading-5">
      {error ? (
        <p id={errorId} data-testid={`${testId}-error`} className="font-medium text-danger-700">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-slate-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function LeadingIcon({ icon, error }: { icon?: ReactNode; error?: string }) {
  if (!icon) return null;
  return (
    <span
      className={`pointer-events-none absolute inset-y-0 left-0 flex w-11 items-center justify-center border-r ${
        error ? "border-danger-200 text-danger-600" : "border-slate-200 text-slate-500"
      }`}
    >
      {icon}
    </span>
  );
}

/** Labelled input with optional leading icon, hint and inline error linked via aria-describedby. */
export const TextField = forwardRef<HTMLInputElement, FieldProps>(function TextField(
  { label, hint, error, testId, icon, className = "", ...rest },
  ref,
) {
  const { id, hintId, errorId, describedBy } = useDescribedBy(hint, error);
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-[13px] font-semibold text-slate-700">
        {label}
      </label>
      <div className="relative">
        <LeadingIcon icon={icon} error={error} />
        <input
          ref={ref}
          id={id}
          data-testid={testId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`input ${icon ? "pl-14" : ""} ${error ? "input-error" : ""} ${className}`}
          {...rest}
        />
      </div>
      <Messages testId={testId} error={error} errorId={errorId} hint={hint} hintId={hintId} />
    </div>
  );
});

/** Password input with an accessible show/hide toggle. */
export const PasswordField = forwardRef<HTMLInputElement, FieldProps>(function PasswordField(
  { label, hint, error, testId, icon, ...rest },
  ref,
) {
  const { id, hintId, errorId, describedBy } = useDescribedBy(hint, error);
  const [visible, setVisible] = useState(false);
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-[13px] font-semibold text-slate-700">
        {label}
      </label>
      <div className="relative">
        <LeadingIcon icon={icon} error={error} />
        <input
          ref={ref}
          id={id}
          type={visible ? "text" : "password"}
          data-testid={testId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`input pr-12 ${icon ? "pl-14" : ""} ${error ? "input-error" : ""}`}
          {...rest}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          aria-pressed={visible}
          data-testid={`${testId}-toggle`}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-slate-400 hover:text-primary-600"
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
      <Messages testId={testId} error={error} errorId={errorId} hint={hint} hintId={hintId} />
    </div>
  );
});

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "type"> & {
  label: ReactNode;
  error?: string;
  testId: string;
};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, error, testId, ...rest },
  ref,
) {
  const id = useId();
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div className="space-y-1">
      <div className="flex items-start gap-2.5">
        <input
          ref={ref}
          id={id}
          type="checkbox"
          data-testid={testId}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          className={`mt-0.5 h-[18px] w-[18px] shrink-0 cursor-pointer rounded border-slate-300 accent-primary-600 ${
            error ? "outline outline-2 outline-danger-600/40" : ""
          }`}
          {...rest}
        />
        <label htmlFor={id} className="cursor-pointer text-[13px] leading-5 text-slate-600">
          {label}
        </label>
      </div>
      {error && (
        <p id={errorId} data-testid={`${testId}-error`} className="pl-7 text-[13px] font-medium text-danger-700">
          {error}
        </p>
      )}
    </div>
  );
});
