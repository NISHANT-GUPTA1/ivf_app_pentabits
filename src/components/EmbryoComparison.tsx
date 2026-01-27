import { ComparisonGrid } from './comparison/ComparisonGrid';
import { ComparisonMetrics } from './comparison/ComparisonMetrics';
import type { EmbryoResult } from '../types/embryo';

interface EmbryoComparisonProps {
  embryoData: EmbryoResult[];
}

export function EmbryoComparison({ embryoData }: EmbryoComparisonProps) {
  if (embryoData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 max-w-md">
          <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Embryos to Compare</h3>
          <p className="text-sm text-gray-500 mb-4">
            Upload at least 2 embryo images to enable comparison view
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <ComparisonMetrics embryoData={embryoData} />
      <ComparisonGrid embryoData={embryoData} />
    </div>
  );
}
