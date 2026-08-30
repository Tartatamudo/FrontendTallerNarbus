import { useState, useEffect, useRef } from 'react';
import { UserCheck, X, Check } from 'lucide-react';
import { buscarMecanicos, type MecanicoItem } from '../../usuarios/auth/authService';
import './MecanicoSelector.css';

export interface MecanicoSelectorProps {
  /** Mecánicos actualmente seleccionados */
  selectedMecanicos?: MecanicoItem[];
  /** Callback al cambiar la selección (retorna array de mecánicos seleccionados) */
  onChange?: (selected: MecanicoItem[]) => void;
  /** ID de usuario a excluir de los resultados (p.ej. el usuario logueado) */
  excludeId?: number;
  label?: string;
  placeholder?: string;
  className?: string;
}

export default function MecanicoSelector({
  selectedMecanicos = [],
  onChange,
  excludeId,
  label = "Colaboradores (Mecánicos)",
  placeholder = "Buscar mecánico por nombre (ej: Santiago)...",
  className = ""
}: MecanicoSelectorProps) {
  const [query, setQuery] = useState('');
  const [resultados, setResultados] = useState<MecanicoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);

  // Buscar mecánicos en backend (GET /api/v1/auth/mecanicos/buscar?q=...)
  const fetchMecanicos = async (q: string) => {
    setLoading(true);
    try {
      const data = await buscarMecanicos(q, excludeId);
      setResultados(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn("Error buscando mecánicos:", err);
      setResultados([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounce al escribir
  useEffect(() => {
    const timer = setTimeout(() => {
      if (showDropdown) {
        fetchMecanicos(query);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [query, showDropdown]);

  // Manejar clic fuera del contenedor
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (mecanico: MecanicoItem) => {
    const yaExiste = selectedMecanicos.some(m => m.id === mecanico.id);
    let nuevos: MecanicoItem[];
    if (yaExiste) {
      nuevos = selectedMecanicos.filter(m => m.id !== mecanico.id);
    } else {
      nuevos = [...selectedMecanicos, mecanico];
    }
    if (onChange) onChange(nuevos);
    setQuery('');
  };

  const handleRemove = (mecanicoId: number) => {
    const nuevos = selectedMecanicos.filter(m => m.id !== mecanicoId);
    if (onChange) onChange(nuevos);
  };

  return (
    <div className={`mecanico-selector-container ${className}`} ref={containerRef}>
      {label && <label className="mecanico-selector-label">{label}:</label>}

      {/* Input Autocomplete */}
      <div className="mecanico-selector-input-wrapper">
        <input
          type="text"
          placeholder={loading ? "Buscando mecánicos..." : placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => {
            setShowDropdown(true);
            fetchMecanicos(query);
          }}
          className="mecanico-selector-input"
        />
        <UserCheck size={18} className="mecanico-selector-icon" />

        {loading ? (
          <div className="mecanico-selector-spinner" title="Buscando..." />
        ) : query ? (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="mecanico-selector-clear-btn"
            title="Borrar texto"
          >
            <X size={14} />
          </button>
        ) : null}
      </div>

      {/* Chips de Mecánicos Seleccionados (Mostrando sólo Nombre Completo) */}
      {selectedMecanicos.length > 0 && (
        <div className="mecanico-selector-chips">
          {selectedMecanicos.map((m) => (
            <span key={m.id} className="mecanico-selector-chip">
              <span>{m.nombre_completo}</span>
              <button
                type="button"
                onClick={() => handleRemove(m.id)}
                className="mecanico-selector-chip-remove"
                title={`Quitar a ${m.nombre_completo}`}
              >
                <X size={13} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Desplegable de Resultados */}
      {showDropdown && !loading && (
        <div className="mecanico-selector-dropdown">
          {resultados.filter(m => m.id !== excludeId).length > 0 ? (
            resultados.filter(m => m.id !== excludeId).map((m) => {
              const isSelected = selectedMecanicos.some(s => s.id === m.id);
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleSelect(m)}
                  className={`mecanico-selector-dropdown-item ${isSelected ? 'mecanico-selector-dropdown-item-selected' : ''}`}
                >
                  <span className="font-extrabold text-slate-800">{m.nombre_completo}</span>
                  {isSelected && <Check size={16} className="text-indigo-600 shrink-0" />}
                </button>
              );
            })
          ) : (
            <div className="mecanico-selector-empty">
              {query ? `Sin coincidencias para "${query}"` : 'Escribe para buscar mecánicos'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
