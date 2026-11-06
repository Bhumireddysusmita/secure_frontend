import { Component, type ErrorInfo, type ReactNode } from "react";

type State = { hasError: boolean };

/** Global error boundary: shows a friendly message instead of a blank screen. */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Log the error type only; never user input.
    console.error("UI error:", error.name, info.componentStack?.split("\n")[1]?.trim());
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center" role="alert" data-testid="error-boundary">
        <h1 className="text-2xl font-bold text-slate-900">Something went wrong</h1>
        <p className="mt-2 text-slate-600">An unexpected error occurred. Please try again.</p>
        <button
          type="button"
          onClick={() => {
            this.setState({ hasError: false });
            window.location.reload();
          }}
          className="mt-6 inline-flex rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"
          data-testid="error-retry"
        >
          Try again
        </button>
      </div>
    );
  }
}
