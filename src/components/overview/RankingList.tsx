import { Medal } from 'lucide-react';
import type { EmbryoResult } from '../../types/embryo';

interface RankingListProps {
  embryoData: EmbryoResult[];
  selectedEmbryo: EmbryoResult;
  onSelectEmbryo: (embryo: EmbryoResult) => void;
}

export function RankingList({ embryoData, selectedEmbryo, onSelectEmbryo }: RankingListProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 70) return 'text-blue-600 bg-blue-50';
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
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Medal className="size-5 text-gray-600" />
        <h3 className="text-sm font-medium text-gray-900">Embryo Rankings</h3>
      </div>

      <div className="space-y-3">
        {embryoData.map((embryo) => {
          const isSelected = embryo.id === selectedEmbryo.id;
          const rankBadge = getRankBadge(embryo.rank);

          return (
            <button
              key={embryo.id}
              onClick={() => onSelectEmbryo(embryo)}
              className={`w-full text-left rounded-lg border transition-all ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">
                      {embryo.name}
                    </span>
                    {rankBadge && <span className="text-base">{rankBadge}</span>}
                  </div>
                  <div className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getScoreColor(embryo.viabilityScore)}`}>
                    {embryo.viabilityScore}%
                  </div>
                </div>

                <p className="text-xs text-gray-600 line-clamp-2">
                  {embryo.recommendation}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
