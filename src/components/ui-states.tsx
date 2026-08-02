import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function PageHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="max-w-2xl">
      {eyebrow && <p className="label-caps text-muted-foreground">{eyebrow}</p>}
      <h1 className="type-h1 mt-3">{title}</h1>
      {description && <p className="type-body mt-4 text-muted-foreground">{description}</p>}
    </div>
  );
}

export function SectionHeading({
  title,
  action,
}: {
  title: string;
  action?: { label: string; to: "/shop" };
}) {
  return (
    <div className="mb-6 flex items-center justify-between gap-4 md:mb-9">
      <h2 className="type-h2 min-w-0">{title}</h2>
      {action && (
        <Link
          to={action.to}
          className="label-caps -mr-2 flex min-h-[44px] shrink-0 items-center px-2 text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="border border-border bg-secondary px-5 py-14 text-center md:px-6">
      <h3 className="type-h3">{title}</h3>
      <p className="type-small mx-auto mt-2 max-w-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}

export function ErrorState({ onRetry, message }: { onRetry?: () => void; message?: string }) {
  return (
    <div className="border border-destructive/30 bg-secondary px-5 py-12 text-center md:px-6">
      <h3 className="type-h3">Something went wrong</h3>
      <p className="type-small mx-auto mt-2 max-w-sm text-muted-foreground">
        {message ?? "We couldn't load this content. Check your connection and try again."}
      </p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn btn-outline mt-6">
          Try again
        </button>
      )}
    </div>
  );
}

export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`mx-auto w-full max-w-7xl px-4 md:px-8 ${className}`}>{children}</div>;
}
