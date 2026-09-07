interface SkeletonLoaderProps {
  variant?: 'card' | 'row' | 'kpi' | 'text';
  count?: number;
  className?: string;
}

export default function SkeletonLoader({
  variant = 'row',
  count = 3,
  className = '',
}: SkeletonLoaderProps) {
  const items = Array.from({ length: count });

  if (variant === 'kpi') {
    return (
      <div className={`grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 ${className}`}>
        {items.map((_, i) => (
          <div
            key={i}
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm animate-pulse space-y-2"
          >
            <div className="h-3 w-16 bg-slate-200 rounded" />
            <div className="h-7 w-12 bg-slate-300 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`space-y-4 ${className}`}>
        {items.map((_, i) => (
          <div
            key={i}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm animate-pulse space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-200" />
                <div className="space-y-1.5">
                  <div className="h-4 w-32 bg-slate-300 rounded" />
                  <div className="h-3 w-20 bg-slate-200 rounded" />
                </div>
              </div>
              <div className="h-6 w-24 bg-slate-200 rounded-full" />
            </div>
            <div className="h-3 w-3/4 bg-slate-100 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <div className={`space-y-2 animate-pulse ${className}`}>
        {items.map((_, i) => (
          <div key={i} className="h-4 bg-slate-200 rounded w-full" />
        ))}
      </div>
    );
  }

  // Variant 'row' default para tablas o listas
  return (
    <div className={`space-y-2.5 ${className}`}>
      {items.map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between p-3.5 bg-white border border-slate-200 rounded-xl animate-pulse"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-200 shrink-0" />
            <div className="space-y-1.5">
              <div className="h-3.5 w-40 bg-slate-300 rounded" />
              <div className="h-2.5 w-24 bg-slate-200 rounded" />
            </div>
          </div>
          <div className="h-6 w-20 bg-slate-200 rounded-full" />
        </div>
      ))}
    </div>
  );
}
