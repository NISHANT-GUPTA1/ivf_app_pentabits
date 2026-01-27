import type { EmbryoResult } from '../../types/embryo';

interface SummaryCardsProps {
  embryoData: EmbryoResult[];
}

export function SummaryCards({ embryoData }: SummaryCardsProps) {
  const totalEmbryos = embryoData.length;
  
  const avgDay = totalEmbryos > 0 ? Math.round(
    embryoData.reduce((sum, e) => {
      const day = e.features.developmentalStage.includes('Day 5') ? 5 : 
                  e.features.developmentalStage.includes('Day 3') ? 3 : 2;
      return sum + day;
    }, 0) / totalEmbryos
  ) : 0;
  
  const avgFragmentation = totalEmbryos > 0 ? Math.round(
    embryoData.reduce((sum, e) => {
      const frag = e.features.fragmentation.match(/\d+/)?.[0];
      return sum + (frag ? parseInt(frag) : 0);
    }, 0) / totalEmbryos
  ) : 0;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 mb-1">Total Embryos Analyzed</p>
          <p className="text-4xl font-semibold text-gray-900">{totalEmbryos}</p>
        </div>
        
        <div className="pt-4 border-t border-gray-100 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Avg Development Day</span>
            <span className="text-sm font-medium text-gray-900">Day {avgDay}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Avg Fragmentation</span>
            <span className="text-sm font-medium text-gray-900">{avgFragmentation}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
