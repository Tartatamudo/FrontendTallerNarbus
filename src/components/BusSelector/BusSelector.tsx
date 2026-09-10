import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Bus, X, AlertCircle, Check } from 'lucide-react';
import {
  obtenerBusPorNumero,
  obtenerBuses,
  buscarBuses,
} from '../../buses/busesService';
import './BusSelector.css';

export interface BusItem {
  id: number | string;
  n_bus: number | string;
  patente?: string;
  marca?: string;
  modelo?: string;
  tipo_bus?: string;
  is_active?: boolean;
  en_taller?: boolean;
}

export interface BusSelectorProps {
  value: string;
  onChange: (value: string, busObj?: BusItem | null, isValid?: boolean) => void;
  label?: string;
  placeholder?: string;
  stepNumber?: number | string;
  required?: boolean;
  onClearError?: () => void;
  className?: string;
  onBusValidated?: (isValid: boolean, bus: BusItem | null) => void;
}

export default function BusSelector({
  value,
  onChange,
  label = "Identificación del Bus",
  placeholder = "Escribir N° de máquina / bus (ej: 420)...",
  stepNumber,
  required = true,
  onClearError,
  className = "",
  onBusValidated,
}: BusSelectorProps) {
  const [busesList, setBusesList] = useState<BusItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedBusObj, setSelectedBusObj] = useState<BusItem | null>(null);
  const [catalogLoaded, setCatalogLoaded] = useState(false);
  const [asyncCheckedValue, setAsyncCheckedValue] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);

  // Cargar el catálogo completo de buses activos de la flota (con caché en memoria)
  const cargarCatalogoBuses = useCallback(async () => {
    if (catalogLoaded) return;
    setLoading(true);
    try {
      // 1. Intentar cargar el catálogo completo desde caché en memoria (0ms si ya se consultó)
      const buses = await obtenerBuses(true, true);

      if (buses && Array.isArray(buses) && buses.length > 0) {
        const parsed: BusItem[] = buses.map((b) => ({
          id: b.id,
          n_bus: b.n_bus,
          patente: b.patente,
          marca: b.marca,
          modelo: b.modelo,
          tipo_bus: b.tipo_bus,
          is_active: b.is_active,
          en_taller: b.en_taller,
        }));
        setBusesList(parsed);
        setCatalogLoaded(true);
      }
    } catch {
      // Fallback a buscarBuses optimizado (BusSimpleDTO[])
      try {
        const fallbackBuses = await buscarBuses('', true);
        if (fallbackBuses && Array.isArray(fallbackBuses)) {
          const parsed: BusItem[] = fallbackBuses.map((b) => ({
            id: b.id,
            n_bus: b.n_bus,
            patente: b.patente,
            en_taller: b.en_taller,
          }));
          setBusesList(parsed);
          setCatalogLoaded(true);
        }
      } catch (err) {
        console.warn('No se pudo precargar el catálogo de buses:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [catalogLoaded]);

  // Precargar el catálogo al montar el selector
  useEffect(() => {
    cargarCatalogoBuses();
  }, [cargarCatalogoBuses]);

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

  // Verificar si el valor actual coincide exactamente con algún bus conocido
  const cleanNum = useMemo(() => value.replace(/\D/g, '').trim(), [value]);

  const exactMatch = useMemo(() => {
    if (!cleanNum) return null;
    return busesList.find((b) => String(b.n_bus).trim() === cleanNum) || null;
  }, [busesList, cleanNum]);

  // Sincronizar selectedBusObj con exactMatch cuando cambia el catálogo o el input
  useEffect(() => {
    if (!cleanNum) {
      if (selectedBusObj !== null) {
        setSelectedBusObj(null);
      }
      return;
    }

    if (exactMatch) {
      if (!selectedBusObj || String(selectedBusObj.n_bus).trim() !== cleanNum) {
        setSelectedBusObj(exactMatch);
        onChange(cleanNum, exactMatch, true);
        if (onBusValidated) onBusValidated(true, exactMatch);
      }
    } else if (catalogLoaded && !selectedBusObj) {
      // Si el catálogo ya cargó y el número no existe en él
      // Verificación directa en servidor por si el bus es nuevo o no vino en el lote
      if (cleanNum.length >= 2 && asyncCheckedValue !== cleanNum) {
        const timer = setTimeout(async () => {
          setAsyncCheckedValue(cleanNum);
          try {
            const busRes = await obtenerBusPorNumero(cleanNum);
            if (busRes && busRes.n_bus) {
              const nuevoBus: BusItem = {
                id: busRes.id,
                n_bus: busRes.n_bus,
                patente: busRes.patente,
                marca: busRes.marca,
                modelo: busRes.modelo,
                tipo_bus: busRes.tipo_bus,
                is_active: busRes.is_active,
                en_taller: busRes.en_taller,
              };
              setBusesList((prev) => [...prev, nuevoBus]);
              setSelectedBusObj(nuevoBus);
              onChange(cleanNum, nuevoBus, true);
              if (onBusValidated) onBusValidated(true, nuevoBus);
            }
          } catch {
            // Bus no existe en el backend
            setSelectedBusObj(null);
            onChange(cleanNum, null, false);
            if (onBusValidated) onBusValidated(false, null);
          }
        }, 300);

        return () => clearTimeout(timer);
      }
    }
  }, [cleanNum, exactMatch, catalogLoaded, selectedBusObj, asyncCheckedValue, onChange, onBusValidated]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const soloNumeros = e.target.value.replace(/\D/g, '');
    setShowDropdown(true);
    if (onClearError) onClearError();

    const match = busesList.find((b) => String(b.n_bus).trim() === soloNumeros);
    if (match) {
      setSelectedBusObj(match);
      onChange(soloNumeros, match, true);
      if (onBusValidated) onBusValidated(true, match);
    } else {
      setSelectedBusObj(null);
      onChange(soloNumeros, null, false);
      if (onBusValidated) onBusValidated(false, null);
    }
  };

  const handleSelectOption = (bus: BusItem) => {
    const numStr = String(bus.n_bus);
    setSelectedBusObj(bus);
    setShowDropdown(false);
    if (onClearError) onClearError();
    onChange(numStr, bus, true);
    if (onBusValidated) onBusValidated(true, bus);
  };

  const handleClear = () => {
    setSelectedBusObj(null);
    setShowDropdown(true);
    if (onClearError) onClearError();
    onChange('', null, false);
    if (onBusValidated) onBusValidated(false, null);
  };

  // Filtrar catálogo por número o patente
  const filteredBuses = useMemo(() => {
    if (!cleanNum) {
      return busesList;
    }
    const q = cleanNum.toLowerCase();
    return busesList.filter((b) => {
      const nBus = String(b.n_bus || '').toLowerCase();
      const patente = String(b.patente || '').toLowerCase();
      return nBus.includes(q) || patente.includes(q);
    });
  }, [busesList, cleanNum]);

  // Determinar si el bus actual es válido
  const isBusValido = Boolean(selectedBusObj && String(selectedBusObj.n_bus).trim() === cleanNum);
  const isBusInvalido = Boolean(cleanNum && !isBusValido && !loading);

  // Solo mostrar mensaje de error cuando el usuario cerró la lista y el bus no existe
  const mostrarBadgeInvalido = !showDropdown && isBusInvalido;

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
          placeholder={loading && busesList.length === 0 ? "Cargando buses de la flota..." : placeholder}
          value={value}
          onChange={handleInputChange}
          onFocus={() => {
            setShowDropdown(true);
            if (!catalogLoaded) {
              cargarCatalogoBuses();
            }
          }}
          className={`bus-selector-input ${mostrarBadgeInvalido ? 'bus-selector-input-invalid' : ''}`}
        />
        <Bus size={20} className={`bus-selector-icon ${mostrarBadgeInvalido ? 'text-red-500' : ''}`} />

        {loading ? (
          <div className="bus-selector-spinner" title="Buscando en flota Narbus..." />
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

      {/* Solo alertar si el bus ingresado NO existe en la flota */}
      {mostrarBadgeInvalido && (
        <div className="bus-selector-status-badge bus-selector-status-invalid">
          <AlertCircle size={16} className="shrink-0 text-red-600" />
          <span>
            ⚠️ El Bus N° <strong>{cleanNum}</strong> no existe en la flota Narbus. Selecciona un bus de la lista.
          </span>
        </div>
      )}

      {/* Desplegable de Resultados */}
      {showDropdown && !loading && (
        <div className="bus-selector-dropdown">
          {filteredBuses.length > 0 ? (
            filteredBuses.map((b) => {
              const isSelected = selectedBusObj?.id === b.id || String(b.n_bus) === cleanNum;
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
                    {b.tipo_bus && (
                      <span className="text-[11px] font-normal text-slate-400">
                        • {b.tipo_bus}
                      </span>
                    )}
                  </div>
                  {isSelected && <Check size={18} className="text-blue-600 shrink-0" />}
                </button>
              );
            })
          ) : (
            <div className="bus-selector-empty bus-selector-empty-error">
              <AlertCircle size={18} className="inline mr-1.5 text-red-500 shrink-0" />
              <span>
                {cleanNum
                  ? `El Bus N° ${cleanNum} no existe en la flota activa Narbus.`
                  : 'No hay buses disponibles en la flota.'}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

