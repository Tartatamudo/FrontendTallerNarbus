import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

export interface PaginationControlProps {
  page: number;
  pageSize: number;
  itemCount: number;
  hasMore: boolean;
  onPageChange: (newPage: number) => void;
  loading?: boolean;
  disabled?: boolean;
  label?: string; // e.g., 'órdenes', 'buses', 'registros'
  className?: string;
}

export default function PaginationControl({
  page,
  pageSize: _pageSize,
  itemCount,
  hasMore,
  onPageChange,
  loading = false,
  disabled = false,
  label = 'registros',
  className = '',
}: PaginationControlProps) {
  const isFirstPage = page <= 1;
  const isNextDisabled = disabled || loading || !hasMore;
  const isPrevDisabled = disabled || loading || isFirstPage;

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white border border-slate-200 rounded-2xl shadow-xs transition-colors [data-theme=dark]_&:bg-[#15171c] [data-theme=dark]_&:border-white/10 ${className}`}
    >
      {/* Información de Ítems */}
      <div className="flex items-center gap-2 text-xs font-bold text-slate-600 [data-theme=dark]_&:text-slate-400">
        {loading ? (
          <div className="flex items-center gap-1.5 text-indigo-600 [data-theme=dark]_&:text-sky-400">
            <Loader2 size={15} className="animate-spin shrink-0" />
            <span>Cargando {label}...</span>
          </div>
        ) : (
          <span>
            Mostrando <span className="font-black text-slate-900 [data-theme=dark]_&:text-white">{itemCount}</span>{' '}
            {label} en <span className="text-indigo-600 [data-theme=dark]_&:text-sky-400 font-extrabold">Página {page}</span>
          </span>
        )}
      </div>

      {/* Controles de Navegación con Área Táctil >= 44x44px */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={isPrevDisabled}
          className={`min-h-[44px] min-w-[44px] px-3.5 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all duration-150 cursor-pointer ${
            isPrevDisabled
              ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400 [data-theme=dark]_&:bg-white/5 [data-theme=dark]_&:text-slate-600 border border-transparent'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95 [data-theme=dark]_&:bg-white/10 [data-theme=dark]_&:hover:bg-white/15 [data-theme=dark]_&:text-slate-200 border border-slate-200/60 [data-theme=dark]_&:border-white/10 shadow-xs'
          }`}
          aria-label="Página anterior"
        >
          <ChevronLeft size={16} />
          <span>Anterior</span>
        </button>

        {/* Badge Indicador de Página */}
        <div className="min-h-[44px] min-w-[44px] px-3 py-2 flex items-center justify-center bg-indigo-50 border border-indigo-200/80 text-indigo-700 rounded-xl text-xs font-black shadow-inner [data-theme=dark]_&:bg-sky-500/10 [data-theme=dark]_&:border-sky-500/30 [data-theme=dark]_&:text-sky-400">
          <span>{page}</span>
        </div>

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={isNextDisabled}
          className={`min-h-[44px] min-w-[44px] px-3.5 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all duration-150 cursor-pointer ${
            isNextDisabled
              ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400 [data-theme=dark]_&:bg-white/5 [data-theme=dark]_&:text-slate-600 border border-transparent'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white active:scale-95 [data-theme=dark]_&:bg-sky-500 [data-theme=dark]_&:hover:bg-sky-400 [data-theme=dark]_&:text-slate-950 shadow-sm shadow-indigo-600/20'
          }`}
          aria-label="Página siguiente"
        >
          <span>Siguiente</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
