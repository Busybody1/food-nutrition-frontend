import { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

type MarketingHeroProps = {
  badge?: ReactNode;
  title: ReactNode;
  subtitle?: string;
  children?: ReactNode;
  compact?: boolean;
  /**
   * Optional right-hand slot (code window, screenshot, product proof).
   * When present the hero switches to a left-aligned two-column layout on lg+.
   */
  aside?: ReactNode;
};

export function MarketingHero({
  badge,
  title,
  subtitle,
  children,
  compact,
  aside,
}: MarketingHeroProps) {
  const content = (
    <>
      {badge && <p className="marketing-hero-badge mb-6 animate-rise">{badge}</p>}
      <h1
        className={cn(
          'font-display text-4xl sm:text-5xl md:text-6xl text-ink mb-6 text-balance leading-[1.08] tracking-tight animate-rise stagger-2',
          aside && 'lg:text-5xl xl:text-6xl'
        )}
      >
        {title}
      </h1>
      {subtitle && (
        <p
          className={cn(
            'text-lg md:text-xl text-ink-muted mb-8 max-w-2xl mx-auto leading-relaxed animate-rise stagger-3',
            aside && 'lg:mx-0'
          )}
        >
          {subtitle}
        </p>
      )}
      {children && <div className="animate-rise stagger-4">{children}</div>}
    </>
  );

  return (
    <section className={cn('hero-glow', compact ? 'hero-pad-compact' : 'hero-pad')}>
      {aside ? (
        <div className="container-narrow relative z-10">
          <div className="grid items-center gap-10 lg:gap-12 lg:grid-cols-[1fr,0.9fr]">
            <div className="text-center lg:text-left min-w-0">{content}</div>
            <div className="min-w-0 animate-rise stagger-4">{aside}</div>
          </div>
        </div>
      ) : (
        <div className="container-narrow text-center max-w-4xl mx-auto relative z-10">
          {content}
        </div>
      )}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[480px] h-[240px] rounded-full bg-brand/15 blur-[80px] pointer-events-none"
        aria-hidden
      />
      <div
        className="absolute -top-10 right-[12%] w-[280px] h-[280px] rounded-full bg-accent-orange/10 blur-[90px] pointer-events-none"
        aria-hidden
      />
    </section>
  );
}

/** @deprecated Import from marketing-shell */
export { marketingCardClass } from './marketing-shell';
