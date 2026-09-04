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
  const { badgeClass, label } = obtenerEstilosBadgeEstado(estado);

  const sizeClasses = {
    xs: 'px-2 py-0.5 text-[10px]',
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm font-black',
  };

  return (
    <span
      className={`inline-flex items-center justify-center font-black uppercase tracking-wider rounded-full border ${sizeClasses[size]} ${badgeClass} ${className}`}
    >
      {label}
    </span>
  );
}
