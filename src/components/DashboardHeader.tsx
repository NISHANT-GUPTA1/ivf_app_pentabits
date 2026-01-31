import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';

interface DashboardHeaderProps {
  viewMode: 'overview' | 'comparison';
  onViewModeChange: (mode: 'overview' | 'comparison') => void;
}

export function DashboardHeader({ viewMode, onViewModeChange }: DashboardHeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b border-[#E6E6E6] px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-charcoal">
            Embrya - IVF Audit Trail System
          </h1>
          <p className="text-sm text-charcoal/60 mt-0.5">
            Transforming IVF decisions through intelligent embryo analysis with full audit compliance
          </p>
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm font-medium text-charcoal">{user.username}</div>
                <div className="text-xs text-charcoal/60">{user.role}</div>
              </div>
              <Button
                onClick={logout}
                variant="outline"
                size="sm"
              >
                Logout
              </Button>
            </div>
          )}

          <div className="flex items-center gap-1 bg-blush rounded-lg p-1">
            <button
              onClick={() => onViewModeChange('overview')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'overview'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-charcoal/70 hover:text-charcoal'
              }`}
            >
              Cycle Overview
            </button>
            <button
              onClick={() => onViewModeChange('comparison')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'comparison'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-charcoal/70 hover:text-charcoal'
              }`}
            >
              Embryo Comparison
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
