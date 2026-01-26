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
  const [selectedEmbryo, setSelectedEmbryo] = useState<EmbryoResult>(embryoData[0]);

  // Ensure selectedEmbryo stays in sync if embryoData changes (e.g. after upload)
  useEffect(() => {
    const found = embryoData.find(e => e.id === selectedEmbryo.id);
    if (found) setSelectedEmbryo(found);
  }, [embryoData, selectedEmbryo.id]);

  const handleEmbryoUpdate = (updated: EmbryoResult) => {
    setSelectedEmbryo(updated);
    onUpdateEmbryo(updated);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-10">
      {/* Left Column - Summary Cards */}
      <div className="col-span-1 lg:col-span-3 space-y-6 min-w-0">
        <SummaryCards embryoData={embryoData} />
        <StageDistribution embryoData={embryoData} />
        <QualityTrends embryoData={embryoData} />
      </div>

      {/* Center Column - Embryo Viewer & Controls */}
      <div className="col-span-1 lg:col-span-6 space-y-6 min-w-0">
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

      {/* Right Column - Charts & Rankings */}
      <div className="col-span-1 lg:col-span-3 space-y-6 min-w-0">
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
