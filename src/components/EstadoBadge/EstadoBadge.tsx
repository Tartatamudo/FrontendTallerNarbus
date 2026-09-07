import { obtenerEstilosBadgeEstado } from '../../utils/formatters';

export interface EstadoBadgeProps {
  estado?: string | null;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

export default function EstadoBadge({
  estado,
  size = 'xs',
  className = '',
}: EstadoBadgeProps) {
  const { badgeClass, dotClass, label } = obtenerEstilosBadgeEstado(estado);

  const sizeClasses = {
    xs: 'px-2.5 py-0.5 text-[10px]',
    sm: 'px-3 py-1 text-xs',
    md: 'px-3.5 py-1.5 text-sm font-black',
  };

  const dotSizes = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-black uppercase tracking-wider rounded-full border shadow-xs ${sizeClasses[size]} ${badgeClass} ${className}`}
    >
      <span className={`rounded-full shrink-0 ${dotSizes[size]} ${dotClass}`} />
      <span>{label}</span>
    </span>
  );
}
