import { ComparisonGrid } from './comparison/ComparisonGrid';
import { ComparisonMetrics } from './comparison/ComparisonMetrics';
import type { EmbryoResult } from '../types/embryo';

interface EmbryoComparisonProps {
  embryoData: EmbryoResult[];
}

export function EmbryoComparison({ embryoData }: EmbryoComparisonProps) {
  return (
    <div className="space-y-6">
      <ComparisonMetrics embryoData={embryoData} />
      <ComparisonGrid embryoData={embryoData} />
    </div>
  );
}
