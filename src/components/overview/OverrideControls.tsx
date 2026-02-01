import { useState } from 'react';
import { AlertCircle, CheckCircle2, Save, X } from 'lucide-react';
import type { EmbryoResult } from '../../types/embryo';

interface OverrideControlsProps {
    embryo: EmbryoResult | null;
    onUpdateEmbryo: (updatedEmbryo: EmbryoResult) => void;
}

export function OverrideControls({ embryo, onUpdateEmbryo }: OverrideControlsProps) {
    if (!embryo) {
        return null;
    }
    
    const [overrideScore, setOverrideScore] = useState<number | ''>(embryo.overrideScore || '');
    const [overrideReason, setOverrideReason] = useState(embryo.overrideReason || '');
    const [manualGrade, setManualGrade] = useState(embryo.manualGrade || '');
    const [notes, setNotes] = useState(embryo.notes || '');
    const [showSuccess, setShowSuccess] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubmit = () => {
        // Validation: If override score is provided, reason is required
        if (overrideScore !== '' && !overrideReason) {
            alert('Override Reason is required when providing an override score.');
            return;
        }
        
        // At least one field should be filled
        if (overrideScore === '' && !overrideReason && !manualGrade && !notes) {
            alert('Please fill at least one field to submit an override.');
            return;
        }
        
        setIsProcessing(true);
        
        // Simulate processing time
        setTimeout(() => {
            onUpdateEmbryo({
                ...embryo,
                overrideScore: typeof overrideScore === 'number' ? overrideScore : undefined,
                overrideReason,
                manualGrade,
                notes
            });
            
            setIsProcessing(false);
            // Show success message
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        }, 800);
    };

    return (
            <div className="bg-white rounded-xl border border-[#E6E6E6] p-6 space-y-6">
            <div className="flex items-start gap-4 mb-2">
                <AlertCircle className="size-6 text-amber-500 flex-shrink-0" />
                <div>
                    <h3 className="text-lg font-semibold text-charcoal">Embryologist Override Controls</h3>
                    <p className="text-sm text-charcoal/60">
                        Professional assessment takes precedence over system scoring. All overrides are logged for quality assurance.
                    </p>
                </div>
            </div>

            {/* Current Score Bar */}
                <div className="bg-blush p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-charcoal">Current Score</span>
                        <span className="text-2xl font-bold text-teal-medical">{embryo.viabilityScore}</span>
                </div>
                    <div className="h-2 bg-[#E6E6E6] rounded-full overflow-hidden">
                    <div
                            className="h-full bg-teal-medical rounded-full"
                        style={{ width: `${embryo.viabilityScore}%` }}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                    <div>
                            <label className="block text-sm font-medium text-charcoal mb-1">
                            Override Score (0-100)
                        </label>
                        <input
                            type="number"
                            min="0"
                            max="100"
                            value={overrideScore}
                            onChange={(e) => setOverrideScore(Number(e.target.value))}
                            placeholder="Enter new viability score"
                                className="w-full px-4 py-2 border border-[#E6E6E6] rounded-lg focus:ring-2 focus:ring-teal-medical focus:outline-none"
                        />
                            <p className="text-xs text-charcoal/60 mt-1">Provide your professional assessment score</p>
                    </div>

                    <div>
                            <label className="block text-sm font-medium text-charcoal mb-1">
                            Override Reason <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={overrideReason}
                            onChange={(e) => setOverrideReason(e.target.value)}
                                className="w-full px-4 py-2 border border-[#E6E6E6] rounded-lg focus:ring-2 focus:ring-teal-medical focus:outline-none bg-white"
                        >
                            <option value="">Select reason for override</option>
                            <option value="morphology">Morphological Anomaly</option>
                            <option value="development">Developmental Delay</option>
                            <option value="clinical">Clinical History Factor</option>
                            <option value="technical">Image Quality Issue</option>
                        </select>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                    <div>
                            <label className="block text-sm font-medium text-charcoal mb-1">
                            Manual Grade Assignment
                        </label>
                        <select
                            value={manualGrade}
                            onChange={(e) => setManualGrade(e.target.value)}
                                className="w-full px-4 py-2 border border-[#E6E6E6] rounded-lg focus:ring-2 focus:ring-teal-medical focus:outline-none bg-white"
                        >
                            <option value="">Select embryo grade</option>
                            <option value="5AA">5AA (Excellent)</option>
                            <option value="4AA">4AA (Very Good)</option>
                            <option value="3BB">3BB (Good)</option>
                            <option value="2CC">2CC (Fair)</option>
                        </select>
                            <p className="text-xs text-charcoal/60 mt-1">Gardner grading system classification</p>
                    </div>
                </div>
            </div>

            {/* Clinical Notes Full Width */}
            <div>
                 <label className="block text-sm font-medium text-charcoal mb-1">
                    Clinical Notes
                </label>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add detailed observations and rationale..."
                    rows={3}
                        className="w-full px-4 py-2 border border-[#E6E6E6] rounded-lg focus:ring-2 focus:ring-teal-medical focus:outline-none resize-none"
                />
                    <p className="text-xs text-charcoal/60 mt-1">Document specific morphological features or clinical considerations</p>
            </div>

            {/* Success Message */}
            {showSuccess && (
                <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-lg text-sm text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="size-4" />
                    Override saved successfully! Changes have been applied to {embryo.name}.
                </div>
            )}

            {/* Actions */}
            <div className="pt-4 flex gap-3">
                <button
                    onClick={handleSubmit}
                    disabled={isProcessing}
                    className="flex-1 bg-pink-700 text-white py-2.5 rounded-lg font-medium hover:bg-pink-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isProcessing ? (
                        <>
                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                        </>
                    ) : (
                        <>
                            <Save className="size-4" />
                            Submit Override
                        </>
                    )}
                </button>
                <button
                    onClick={() => {
                        setOverrideScore('');
                        setOverrideReason('');
                        setManualGrade('');
                        setNotes('');
                    }}
                        className="px-6 py-2.5 border border-[#E6E6E6] text-charcoal/70 rounded-lg font-medium hover:bg-blush flex items-center gap-2"
                >
                    <X className="size-4" />
                    Clear
                </button>
            </div>

            {/* Audit Note */}
                <div className="flex items-center gap-2 p-3 bg-blush rounded-lg text-sm text-teal-medical">
                <CheckCircle2 className="size-4" />
                All override actions are recorded in the audit trail with timestamp for compliance.
            </div>
        </div>
    );
}
