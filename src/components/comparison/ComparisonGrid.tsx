import type { EmbryoResult } from '../../types/embryo';

interface ComparisonGridProps {
  embryoData: EmbryoResult[];
}

export function ComparisonGrid({ embryoData }: ComparisonGridProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 70) return 'bg-blue-500';
    if (score >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="grid grid-cols-3 gap-6">
      {embryoData.map((embryo) => (
        <div key={embryo.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Image */}
          <div className="relative h-48 bg-gray-900">
            <img
              src={embryo.imageUrl}
              alt={embryo.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm rounded-lg px-3 py-1.5">
              <p className="text-white text-sm font-medium">{embryo.name}</p>
            </div>
            <div className={`absolute top-3 right-3 ${getScoreColor(embryo.viabilityScore)} rounded-lg px-3 py-1.5`}>
              <p className="text-white font-semibold">{embryo.viabilityScore}%</p>
            </div>
            <div className="absolute bottom-3 left-3 right-3 bg-black/70 backdrop-blur-sm rounded-lg px-3 py-1.5">
              <p className="text-gray-300 text-xs">Rank #{embryo.rank}</p>
            </div>
          </div>

          {/* Details */}
          <div className="p-4 space-y-3">
            <div>
              <p className="text-xs text-gray-600">Development Stage</p>
              <p className="text-sm font-medium text-gray-900">{embryo.features.developmentalStage}</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-gray-600">Symmetry</p>
                <p className="text-sm font-medium text-gray-900">{embryo.features.symmetry}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Fragmentation</p>
                <p className="text-sm font-medium text-gray-900">{embryo.features.fragmentation.split(' ')[0]}</p>
              </div>
            </div>

            {embryo.features.innerCellMass && (
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-600">ICM</p>
                  <p className="text-sm font-medium text-gray-900">
                    {embryo.features.innerCellMass.split(' ')[1]}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">TE</p>
                  <p className="text-sm font-medium text-gray-900">
                    {embryo.features.trophectoderm?.split(' ')[1]}
                  </p>
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-600">Key Findings</p>
              <ul className="mt-1 space-y-1">
                {embryo.keyFindings.slice(0, 2).map((finding, index) => (
                  <li key={index} className="text-xs text-gray-700 flex items-start gap-1.5">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span className="line-clamp-1">{finding}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
