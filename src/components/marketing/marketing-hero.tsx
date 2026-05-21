import { ReactNode } from 'react';

type MarketingHeroProps = {
  badge?: ReactNode;
  title: ReactNode;
  subtitle?: string;
  children?: ReactNode;
  compact?: boolean;
};

export function MarketingHero({ badge, title, subtitle, children, compact }: MarketingHeroProps) {
  return (
    <section
      className={`hero-glow relative overflow-hidden ${compact ? 'py-16 md:py-20' : 'section-pad'}`}
    >
      <div className="container-narrow text-center max-w-4xl mx-auto relative z-10">
        {badge && <p className="marketing-hero-badge mb-6">{badge}</p>}
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-ink mb-6 text-balance leading-[1.08] tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-lg md:text-xl text-ink-muted mb-8 max-w-2xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        )}
        {children}
      </div>
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[480px] h-[240px] rounded-full bg-brand/15 blur-[80px] pointer-events-none"
        aria-hidden
      />
    </section>
  );
}

/** @deprecated Import from marketing-shell */
export { marketingCardClass } from './marketing-shell';
