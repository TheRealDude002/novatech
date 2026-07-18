import { Link } from 'react-router-dom';
import { cn } from '../services/api';

export default function Logo({ dark = false, className = '' }) {
  const text = dark ? 'text-paper' : 'text-ink';
  return (
    <Link to="/" className={cn('group inline-flex items-center gap-2', className)} aria-label="NovaTech home">
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none" className="shrink-0">
        <rect width="32" height="32" rx="2" className={dark ? 'fill-paper' : 'fill-ink'} />
        <path
          d="M7 22V10L13 18V10M16 10V22L22 14V22M25 10V22"
          stroke="#FF4D2E"
          strokeWidth="2"
          strokeLinecap="square"
        />
      </svg>
      <span className={cn('font-display text-lg font-semibold tracking-tighter', text)}>
        Nova<span className="text-accent">Tech</span>
      </span>
    </Link>
  );
}
