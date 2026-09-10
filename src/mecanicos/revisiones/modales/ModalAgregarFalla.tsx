import { useState, useEffect } from 'react';
import { PlusCircle, Wrench, ShieldAlert } from 'lucide-react';
import ModalBase from '../../../components/ModalBase/ModalBase';
import type { AgregarFallaDTO, CategoriaFalla } from '../../../types/mantencion';
import { obtenerCategorias } from '../../../services/mantencionService';

export interface ModalAgregarFallaProps {
  isOpen: boolean;
  solicitudId: number | null;
  nBus?: string;
  accionLoading: boolean;
  onConfirmar: (payload: AgregarFallaDTO) => Promise<void>;
  onClose: () => void;
}

const CATEGORIAS_FALLBACK: { id: number; nombre: string }[] = [
  { id: 1, nombre: 'Frenos' },
  { id: 2, nombre: 'Eléctrico' },
  { id: 3, nombre: 'Motor' },
  { id: 4, nombre: 'Carrocería' },
  { id: 5, nombre: 'Climatización' },
  { id: 6, nombre: 'Otro' },
];

export default function ModalAgregarFalla({
  isOpen,
  solicitudId,
  nBus,
  accionLoading,
  onConfirmar,
  onClose,
}: ModalAgregarFallaProps) {
  const [categoriaId, setCategoriaId] = useState<number>(1);
  const [descripcion, setDescripcion] = useState<string>('');
  const [autoasignar, setAutoasignar] = useState<boolean>(true);
  const [categorias, setCategorias] = useState<CategoriaFalla[]>(CATEGORIAS_FALLBACK as CategoriaFalla[]);
  const [errorLocal, setErrorLocal] = useState<string | null>(null);

  // Cargar categorías activas desde el backend al abrir el modal
  useEffect(() => {
    if (isOpen) {
      setErrorLocal(null);
      setDescripcion('');
      setAutoasignar(true);
      setCategoriaId(1);

      obtenerCategorias()
        .then((cats: CategoriaFalla[]) => {
          if (cats && cats.length > 0) {
            setCategorias(cats.filter((c) => c.is_active));
          }
        })
        .catch(() => {
          // Mantener categorías fallback si la consulta falla
          setCategorias(CATEGORIAS_FALLBACK as CategoriaFalla[]);
        });
    }
  }, [isOpen]);

  if (!solicitudId) return null;

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!descripcion.trim()) {
      setErrorLocal('Debe ingresar una descripción para la avería detectada.');
      return;
    }

    setErrorLocal(null);
    const catSel = categorias.find((c) => c.id === categoriaId);
    await onConfirmar({
      categoria_id: categoriaId,
      falla_id: catSel?.falla_id ?? null,
      descripcion_personalizada: descripcion.trim(),
      autoasignar,
    });
  };

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      title={`Agregar Avería en Taller (Bus ${nBus || `#${solicitudId}`})`}
      icon={<PlusCircle size={22} className="text-indigo-600" />}
      maxWidth="md"
      footer={
        <div className="flex gap-2 w-full">
          <button
            type="button"
            onClick={onClose}
            disabled={accionLoading}
            className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl cursor-pointer hover:bg-slate-200 transition min-h-[44px]"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={accionLoading}
            className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-md cursor-pointer transition flex items-center justify-center gap-1.5 disabled:opacity-50 min-h-[44px]"
          >
            <Wrench size={16} />
            <span>{accionLoading ? 'Guardando...' : 'Agregar Avería'}</span>
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorLocal && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-bold flex items-center gap-2">
            <ShieldAlert size={16} className="shrink-0 text-red-600" />
            <span>{errorLocal}</span>
          </div>
        )}

        {/* Selector de Categoría */}
        <div>
          <label className="block text-xs font-black text-slate-700 mb-1.5 uppercase tracking-wider">
            1. Categoría del Sistema Afectado:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {categorias.map((cat) => {
              const isSelected = categoriaId === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoriaId(cat.id)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-extrabold border transition text-center cursor-pointer min-h-[44px] flex items-center justify-center ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {cat.nombre}
                </button>
              );
            })}
          </div>
        </div>

        {/* Descripción del Hallazgo */}
        <div>
          <label className="block text-xs font-black text-slate-700 mb-1.5 uppercase tracking-wider">
            2. Descripción del Hallazgo en Taller:
          </label>
          <textarea
            rows={3}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Ej: Retén de caja con fuga severa detectado durante la revisión..."
            className="w-full p-3 border border-slate-200 rounded-xl text-xs font-semibold focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition bg-white"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Indica claramente el componente y la anomalía observada.
          </p>
        </div>

        {/* Switch / Checkbox Autoasignar */}
        <label className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-100 transition">
          <input
            type="checkbox"
            checked={autoasignar}
            onChange={(e) => setAutoasignar(e.target.checked)}
            className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer mt-0.5 shrink-0"
          />
          <div>
            <span className="text-xs font-black text-slate-900 block">
              Tomar esta avería inmediatamente
            </span>
            <span className="text-[11px] text-slate-500 font-medium leading-relaxed block mt-0.5">
              Se te autoasignará en la orden e iniciará labores bajo tu turno de trabajo en taller.
            </span>
          </div>
        </label>
      </form>
    </ModalBase>
  );
}
