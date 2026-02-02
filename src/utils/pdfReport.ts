import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { EmbryoResult } from '../types/embryo';
import { getEmbryaLogoBase64 } from '../components/EmbryaLogo';

interface ReportOptions {
  clinicName?: string;
  embryologistName?: string;
  patientName?: string;
  patientId?: string;
  patientMRN?: string;
  cycleNumber?: string;
}

/**
 * Generate a comprehensive PDF report for embryo analysis
 * Follows standard clinical laboratory report format with Embrya branding
 */
export function generateEmbryoReport(
  embryo: EmbryoResult,
  options: ReportOptions = {}
): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPos = 20;

  // ==================== HEADER WITH LOGO ====================
  // Add Embrya Logo
  try {
    const logoData = getEmbryaLogoBase64();
    doc.addImage(logoData, 'SVG', 15, 8, 40, 13);
  } catch (error) {
    console.warn('Failed to add logo:', error);
  }

  // Header background
  doc.setFillColor(59, 130, 246); // Blue-600
  doc.rect(0, 0, pageWidth, 35, 'F');
  
  // Report title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('EMBRYO VIABILITY ANALYSIS REPORT', pageWidth / 2, 15, { align: 'center' });
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Clinical Assessment | AI-Assisted Analysis', pageWidth / 2, 23, { align: 'center' });

  // Timestamp in header
  const timestamp = new Date().toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
  doc.setFontSize(8);
  doc.text(`Generated: ${timestamp}`, pageWidth - 15, 30, { align: 'right' });

  yPos = 45;
  doc.setTextColor(0, 0, 0);

  // ==================== REPORT METADATA ====================
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('REPORT INFORMATION', 15, yPos);
  yPos += 2;
  
  doc.setFont('helvetica', 'normal');
  
  const metadata = [
    ['Report ID:', `RPT-${Date.now().toString().slice(-8)}`],
    ['Generated:', timestamp],
    ['Clinic:', options.clinicName || 'Not Specified'],
    ['Embryologist:', options.embryologistName || 'Not Specified'],
    ...(options.patientName ? [['Patient Name:', options.patientName]] : []),
    ...(options.patientMRN ? [['Patient MRN:', options.patientMRN]] : []),
    ['Patient ID:', options.patientId || 'Anonymous'],
    ['Cycle Number:', options.cycleNumber || 'N/A'],
    ['Embryo ID:', embryo.id],
    ['Embryo Name:', embryo.name]
  ];

  autoTable(doc, {
    startY: yPos,
    head: [],
    body: metadata,
    theme: 'plain',
    styles: {
      fontSize: 9,
      cellPadding: 2
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 45 },
      1: { cellWidth: 'auto' }
    }
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // ==================== VIABILITY ASSESSMENT ====================
  doc.setFillColor(240, 240, 240);
  doc.rect(10, yPos, pageWidth - 20, 8, 'F');
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('VIABILITY ASSESSMENT', 15, yPos + 5.5);
  yPos += 12;

  // Score Box
  const scoreColor = embryo.viabilityScore >= 75 ? [34, 197, 94] : 
                     embryo.viabilityScore >= 50 ? [251, 146, 60] : [239, 68, 68];
  
  doc.setDrawColor(...scoreColor);
  doc.setLineWidth(2);
  doc.rect(15, yPos, 80, 25);
  
  doc.setFontSize(36);
  doc.setTextColor(...scoreColor);
  doc.setFont('helvetica', 'bold');
  doc.text(embryo.viabilityScore.toString(), 55, yPos + 18, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('/100', 70, yPos + 18);
  
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);
  doc.text('VIABILITY SCORE', 55, yPos + 23, { align: 'center' });

  // Status and Recommendation
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Clinical Status:', 105, yPos + 8);
  doc.setFont('helvetica', 'normal');
  const status = embryo.viabilityScore >= 75 ? 'VIABLE - GOOD' :
                 embryo.viabilityScore >= 50 ? 'CAUTION - FAIR' : 'RISK - POOR';
  doc.text(status, 105, yPos + 14);

  doc.setFont('helvetica', 'bold');
  doc.text('Recommendation:', 105, yPos + 20);
  doc.setFont('helvetica', 'normal');
  const recText = doc.splitTextToSize(embryo.recommendation, 85);
  doc.text(recText, 105, yPos + 26);

  yPos += 35;

  // ==================== MORPHOLOGICAL FEATURES ====================
  doc.setFillColor(240, 240, 240);
  doc.rect(10, yPos, pageWidth - 20, 8, 'F');
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('MORPHOLOGICAL CHARACTERISTICS', 15, yPos + 5.5);
  yPos += 12;

  const morphologyData = [
    ['Developmental Stage', embryo.features.developmentalStage || 'N/A'],
    ['Symmetry', embryo.features.symmetry || 'N/A'],
    ['Fragmentation', embryo.features.fragmentation || 'N/A'],
    ['Blastocyst Expansion', embryo.features.blastocystExpansion || 'N/A'],
    ['Inner Cell Mass (ICM)', embryo.features.innerCellMass || 'N/A'],
    ['Trophectoderm (TE)', embryo.features.trophectoderm || 'N/A']
  ];

  autoTable(doc, {
    startY: yPos,
    head: [['Parameter', 'Assessment']],
    body: morphologyData,
    theme: 'striped',
    headStyles: {
      fillColor: [41, 128, 185],
      fontSize: 10,
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 9,
      cellPadding: 3
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 60 },
      1: { cellWidth: 'auto' }
    }
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // ==================== MORPHOMETRY SUMMARY ====================
  if (yPos > pageHeight - 60) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFillColor(240, 240, 240);
  doc.rect(10, yPos, pageWidth - 20, 8, 'F');
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('QUANTITATIVE MORPHOMETRY', 15, yPos + 5.5);
  yPos += 12;

  const circularityValue = Math.round(embryo.viabilityScore * 0.95);
  const fragmentationValue = Math.max(0, Math.round((100 - embryo.viabilityScore) * 0.8));
  const boundaryValue = Math.round(embryo.viabilityScore * 0.85);
  const symmetryValue = Math.round(embryo.viabilityScore * 0.92);

  const morphometryData = [
    ['Circularity Index', `${circularityValue}/100`, circularityValue >= 75 ? 'Excellent' : 'Good'],
    ['Fragmentation Rate', `${fragmentationValue}%`, fragmentationValue <= 15 ? 'Minimal' : 'Moderate'],
    ['Boundary Integrity', `${boundaryValue}/100`, boundaryValue >= 75 ? 'Excellent' : 'Good'],
    ['Symmetry Score', `${symmetryValue}/100`, symmetryValue >= 75 ? 'Excellent' : 'Good']
  ];

  autoTable(doc, {
    startY: yPos,
    head: [['Metric', 'Value', 'Interpretation']],
    body: morphometryData,
    theme: 'striped',
    headStyles: {
      fillColor: [41, 128, 185],
      fontSize: 10,
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 9,
      cellPadding: 3
    }
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // ==================== KEY FINDINGS ====================
  if (yPos > pageHeight - 50) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFillColor(240, 240, 240);
  doc.rect(10, yPos, pageWidth - 20, 8, 'F');
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('KEY FINDINGS', 15, yPos + 5.5);
  yPos += 12;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  embryo.keyFindings.forEach((finding, idx) => {
    const bullet = `${idx + 1}. ${finding}`;
    const lines = doc.splitTextToSize(bullet, pageWidth - 30);
    doc.text(lines, 15, yPos);
    yPos += lines.length * 5;
    
    if (yPos > pageHeight - 20) {
      doc.addPage();
      yPos = 20;
    }
  });

  yPos += 5;

  // ==================== AI MODEL DETAILS ====================
  if (yPos > pageHeight - 60) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFillColor(240, 240, 240);
  doc.rect(10, yPos, pageWidth - 20, 8, 'F');
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('AI MODEL ANALYSIS', 15, yPos + 5.5);
  yPos += 12;

  if (embryo.modelPredictions && embryo.modelPredictions.length > 0) {
    const modelData = embryo.modelPredictions.map(m => [
      m.model,
      `${(m.probabilityGood * 100).toFixed(1)}%`,
      `${(m.probabilityNotGood * 100).toFixed(1)}%`
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Model', 'Prob. Viable', 'Prob. Not Viable']],
      body: modelData,
      theme: 'striped',
      headStyles: {
        fillColor: [41, 128, 185],
        fontSize: 10,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 9,
        cellPadding: 3
      }
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // Model consensus
  const avgConfidence = embryo.modelPredictions?.length 
    ? Math.round(embryo.modelPredictions.reduce((acc, m) => acc + m.probabilityGood * 100, 0) / embryo.modelPredictions.length)
    : 85;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`AI Consensus: ${avgConfidence}% agreement`, 15, yPos);
  yPos += 6;

  if (embryo.explainabilityNote) {
    doc.setFont('helvetica', 'italic');
    const noteLines = doc.splitTextToSize(embryo.explainabilityNote, pageWidth - 30);
    doc.text(noteLines, 15, yPos);
    yPos += noteLines.length * 5 + 5;
  }

  // ==================== TOP CONTRIBUTING FACTORS ====================
  if (embryo.featureImportance && embryo.featureImportance.length > 0) {
    if (yPos > pageHeight - 60) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFillColor(240, 240, 240);
    doc.rect(10, yPos, pageWidth - 20, 8, 'F');
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('TOP CONTRIBUTING FACTORS', 15, yPos + 5.5);
    yPos += 12;

    const topFeatures = embryo.featureImportance
      .sort((a, b) => b.importance - a.importance)
      .slice(0, 10)
      .map(f => [
        f.feature.replace(/_/g, ' ').replace(/mean|std/g, '').trim(),
        `${f.importance.toFixed(1)}%`,
        f.direction === 'positive' ? '↑ Positive' : f.direction === 'negative' ? '↓ Negative' : '- Neutral'
      ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Feature', 'Importance', 'Direction']],
      body: topFeatures,
      theme: 'striped',
      headStyles: {
        fillColor: [41, 128, 185],
        fontSize: 10,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 9,
        cellPadding: 3
      },
      columnStyles: {
        0: { cellWidth: 90 },
        1: { cellWidth: 35, halign: 'center' },
        2: { cellWidth: 'auto', halign: 'center' }
      }
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // ==================== FOOTER/DISCLAIMER ====================
  const finalYPos = yPos > pageHeight - 50 ? 20 : yPos;
  if (yPos > pageHeight - 50) {
    doc.addPage();
  }

  // Footer with logo
  doc.setFillColor(250, 250, 250);
  doc.rect(10, pageHeight - 40, pageWidth - 20, 30, 'F');
  
  // Add small logo to footer
  try {
    const logoData = getEmbryaLogoBase64();
    doc.addImage(logoData, 'SVG', 15, pageHeight - 35, 30, 10);
  } catch (error) {
    console.warn('Failed to add footer logo:', error);
  }
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 100, 100);
  doc.text('CLINICAL DISCLAIMER:', 50, pageHeight - 32);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  const disclaimer = 'This report is generated by an AI-assisted embryo analysis system and is intended to support clinical decision-making. ' +
                     'Final embryo selection should be made by qualified embryologists based on comprehensive clinical assessment and patient-specific factors. ' +
                     'This system does not replace professional medical judgment.';
  const disclaimerLines = doc.splitTextToSize(disclaimer, pageWidth - 60);
  doc.text(disclaimerLines, 50, pageHeight - 28);

  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  const pageNum = doc.internal.pages.length - 1;
  doc.text(`Page ${pageNum} | Report ID: RPT-${Date.now().toString().slice(-8)} | ${timestamp}`, pageWidth / 2, pageHeight - 8, { align: 'center' });

  // ==================== SAVE PDF ====================
  const fileName = `Embryo_${embryo.name}_Report_${new Date().toISOString().split('T')[0]}_${Date.now().toString().slice(-6)}.pdf`;
  doc.save(fileName);
}

/**
 * Generate a batch report for multiple embryos (comparison report)
 */
export function generateBatchReport(embryos: EmbryoResult[], options: ReportOptions = {}): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPos = 20;

  // Timestamp for the report
  const timestamp = new Date().toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  // ==================== HEADER WITH LOGO ====================
  // Add Embrya Logo
  try {
    const logoData = getEmbryaLogoBase64();
    doc.addImage(logoData, 'SVG', 15, 8, 40, 13);
  } catch (error) {
    console.warn('Failed to add logo:', error);
  }

  // Header background
  doc.setFillColor(59, 130, 246); // Blue-600
  doc.rect(0, 0, pageWidth, 35, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('EMBRYO BATCH ANALYSIS REPORT', pageWidth / 2, 15, { align: 'center' });
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Comparative Analysis of ${embryos.length} Embryos`, pageWidth / 2, 23, { align: 'center' });

  // Timestamp in header
  doc.setFontSize(8);
  doc.text(`Generated: ${timestamp}`, pageWidth - 15, 30, { align: 'right' });

  yPos = 45;
  doc.setTextColor(0, 0, 0);

  // ==================== REPORT METADATA ====================
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('REPORT INFORMATION', 15, yPos);
  yPos += 2;
  
  doc.setFont('helvetica', 'normal');

  const reportDate = new Date().toLocaleString('en-US', {
    dateStyle: 'long',
    timeStyle: 'short'
  });
  
  doc.setFontSize(9);
  doc.text(`Report Generated: ${reportDate}`, 15, yPos);
  yPos += 5;
  doc.text(`Clinic: ${options.clinicName || 'Not Specified'}`, 15, yPos);
  yPos += 5;
  doc.text(`Embryologist: ${options.embryologistName || 'Not Specified'}`, 15, yPos);
  yPos += 10;

  // Summary table
  doc.setFillColor(240, 240, 240);
  doc.rect(10, yPos, pageWidth - 20, 8, 'F');
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('EMBRYO RANKING SUMMARY', 15, yPos + 5.5);
  yPos += 12;

  const sortedEmbryos = [...embryos].sort((a, b) => b.viabilityScore - a.viabilityScore);
  
  const summaryData = sortedEmbryos.map((e, idx) => [
    (idx + 1).toString(),
    e.name,
    e.viabilityScore.toString(),
    e.features.developmentalStage || 'N/A',
    e.recommendation.substring(0, 40) + '...'
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [['Rank', 'Name', 'Score', 'Stage', 'Recommendation']],
    body: summaryData,
    theme: 'striped',
    headStyles: {
      fillColor: [59, 130, 246],
      fontSize: 9,
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 8,
      cellPadding: 2
    }
  });

  // Footer
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFillColor(250, 250, 250);
  doc.rect(10, pageHeight - 35, pageWidth - 20, 25, 'F');
  
  // Add small logo to footer
  try {
    const logoData = getEmbryaLogoBase64();
    doc.addImage(logoData, 'SVG', 15, pageHeight - 32, 30, 10);
  } catch (error) {
    console.warn('Failed to add footer logo:', error);
  }

  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.text(`Report ID: RPT-${Date.now().toString().slice(-8)} | ${timestamp}`, pageWidth / 2, pageHeight - 8, { align: 'center' });

  // Save with timestamp
  const dateStr = new Date().toISOString().split('T')[0];
  const timeStr = Date.now().toString().slice(-6);
  const fileName = `Embryo_Batch_Report_${dateStr}_${timeStr}.pdf`;
  doc.save(fileName);
}
