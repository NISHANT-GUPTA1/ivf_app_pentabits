import { Card } from './ui/card';

interface FeatureImportanceProps {
  features: Record<string, number>;
  title?: string;
}

export function FeatureImportance({ features, title = "Feature Importance Analysis" }: FeatureImportanceProps) {
  // Sort features by importance
  const sortedFeatures = Object.entries(features)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10); // Top 10 features

  const maxValue = Math.max(...sortedFeatures.map(([, value]) => value));

  const getColor = (value: number) => {
    const percentage = (value / maxValue) * 100;
    if (percentage >= 80) return 'bg-emerald-500';
    if (percentage >= 60) return 'bg-blue-500';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  const getTextColor = (value: number) => {
    const percentage = (value / maxValue) * 100;
    if (percentage >= 80) return 'text-emerald-700';
    if (percentage >= 60) return 'text-blue-700';
    if (percentage >= 40) return 'text-yellow-700';
    return 'text-orange-700';
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <p className="text-gray-600">Which morphological features most influenced this embryo's score?</p>
      </div>

      <div className="space-y-3">
        {sortedFeatures.map(([feature, importance], index) => (
          <div key={feature} className="relative">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold ${getTextColor(importance)} w-6`}>
                  #{index + 1}
                </span>
                <span className="text-sm font-medium text-gray-700">{feature}</span>
              </div>
              <span className={`text-sm font-bold ${getTextColor(importance)}`}>
                {importance.toFixed(1)}
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-3 relative overflow-hidden">
              <div 
                className={`${getColor(importance)} h-3 rounded-full transition-all duration-500 ease-out`}
                style={{ width: `${(importance / maxValue) * 100}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white opacity-20"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-2">💡 Feature Interpretation Guide</h3>
        <div className="grid md:grid-cols-2 gap-3 text-sm text-gray-700">
          <div>
            <strong>Circularity:</strong> Measures cell roundness and shape regularity
          </div>
          <div>
            <strong>Fragmentation:</strong> Indicates cellular integrity and quality
          </div>
          <div>
            <strong>Boundary Definition:</strong> Edge clarity and cell definition
          </div>
          <div>
            <strong>Cytoplasm Quality:</strong> Internal cell appearance and uniformity
          </div>
          <div>
            <strong>Cell Complexity:</strong> Texture and structural detail
          </div>
          <div>
            <strong>Structural Integrity:</strong> Overall organization and cohesiveness
          </div>
        </div>
      </div>

      {/* Clinical Significance */}
      <div className="mt-4 p-4 bg-amber-50 border-l-4 border-amber-500 rounded">
        <h3 className="font-semibold text-amber-900 mb-2">Clinical Significance</h3>
        <p className="text-sm text-gray-700">
          Features with higher importance values had the most significant impact on the viability score. 
          These morphological parameters are critical indicators of embryo quality and developmental potential. 
          Top-ranked features deserve special attention during manual review.
        </p>
      </div>
    </Card>
  );
}
