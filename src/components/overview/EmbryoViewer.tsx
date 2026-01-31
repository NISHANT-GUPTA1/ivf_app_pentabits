import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { EmbryoResult } from '../../types/embryo';

interface EmbryoViewerProps {
  embryo: EmbryoResult | null;
  onSelectEmbryo: (embryo: EmbryoResult) => void;
  allEmbryos: EmbryoResult[];
}

export function EmbryoViewer({ embryo, onSelectEmbryo, allEmbryos }: EmbryoViewerProps) {
  if (!embryo || allEmbryos.length === 0) {
    return null;
  }
  
  const currentIndex = allEmbryos.findIndex(e => e.id === embryo.id);
  
  const handlePrevious = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : allEmbryos.length - 1;
    onSelectEmbryo(allEmbryos[newIndex]);
  };

  const handleNext = () => {
    const newIndex = currentIndex < allEmbryos.length - 1 ? currentIndex + 1 : 0;
    onSelectEmbryo(allEmbryos[newIndex]);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
      if (score >= 70) return 'bg-teal-medical';
    if (score >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
      <div className="bg-white rounded-lg border border-[#E6E6E6] p-6">
      <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-charcoal">Embryo Visualization</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevious}
              className="p-1.5 rounded-lg hover:bg-blush transition-colors"
          >
              <ChevronLeft className="size-5 text-charcoal/60" />
          </button>
            <span className="text-sm text-charcoal/60">
            {currentIndex + 1} / {allEmbryos.length}
          </span>
          <button
            onClick={handleNext}
              className="p-1.5 rounded-lg hover:bg-blush transition-colors"
          >
            <ChevronRight className="size-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Main embryo image */}
      <div className="relative bg-gray-900 rounded-lg overflow-hidden mb-6" style={{ height: '400px' }}>
        <img
          src={embryo.imageUrl}
          alt={embryo.name}
          className="w-full h-full object-cover"
        />
        
        {/* Overlay info */}
        <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
          <div className="bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2">
            <p className="text-white font-medium">{embryo.name}</p>
            <p className="text-gray-300 text-sm">{embryo.features.developmentalStage}</p>
          </div>
          
          <div className={`${getScoreColor(embryo.viabilityScore)} rounded-lg px-3 py-2`}>
            <p className="text-white font-semibold text-lg">{embryo.viabilityScore}%</p>
          </div>
        </div>

        {/* Analysis indicators */}
        <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2">
          <p className="text-gray-300 text-xs mb-1">Analysis Complete</p>
          <div className="flex gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse delay-100"></div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse delay-200"></div>
          </div>
        </div>
      </div>

      {/* Morphological details */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs text-gray-600 mb-1">Symmetry</p>
          <p className="font-medium text-gray-900">{embryo.features.symmetry}</p>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs text-gray-600 mb-1">Fragmentation</p>
          <p className="font-medium text-gray-900">{embryo.features.fragmentation}</p>
        </div>

        {embryo.features.innerCellMass && (
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-600 mb-1">Inner Cell Mass</p>
            <p className="font-medium text-gray-900">{embryo.features.innerCellMass}</p>
          </div>
        )}

        {embryo.features.trophectoderm && (
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-600 mb-1">Trophectoderm</p>
            <p className="font-medium text-gray-900">{embryo.features.trophectoderm}</p>
          </div>
        )}

        {embryo.features.blastocystExpansion && (
          <div className="bg-gray-50 rounded-lg p-4 col-span-2">
            <p className="text-xs text-gray-600 mb-1">Expansion Grade</p>
            <p className="font-medium text-gray-900">{embryo.features.blastocystExpansion}</p>
          </div>
        )}
      </div>
    </div>
  );
}
