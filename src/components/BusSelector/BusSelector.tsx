import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Bus, X, Check } from 'lucide-react';
import axios from 'axios';
import './BusSelector.css';

export interface BusItem {
  id: number | string;
  n_bus: number | string;
  patente?: string;
}

export interface BusSelectorProps {
  value: string;
  onChange: (value: string, busObj?: BusItem | null) => void;
  label?: string;
  placeholder?: string;
  stepNumber?: number | string;
  required?: boolean;
  onClearError?: () => void;
  className?: string;
}

const getBusesApiBaseUrl = (): string => {
  const envBuses = import.meta.env.VITE_API_BUSES_URL;
  if (envBuses) return envBuses.replace(/\/+$/, '');

  const envMantencion = import.meta.env.VITE_API_URL_MANTENCION;
  if (envMantencion) {
    return envMantencion.replace(/\/formularioMantencionTaller\/?$/i, '') + '/buses';
  }

  const envNeumatico = import.meta.env.VITE_API_URL;
  if (envNeumatico) {
    return envNeumatico.replace(/\/formularioNeumatico\/?$/i, '') + '/buses';
  }

  return 'http://127.0.0.1:8000/api/v1/buses';
};

export default function BusSelector({
  value,
  onChange,
  label = "Identificación del Bus",
  placeholder = "Escribir N° de máquina / bus (ej: 420)...",
  stepNumber,
  required = true,
  onClearError,
  className = "",
}: BusSelectorProps) {
  const [busesList, setBusesList] = useState<BusItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedBusObj, setSelectedBusObj] = useState<BusItem | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);

  // Consultar al backend al cambiar el número o al enfocar/borrar
  const buscarBusesBackend = async (queryStr: string) => {
    setLoading(true);
    try {
      const cleanNum = queryStr.replace(/\D/g, '').trim();
      const baseUrl = getBusesApiBaseUrl();

      // Determinar payload exacto según requerimiento backend:
      // Payload {"n_bus": 5} -> Retorna [501, 56, 59]
      // Payload {} o {"n_bus": ""} -> Retorna la lista completa de números de buses.
      let payload: Record<string, any> = {};
      if (cleanNum !== '') {
        const parsedNum = parseInt(cleanNum, 10);
        payload = { n_bus: isNaN(parsedNum) ? cleanNum : parsedNum };
      } else {
        payload = { n_bus: "" };
      }

      // Probar POST /api/v1/buses/buscar o fallback POST /api/v1/buses/
      const urlBuscar = baseUrl.endsWith('/buscar') ? baseUrl : `${baseUrl.replace(/\/+$/, '')}/buscar`;
      const urlRoot = baseUrl.endsWith('/buscar') ? baseUrl.replace(/\/buscar$/, '/') : `${baseUrl.replace(/\/+$/, '')}/`;

      let res;
      try {
        res = await axios.post(urlBuscar, payload, { timeout: 4000 });
      } catch (errPostBuscar) {
        try {
          res = await axios.post(urlRoot, payload, { timeout: 4000 });
        } catch (errPostRoot) {
          // Fallback GET en caso de backend legado
          res = await axios.get(baseUrl, {
            params: { query: cleanNum, n_bus: cleanNum },
            timeout: 4000
          });
        }
      }

      if (res && res.data) {
        const rawData = res.data;
        const itemsArray = Array.isArray(rawData)
          ? rawData
          : (rawData.buses || rawData.items || rawData.data || []);

        const parsedList: BusItem[] = itemsArray.map((item: any, index: number) => {
          if (typeof item === 'number' || typeof item === 'string') {
            return { id: item, n_bus: item };
          } else if (typeof item === 'object' && item !== null) {
            return {
              id: item.id ?? item.n_bus ?? index,
              n_bus: item.n_bus ?? item.id ?? item.numero ?? String(item),
              patente: item.patente
            };
          }
          return { id: index, n_bus: String(item) };
        });

        setBusesList(parsedList);
      }
    } catch (err) {
      console.warn("No se pudieron cargar los buses del backend:", err);
    } finally {
      setLoading(false);
    }
  };

  // Debounce para consultar backend al escribir o borrar un número
  useEffect(() => {
    const timer = setTimeout(() => {
      buscarBusesBackend(value);
    }, 150);

    return () => clearTimeout(timer);
  }, [value]);

  // Manejar clic fuera para cerrar el menú flotante
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const soloNumeros = e.target.value.replace(/\D/g, '');
    setSelectedBusObj(null);
    setShowDropdown(true);
    if (onClearError) onClearError();
    onChange(soloNumeros, null);
  };

  const handleSelectOption = (bus: BusItem) => {
    const numStr = String(bus.n_bus);
    setSelectedBusObj(bus);
    setShowDropdown(false);
    if (onClearError) onClearError();
    onChange(numStr, bus);
  };

  const handleClear = () => {
    setSelectedBusObj(null);
    setShowDropdown(true);
    if (onClearError) onClearError();
    onChange('', null);
  };

  // Listado completo de buses retornado por el backend
  const filteredBuses = useMemo(() => {
    if (!value || !value.trim()) {
      return busesList;
    }
    const q = value.trim().toLowerCase();
    return busesList.filter((b) => {
      const nBus = String(b.n_bus || '').toLowerCase();
      const patente = String(b.patente || '').toLowerCase();
      return nBus.includes(q) || patente.includes(q);
    });
  }, [busesList, value]);

  return (
    <div className={`bus-selector-container ${className}`} ref={containerRef}>
      {/* Header del paso / label */}
      <div className="bus-selector-step-header">
        <div className="bus-selector-title-group">
          {stepNumber !== undefined && (
            <span className="bus-selector-step-badge">{stepNumber}</span>
          )}
          <label className="bus-selector-step-label">{label}:</label>
        </div>
        {required && <span className="bus-selector-required-badge">* Requerido</span>}
      </div>

      {/* Control de Input */}
      <div className="bus-selector-input-wrapper">
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder={loading && busesList.length === 0 ? "Cargando buses..." : placeholder}
          value={value}
          onChange={handleInputChange}
          onFocus={() => {
            setShowDropdown(true);
            if (busesList.length === 0) {
              buscarBusesBackend(value);
            }
          }}
          className="bus-selector-input"
        />
        <Bus size={20} className="bus-selector-icon" />

        {loading ? (
          <div className="bus-selector-spinner" title="Buscando en servidor..." />
        ) : value ? (
          <button
            type="button"
            onClick={handleClear}
            className="bus-selector-clear-btn"
            title="Borrar selección"
          >
            <X size={15} />
          </button>
        ) : null}
      </div>

      {/* Desplegable de Resultados */}
      {showDropdown && !loading && (
        <div className="bus-selector-dropdown">
          {filteredBuses.length > 0 ? (
            filteredBuses.map((b) => {
              const isSelected = selectedBusObj?.id === b.id || String(b.n_bus) === value;
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => handleSelectOption(b)}
                  className={`bus-selector-dropdown-item ${isSelected ? 'bus-selector-dropdown-item-selected' : ''}`}
                >
                  <div className="bus-selector-badge-tag">
                    <span className="bus-selector-dot"></span>
                    <span>Bus N° {b.n_bus}</span>
                    {b.patente && (
                      <span className="text-xs font-semibold text-slate-500">
                        ({b.patente})
                      </span>
                    )}
                  </div>
                  {isSelected && <Check size={18} className="text-blue-600 shrink-0" />}
                </button>
              );
            })
          ) : (
            <div className="bus-selector-empty">
              {value ? `Se usará: Bus N° ${value}` : 'No hay buses disponibles'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
