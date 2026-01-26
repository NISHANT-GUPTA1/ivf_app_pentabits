interface DashboardHeaderProps {
  viewMode: 'overview' | 'comparison';
  onViewModeChange: (mode: 'overview' | 'comparison') => void;
}

export function DashboardHeader({ viewMode, onViewModeChange }: DashboardHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            AI-Assisted Embryo Viability Analysis
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Decision Support System</p>
        </div>

        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => onViewModeChange('overview')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'overview'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Cycle Overview
          </button>
          <button
            onClick={() => onViewModeChange('comparison')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'comparison'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Embryo Comparison
          </button>
        </div>
      </div>
    </header>
  );
}
