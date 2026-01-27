import type { EmbryoResult, EmbryoFeatures } from '../types/embryo';

// Embryo images for mock data
const embryoImages = [
  'https://images.unsplash.com/photo-1617178571938-7859791e1751?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaWNyb3Njb3BlJTIwZW1icnlvJTIwY2VsbHN8ZW58MXx8fHwxNzY5MzM4MDk3fDA&ixlib=rb-4.1.0&q=80&w=1080',
  'https://images.unsplash.com/photo-1768498950658-87ecfe232b59?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpY2FsJTIwbGFib3JhdG9yeSUyMHNjaWVuY2V8ZW58MXx8fHwxNzY5MzM4MDk4fDA&ixlib=rb-4.1.0&q=80&w=1080',
  'https://images.unsplash.com/photo-1767486366936-c41b4f767eb8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjZWxsJTIwYmlvbG9neSUyMG1pY3Jvc2NvcGV8ZW58MXx8fHwxNzY5MzA2NjE0fDA&ixlib=rb-4.1.0&q=80&w=1080',
  'https://images.unsplash.com/photo-1758656803198-eeea35110219?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzY2llbnRpZmljJTIwcmVzZWFyY2glMjBjZWxsc3xlbnwxfHx8fDE3NjkzMzgwOTh8MA&ixlib=rb-4.1.0&q=80&w=1080',
  'https://images.unsplash.com/photo-1766297246935-b0546638f63e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYWJvcmF0b3J5JTIwbWljcm9zY29wZSUyMHZpZXd8ZW58MXx8fHwxNzY5MzM4MTAzfDA&ixlib=rb-4.1.0&q=80&w=1080',
  'https://images.unsplash.com/photo-1758656803198-eeea35110219?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiaW9sb2d5JTIwY2VsbHMlMjByZXNlYXJjaHxlbnwxfHx8fDE3NjkzMzgwOTl8MA&ixlib=rb-4.1.0&q=80&w=1080'
];

// Generate mock embryo data for the dashboard
export function generateMockEmbryos(): EmbryoResult[] {
  const results: EmbryoResult[] = [];
  const numEmbryos = 6;

  for (let i = 0; i < numEmbryos; i++) {
    const viabilityScore = generateViabilityScore(i);
    const features = generateFeatures(viabilityScore);
    const keyFindings = generateKeyFindings(features, viabilityScore);
    const recommendation = generateRecommendation(viabilityScore);

    results.push({
      id: `embryo-${i + 1}`,
      name: `Embryo ${i + 1}`,
      imageUrl: embryoImages[i % embryoImages.length],
      viabilityScore,
      rank: 0,
      features,
      keyFindings,
      recommendation
    });
  }

  // Sort by viability score and assign ranks
  results.sort((a, b) => b.viabilityScore - a.viabilityScore);
  results.forEach((result, index) => {
    result.rank = index + 1;
  });

  return results;
}

function generateViabilityScore(index: number): number {
  const baseScores = [87, 82, 74, 68, 56, 45];
  const score = baseScores[index % baseScores.length] || 60;
  const variation = Math.floor(Math.random() * 6) - 3;
  return Math.max(30, Math.min(95, score + variation));
}

function generateFeatures(score: number): EmbryoFeatures {
  const isBlastocyst = score >= 60;

  if (isBlastocyst) {
    return {
      developmentalStage: score >= 75 ? 'Blastocyst (Day 5)' : 'Early Blastocyst (Day 5)',
      symmetry: score >= 80 ? 'Excellent' : score >= 70 ? 'Good' : 'Fair',
      fragmentation: score >= 75 ? '<5% (Minimal)' : score >= 65 ? '5-10% (Low)' : '10-20% (Moderate)',
      blastocystExpansion: score >= 80 ? 'Grade 4 (Expanded)' : score >= 70 ? 'Grade 3 (Full)' : 'Grade 2 (Partial)',
      innerCellMass: score >= 80 ? 'Grade A (Excellent)' : score >= 70 ? 'Grade B (Good)' : 'Grade C (Fair)',
      trophectoderm: score >= 80 ? 'Grade A (Many cells)' : score >= 70 ? 'Grade B (Several cells)' : 'Grade C (Few cells)'
    };
  } else {
    return {
      developmentalStage: score >= 50 ? '8-cell (Day 3)' : score >= 40 ? '6-cell (Day 3)' : '4-cell (Day 2)',
      symmetry: score >= 50 ? 'Good' : 'Fair',
      fragmentation: score >= 50 ? '10-15% (Moderate)' : score >= 40 ? '15-25% (Moderate)' : '>25% (High)'
    };
  }
}

function generateKeyFindings(_features: EmbryoFeatures, score: number): string[] {
  const findings: string[] = [];

  if (score >= 80) {
    findings.push('Optimal developmental progression observed');
    findings.push('Excellent morphological characteristics');
    findings.push('Minimal fragmentation indicates healthy division');
    findings.push('Strong predictive markers for implantation');
  } else if (score >= 70) {
    findings.push('Good developmental stage for transfer');
    findings.push('Well-formed cellular structure');
    findings.push('Acceptable fragmentation levels');
    findings.push('Positive indicators for viability');
  } else if (score >= 50) {
    findings.push('Adequate developmental progression');
    findings.push('Moderate morphological quality');
    findings.push('Some fragmentation present but acceptable');
    findings.push('May benefit from extended culture');
  } else {
    findings.push('Suboptimal developmental characteristics');
    findings.push('Concerns with cellular organization');
    findings.push('Elevated fragmentation levels observed');
    findings.push('Limited implantation potential');
  }

  return findings;
}

function generateRecommendation(score: number): string {
  if (score >= 80) {
    return 'Excellent candidate for transfer. Highest priority for fresh or frozen embryo transfer based on clinical protocol.';
  } else if (score >= 70) {
    return 'Good candidate for transfer. Consider for fresh transfer or cryopreservation depending on patient factors.';
  } else if (score >= 50) {
    return 'Moderate quality. May be suitable for transfer if higher-graded embryos unavailable.';
  } else {
    return 'Lower viability potential. Consider extended culture or discuss alternative options with patient.';
  }
}
