import { useEffect } from "react";
import { ButtonLink } from "../components/Button";
import { ArrowLeftIcon } from "../components/Icons";
import { APP_NAME } from "../components/Layout";

export function NotFoundPage() {
  useEffect(() => {
    document.title = `Page not found · ${APP_NAME}`;
  }, []);

  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center" data-testid="not-found">
      <p className="bg-brand-gradient bg-clip-text text-7xl font-extrabold text-transparent">404</p>
      <h1 className="mt-3 text-3xl font-extrabold tracking-tight">Page not found</h1>
      <p className="mt-2 text-slate-600">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
      <ButtonLink to="/" pill className="mt-8 px-6" data-testid="not-found-home">
        <ArrowLeftIcon className="h-4 w-4" /> Back to home
      </ButtonLink>
    </div>
  );
}
