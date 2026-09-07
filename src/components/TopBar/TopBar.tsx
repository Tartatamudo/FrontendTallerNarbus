import { useNavigate, useLocation } from 'react-router-dom';
import { Bus } from 'lucide-react';
import './TopBar.css';

interface TopBarProps {
  onVolver?: () => void;
}

export default function TopBar({ onVolver }: TopBarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const esPantallaInterior = location.pathname !== '/home' && location.pathname !== '/' && location.pathname !== '/login';
  const handleVolver = onVolver || (() => navigate('/home'));

  return (
    <header className="topbar-bar">
      <div className="topbar-container">
        <div className="flex items-center gap-3">
          {(onVolver || esPantallaInterior) && (
            <button
              type="button"
              onClick={handleVolver}
              className="topbar-btn topbar-btn-volver"
              title="Volver a la Consola Principal"
              aria-label="Volver a la Consola Principal"
            >
              <span className="text-sm font-bold">← Menú</span>
            </button>
          )}

          <div
            className="topbar-brand"
            onClick={() => navigate('/home')}
            title="Ir al Menú Principal de Flota"
            style={{ cursor: 'pointer' }}
          >
            <div className="topbar-brand-icon">
              <Bus size={22} className="text-white" />
            </div>
            <div>
              <h2 className="text-base md:text-lg font-black tracking-wider leading-tight text-white">
                NARBUS
              </h2>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
