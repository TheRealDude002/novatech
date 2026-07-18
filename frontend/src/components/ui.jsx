import { cn } from '../services/api';

export function Spinner({ className = '' }) {
  return (
    <svg
      className={cn('animate-spin', className)}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.2" strokeWidth="2.5" />
      <path
        d="M22 12a10 10 0 0 1-10 10"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Skeleton({ className = '' }) {
  return <div className={cn('animate-pulse bg-ink/8', className)} />;
}

export function ProductCardSkeleton() {
  return (
    <div className="card-surface">
      <Skeleton className="aspect-square w-full" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-5 w-1/2" />
      </div>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, message, action }) {
  return (
    <div className="grid place-items-center px-6 py-20 text-center">
      {Icon && (
        <div className="grid h-14 w-14 place-items-center bg-paper-warm">
          <Icon className="h-6 w-6 text-mist-dark" />
        </div>
      )}
      <h3 className="mt-5 font-display text-2xl font-medium tracking-tighter text-ink">
        {title}
      </h3>
      <p className="mt-2 max-w-md text-sm text-mist-dark">{message}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function SectionHeader({ eyebrow, title, action, dark = false }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-ink/10 pb-4">
      <div>
        {eyebrow && (
          <p className={dark ? 'eyebrow text-paper/50' : 'eyebrow text-mist-dark'}>
            {eyebrow}
          </p>
        )}
        <h2
          className={
            dark
              ? 'mt-2 font-display text-3xl font-medium tracking-tightest text-paper sm:text-4xl'
              : 'mt-2 font-display text-3xl font-medium tracking-tightest text-ink sm:text-4xl'
          }
        >
          {title}
        </h2>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
