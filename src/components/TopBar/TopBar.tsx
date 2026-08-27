import { useState, useEffect } from 'react';
import { Bus, LogOut, Activity } from 'lucide-react';
import { checkHealth } from '../../usuarios/auth/authService';
import './TopBar.css';

interface TopBarProps {
  onLogout: () => void;
  onVolver?: () => void;
}

export default function TopBar({ onLogout, onVolver }: TopBarProps) {
  const [healthy, setHealthy] = useState<boolean | null>(null);

  useEffect(() => {
    const verificarSaludBackend = async () => {
      try {
        const res = await checkHealth();
        if (res && res.status === 'healthy') {
          setHealthy(true);
        } else {
          setHealthy(false);
        }
      } catch (err) {
        setHealthy(false);
      }
    };

    verificarSaludBackend();
    const interval = setInterval(verificarSaludBackend, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="topbar-bar">
      <div className="topbar-container">
        <div
          className="topbar-brand"
          onClick={onVolver}
          title={onVolver ? "Volver al Menú Principal" : undefined}
          style={{ cursor: onVolver ? 'pointer' : 'default' }}
        >
          <div className="topbar-brand-icon">
            <Bus size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-base font-black tracking-wide leading-tight">NARBUS FLOTA</h2>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-blue-200 font-bold">Portal de Formularios</span>
              {healthy !== null && (
                <span
                  className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-black border ${
                    healthy
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                      : 'bg-red-500/20 text-red-300 border-red-400/40'
                  }`}
                  title={healthy ? 'Backend /api/v1/health en línea' : 'Backend fuera de línea'}
                >
                  <Activity size={10} className={healthy ? 'animate-pulse' : ''} />
                  <span>{healthy ? 'Online' : 'Offline'}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="topbar-actions">
          <button onClick={onLogout} className="topbar-btn topbar-btn-logout">
            <LogOut size={16} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </header>
  );
}
