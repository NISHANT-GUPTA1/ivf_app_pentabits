import { Medal } from 'lucide-react';
import type { EmbryoResult } from '../../types/embryo';

interface RankingListProps {
  embryoData: EmbryoResult[];
  selectedEmbryo: EmbryoResult | null;
  onSelectEmbryo: (embryo: EmbryoResult) => void;
}

export function RankingList({ embryoData, selectedEmbryo, onSelectEmbryo }: RankingListProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
      if (score >= 70) return 'text-teal-medical bg-blush';
    if (score >= 50) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
  };

  return (
     <div className="bg-white rounded-lg border border-[#E6E6E6] p-6">
      <div className="flex items-center gap-2 mb-4">
        <Medal className="size-5 text-teal-medical" />
        <h3 className="text-sm font-medium text-charcoal">Embryo Rankings</h3>
      </div>

      <div className="space-y-3">
        {embryoData.map((embryo) => {
          const isSelected = selectedEmbryo ? embryo.id === selectedEmbryo.id : false;
          const rankBadge = getRankBadge(embryo.rank);

          return (
            <button
              key={embryo.id}
              onClick={() => onSelectEmbryo(embryo)}
              className={`w-full text-left rounded-lg border transition-all ${
                isSelected
                    ? 'border-teal-medical bg-blush shadow-sm'
                    : 'border-[#E6E6E6] hover:border-lavender hover:bg-blush'
              }`}
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-charcoal">
                      {embryo.name}
                    </span>
                    {rankBadge && <span className="text-base">{rankBadge}</span>}
                    {embryo.overrideScore && (
                      <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-semibold rounded">
                        OVERRIDE
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getScoreColor(embryo.overrideScore || embryo.viabilityScore)}`}>
                      {embryo.overrideScore || embryo.viabilityScore}%
                    </div>
                    {embryo.overrideScore && (
                      <span className="text-[10px] text-gray-400 line-through">
                        {embryo.viabilityScore}%
                      </span>
                    )}
                  </div>
                </div>

                  <p className="text-xs text-charcoal/70 line-clamp-2">
                  {embryo.overrideReason || embryo.recommendation}
                </p>
                {embryo.manualGrade && (
                  <p className="text-[10px] text-teal-medical mt-1 font-medium">
                    Manual Grade: {embryo.manualGrade}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
