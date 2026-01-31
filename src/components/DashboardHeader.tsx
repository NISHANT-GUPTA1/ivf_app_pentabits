import { useAuth } from '../contexts/AuthContext';

interface DashboardHeaderProps {
  viewMode: 'overview' | 'comparison';
  onViewModeChange: (mode: 'overview' | 'comparison') => void;
}

export function DashboardHeader({ viewMode, onViewModeChange }: DashboardHeaderProps) {
  const auth = useAuth();

  return (
    <header className="bg-white border-b border-[#E6E6E6] px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-charcoal">Embrya</h1>
          <p className="text-sm text-charcoal/60 mt-0.5">Transforming IVF decisions through intelligent embryo analysis</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-blush rounded-lg p-1">
            <button
              onClick={() => onViewModeChange('overview')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'overview' ? 'bg-primary text-white shadow-sm' : 'text-charcoal/70 hover:text-charcoal'
              }`}
            >
              Cycle Overview
            </button>
            <button
              onClick={() => onViewModeChange('comparison')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'comparison' ? 'bg-primary text-white shadow-sm' : 'text-charcoal/70 hover:text-charcoal'
              }`}
            >
              Embryo Comparison
            </button>
          </div>

          {/* User / Logout */}
          {auth.user ? (
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-700">Signed in as <strong className="ml-1">{auth.user.username}</strong></div>
              <button
                onClick={() => auth.logout()}
                className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-100 rounded-md text-sm hover:bg-red-100"
              >
                Logout
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
