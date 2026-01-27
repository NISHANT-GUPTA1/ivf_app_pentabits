import { useState, useEffect } from 'react';
import { SummaryCards } from './overview/SummaryCards';
import { StageDistribution } from './overview/StageDistribution';
import { QualityTrends } from './overview/QualityTrends';
import { EmbryoViewer } from './overview/EmbryoViewer';
import { ViabilityChart } from './overview/ViabilityChart';
import { QualityMetricsChart } from './overview/QualityMetricsChart';
import { RankingList } from './overview/RankingList';
import { OverrideControls } from './overview/OverrideControls';
import type { EmbryoResult } from '../types/embryo';

interface CycleOverviewProps {
  embryoData: EmbryoResult[];
  activeSection: string;
  onUpdateEmbryo: (updated: EmbryoResult) => void;
}

export function CycleOverview({ embryoData, activeSection, onUpdateEmbryo }: CycleOverviewProps) {
  const [selectedEmbryo, setSelectedEmbryo] = useState<EmbryoResult | null>(
    embryoData.length > 0 ? embryoData[0] : null
  );

  // Ensure selectedEmbryo stays in sync if embryoData changes (e.g. after upload)
  useEffect(() => {
    if (embryoData.length === 0) {
      setSelectedEmbryo(null);
      return;
    }
    
    if (!selectedEmbryo) {
      setSelectedEmbryo(embryoData[0]);
      return;
    }
    
    const found = embryoData.find(e => e.id === selectedEmbryo.id);
    if (found) {
      setSelectedEmbryo(found);
    } else {
      setSelectedEmbryo(embryoData[0]);
    }
  }, [embryoData, selectedEmbryo]);

  const handleEmbryoUpdate = (updated: EmbryoResult) => {
    setSelectedEmbryo(updated);
    onUpdateEmbryo(updated);
  };

  // Show empty state if no embryos
  if (embryoData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 max-w-md">
          <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Embryos Analyzed Yet</h3>
          <p className="text-sm text-gray-500 mb-4">
            Upload embryo images in the Assessment Hub to begin analysis
          </p>
          <p className="text-xs text-gray-400">
            The dashboard will populate automatically as you analyze embryos
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-10">
      {/* Left Column - 3/12 (25%) */}
      <div className="col-span-1 lg:col-span-3 space-y-6 min-w-0">
        <SummaryCards embryoData={embryoData} />
        <StageDistribution embryoData={embryoData} />
        <QualityTrends embryoData={embryoData} />
      </div>

      {/* Center Column - 5/12 (40%) - Embryo Viewer as primary focus */}
      <div className="col-span-1 lg:col-span-5 space-y-6 min-w-0">
        <EmbryoViewer
          embryo={selectedEmbryo}
          onSelectEmbryo={setSelectedEmbryo}
          allEmbryos={embryoData}
        />

        <OverrideControls
          embryo={selectedEmbryo}
          onUpdateEmbryo={handleEmbryoUpdate}
        />
      </div>

      {/* Right Column - 4/12 (33%) */}
      <div className="col-span-1 lg:col-span-4 space-y-6 min-w-0">
        <ViabilityChart embryoData={embryoData} selectedEmbryo={selectedEmbryo} />
        <QualityMetricsChart embryoData={embryoData} />
        <RankingList
          embryoData={embryoData}
          selectedEmbryo={selectedEmbryo}
          onSelectEmbryo={setSelectedEmbryo}
        />
      </div>
    </div>
  );
}
