import { Card } from './ui/card';
import { ConfusionMatrixData } from '../types/embryo';

interface ConfusionMatrixProps {
  data?: ConfusionMatrixData;
  modelName?: string;
}

export function ConfusionMatrix({ data, modelName = "Ensemble Model" }: ConfusionMatrixProps) {
  // Use provided data or default simulation data
  const matrixData = data || {
    true_positives: 158,
    false_positives: 18,
    true_negatives: 68,
    false_negatives: 12,
    accuracy: 0.883,
    precision: 0.898,
    recall: 0.929,
    f1_score: 0.913
  };

  const total = matrixData.true_positives + matrixData.false_positives + 
                matrixData.true_negatives + matrixData.false_negatives;

  const getPercentage = (value: number) => ((value / total) * 100).toFixed(1);

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Confusion Matrix</h2>
        <p className="text-gray-600">{modelName} - Performance Evaluation</p>
      </div>

      {/* Confusion Matrix Grid */}
      <div className="mb-6">
        <div className="inline-block">
          {/* Column Headers */}
          <div className="flex mb-2">
            <div className="w-32"></div>
            <div className="text-center font-semibold text-gray-700">
              <div className="mb-2">Predicted</div>
              <div className="flex gap-2">
                <div className="w-32 text-sm">Good</div>
                <div className="w-32 text-sm">Not Good</div>
              </div>
            </div>
          </div>

          {/* Matrix Rows */}
          <div className="flex">
            {/* Row Headers */}
            <div className="flex flex-col justify-center mr-4">
              <div className="font-semibold text-gray-700 -rotate-90 whitespace-nowrap">
                Actual
              </div>
            </div>
            
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <div className="w-20 font-semibold text-gray-700 text-sm">Good</div>
                <div className="flex gap-2">
                  {/* True Positive */}
                  <div className="w-32 h-32 bg-emerald-500 text-white rounded-lg flex flex-col items-center justify-center shadow-lg">
                    <div className="text-3xl font-bold">{matrixData.true_positives}</div>
                    <div className="text-xs mt-1">True Positive</div>
                    <div className="text-sm font-semibold">{getPercentage(matrixData.true_positives)}%</div>
                  </div>
                  
                  {/* False Negative */}
                  <div className="w-32 h-32 bg-red-400 text-white rounded-lg flex flex-col items-center justify-center shadow-lg">
                    <div className="text-3xl font-bold">{matrixData.false_negatives}</div>
                    <div className="text-xs mt-1">False Negative</div>
                    <div className="text-sm font-semibold">{getPercentage(matrixData.false_negatives)}%</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-20 font-semibold text-gray-700 text-sm">Not Good</div>
                <div className="flex gap-2">
                  {/* False Positive */}
                  <div className="w-32 h-32 bg-orange-400 text-white rounded-lg flex flex-col items-center justify-center shadow-lg">
                    <div className="text-3xl font-bold">{matrixData.false_positives}</div>
                    <div className="text-xs mt-1">False Positive</div>
                    <div className="text-sm font-semibold">{getPercentage(matrixData.false_positives)}%</div>
                  </div>
                  
                  {/* True Negative */}
                  <div className="w-32 h-32 bg-blue-500 text-white rounded-lg flex flex-col items-center justify-center shadow-lg">
                    <div className="text-3xl font-bold">{matrixData.true_negatives}</div>
                    <div className="text-xs mt-1">True Negative</div>
                    <div className="text-sm font-semibold">{getPercentage(matrixData.true_negatives)}%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">Accuracy</div>
          <div className="text-2xl font-bold text-purple-700">{(matrixData.accuracy * 100).toFixed(1)}%</div>
          <div className="text-xs text-gray-500 mt-1">Overall correctness</div>
        </div>

        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">Precision</div>
          <div className="text-2xl font-bold text-blue-700">{(matrixData.precision * 100).toFixed(1)}%</div>
          <div className="text-xs text-gray-500 mt-1">Positive predictive value</div>
        </div>

        <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">Recall</div>
          <div className="text-2xl font-bold text-emerald-700">{(matrixData.recall * 100).toFixed(1)}%</div>
          <div className="text-xs text-gray-500 mt-1">Sensitivity</div>
        </div>

        <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">F1 Score</div>
          <div className="text-2xl font-bold text-amber-700">{(matrixData.f1_score * 100).toFixed(1)}%</div>
          <div className="text-xs text-gray-500 mt-1">Harmonic mean</div>
        </div>
      </div>

      {/* Explanation */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm text-gray-700">
        <h3 className="font-semibold mb-2">Understanding the Matrix:</h3>
        <ul className="space-y-1 ml-4 list-disc">
          <li><span className="font-semibold text-emerald-600">True Positive:</span> Correctly identified as good embryo</li>
          <li><span className="font-semibold text-blue-600">True Negative:</span> Correctly identified as not good</li>
          <li><span className="font-semibold text-orange-600">False Positive:</span> Predicted good but actually not good</li>
          <li><span className="font-semibold text-red-600">False Negative:</span> Predicted not good but actually good</li>
        </ul>
      </div>

      {/* Model Performance Interpretation */}
      <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
        <h3 className="font-semibold text-blue-900 mb-2">Clinical Interpretation:</h3>
        <p className="text-sm text-gray-700">
          {matrixData.accuracy >= 0.85 && matrixData.recall >= 0.90 ? (
            <>This model shows <strong>excellent performance</strong> with high accuracy and recall, making it reliable for clinical embryo assessment. The high recall ({(matrixData.recall * 100).toFixed(1)}%) ensures we rarely miss good embryos.</>
          ) : matrixData.accuracy >= 0.75 ? (
            <>This model shows <strong>good performance</strong> suitable for clinical use with embryologist oversight. Consider using as a decision support tool.</>
          ) : (
            <>This model shows <strong>moderate performance</strong>. Manual review by an embryologist is strongly recommended for all assessments.</>
          )}
        </p>
      </div>
    </Card>
  );
}
