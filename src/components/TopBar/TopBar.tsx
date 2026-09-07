import { useNavigate } from 'react-router-dom';
import { Bus, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import './TopBar.css';

interface TopBarProps {
  onVolver?: () => void;
}

export default function TopBar({ onVolver: _onVolver }: TopBarProps = {}) {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="topbar-bar">
      <div className="topbar-container">
        <div className="flex items-center gap-3">
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

        {/* Switch de Modo Oscuro / Claro */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="topbar-theme-toggle"
            title={theme === 'dark' ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
            aria-label={theme === 'dark' ? 'Activar Modo Claro' : 'Activar Modo Oscuro'}
          >
            <div className="topbar-theme-pill">
              <div className={`topbar-theme-thumb ${theme === 'light' ? 'thumb-light' : 'thumb-dark'}`}>
                {theme === 'dark' ? (
                  <Moon size={13} className="text-sky-400" />
                ) : (
                  <Sun size={13} className="text-amber-500" />
                )}
              </div>
              <span className="topbar-theme-label">
                {theme === 'dark' ? 'Oscuro' : 'Claro'}
              </span>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
