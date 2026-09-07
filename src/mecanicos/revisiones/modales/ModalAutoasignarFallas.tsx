import { useState, useEffect } from 'react';
import { UserCheck, Users, CheckSquare, Square, Wrench, Info, CheckCircle2 } from 'lucide-react';
import ModalBase from '../../../components/ModalBase/ModalBase';
import MecanicoSelector from '../../../components/MecanicoSelector/MecanicoSelector';
import type { MecanicoItem } from '../../../usuarios/auth/authService';
import type { SolicitudDTO } from '../../../conductores/mantencion/mantencionService';

export interface ModalAutoasignarFallasProps {
  isOpen: boolean;
  solicitud: SolicitudDTO | null;
  selectedDetallesIds: number[];
  onToggleDetalle: (id: number) => void;
  currentUserId: number | null;
  accionLoading: boolean;
  onConfirmar: (colaboradoresIds: number[], comentario?: string) => Promise<void>;
  onClose: () => void;
}

export default function ModalAutoasignarFallas({
  isOpen,
  solicitud,
  selectedDetallesIds,
  onToggleDetalle,
  currentUserId,
  accionLoading,
  onConfirmar,
  onClose,
}: ModalAutoasignarFallasProps) {
  const [colaboradores, setColaboradores] = useState<MecanicoItem[]>([]);
  const [comentario, setComentario] = useState('');
  const [errorLocal, setErrorLocal] = useState<string | null>(null);

  // Reiniciar estado al abrir el modal
  useEffect(() => {
    if (isOpen) {
      setColaboradores([]);
      setComentario('');
      setErrorLocal(null);
    }
  }, [isOpen]);

  if (!solicitud) return null;

  const handleConfirmar = async () => {
    if (selectedDetallesIds.length === 0) {
      setErrorLocal('Debes seleccionar al menos una avería para autoasignarte.');
      return;
    }
    setErrorLocal(null);
    const colabIds = colaboradores.map((c) => c.id);
    await onConfirmar(colabIds, comentario.trim() || undefined);
  };

  const fallasDisponibles = solicitud.detalles || [];

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      title={`Autoasignar Averías • Bus ${solicitud.n_bus} (#${solicitud.id})`}
      icon={<UserCheck size={22} className="text-indigo-600" />}
      maxWidth="md"
      footer={
        <div className="flex gap-2 w-full">
          <button
            type="button"
            onClick={onClose}
            disabled={accionLoading}
            className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer transition min-h-[44px]"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirmar}
            disabled={accionLoading || selectedDetallesIds.length === 0}
            className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-md cursor-pointer transition flex items-center justify-center gap-1.5 disabled:opacity-50 min-h-[44px]"
          >
            <UserCheck size={16} />
            <span>
              {accionLoading
                ? 'Asignando...'
                : `Confirmar Asignación (${selectedDetallesIds.length})`}
            </span>
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Banner informativo de co-responsabilidad */}
        <div className="p-3 bg-indigo-50/90 border border-indigo-200 rounded-2xl flex items-start gap-2.5">
          <Info size={18} className="text-indigo-600 shrink-0 mt-0.5" />
          <div className="text-xs text-indigo-900 space-y-0.5">
            <p className="font-extrabold">Autoasignación colaborativa de averías</p>
            <p className="text-indigo-700 text-[11px] leading-relaxed">
              Quedarás asignado como responsable activo en las averías seleccionadas. Si agregas compañeros, trabajarán juntos en equipo sobre las mismas fallas.
            </p>
          </div>
        </div>

        {errorLocal && (
          <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl">
            {errorLocal}
          </div>
        )}

        {/* 1. Averías a tomar */}
        <div className="space-y-1.5">
          <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Wrench size={13} className="text-slate-500" />
              Averías Pendientes ({selectedDetallesIds.length} de {fallasDisponibles.filter((d) => !d.resuelto).length}):
            </span>
          </label>

          <div className="max-h-36 overflow-y-auto space-y-1.5 p-1 border border-slate-200 rounded-xl bg-slate-50/50">
            {fallasDisponibles.map((det) => {
              const isSelected = selectedDetallesIds.includes(det.id);
              const yaResuelta = Boolean(det.resuelto);
              return (
                <div
                  key={det.id}
                  onClick={() => {
                    if (yaResuelta) return;
                    onToggleDetalle(det.id);
                  }}
                  className={`p-2.5 rounded-lg border text-xs font-medium flex items-center gap-2.5 transition select-none ${
                    yaResuelta
                      ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                      : isSelected
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-950 font-bold shadow-xs cursor-pointer'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer'
                  }`}
                  title={yaResuelta ? 'Avería ya resuelta (bloqueada)' : undefined}
                >
                  {yaResuelta ? (
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                  ) : isSelected ? (
                    <CheckSquare size={16} className="text-indigo-600 shrink-0" />
                  ) : (
                    <Square size={16} className="text-slate-400 shrink-0" />
                  )}
                  <span className={`min-w-0 flex-1 truncate ${yaResuelta ? 'line-through text-slate-400' : ''}`}>
                    {det.descripcion_personalizada}
                  </span>
                  {yaResuelta && (
                    <span className="ml-auto text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded shrink-0">
                      Resuelta ✓
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Selector de compañeros */}
        <div className="pt-1">
          <MecanicoSelector
            selectedMecanicos={colaboradores}
            onChange={setColaboradores}
            label="Compañeros de Equipo (Opcional)"
            placeholder="Buscar compañero por nombre (ej: Santiago)..."
            excludeId={currentUserId ?? undefined}
          />
          {colaboradores.length > 0 && (
            <p className="text-[11px] font-bold text-indigo-600 mt-1 flex items-center gap-1">
              <Users size={12} />
              <span>
                {colaboradores.length} compañero(s) co-asignado(s) a las fallas seleccionadas.
              </span>
            </p>
          )}
        </div>

        {/* 3. Comentario u observación opcional */}
        <div className="space-y-1">
          <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
            Nota u Observación Inicial (Opcional):
          </label>
          <textarea
            rows={2}
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            placeholder="Ej: Iniciando desmontaje de conjunto de frenos en pareja..."
            className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white text-slate-800"
          />
        </div>
      </div>
    </ModalBase>
  );
}
