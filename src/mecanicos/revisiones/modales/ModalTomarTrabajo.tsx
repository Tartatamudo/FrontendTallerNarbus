import { Play } from 'lucide-react';
import ModalBase from '../../../components/ModalBase/ModalBase';
import MecanicoSelector from '../../../components/MecanicoSelector/MecanicoSelector';
import type { MecanicoItem } from '../../../usuarios/auth/authService';
import type { SolicitudDTO } from '../../../conductores/mantencion/mantencionService';

export interface ModalTomarTrabajoProps {
  isOpen: boolean;
  solicitud: SolicitudDTO | null;
  colaboradores: MecanicoItem[];
  currentUserId: number | null;
  accionLoading: boolean;
  onColaboradoresChange: (colabs: MecanicoItem[]) => void;
  onConfirmar: () => void;
  onClose: () => void;
}

export default function ModalTomarTrabajo({
  isOpen,
  solicitud,
  colaboradores,
  currentUserId,
  accionLoading,
  onColaboradoresChange,
  onConfirmar,
  onClose,
}: ModalTomarTrabajoProps) {
  if (!solicitud) return null;

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      title={`Tomar Bus ${solicitud.n_bus} (Orden #${solicitud.id})`}
      icon={<Play size={20} className="text-indigo-600" />}
      maxWidth="md"
      footer={
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={accionLoading}
            className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer transition"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            disabled={accionLoading}
            className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-md cursor-pointer transition"
          >
            {accionLoading ? 'Procesando...' : 'Confirmar'}
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <MecanicoSelector
          selectedMecanicos={colaboradores}
          onChange={onColaboradoresChange}
          label="Invitar Colaboradores al Equipo"
          placeholder="Buscar mecánico por nombre..."
          excludeId={currentUserId ?? undefined}
        />
      </div>
    </ModalBase>
  );
}
