import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun } from 'docx';
import type { YearlyStats, MonthlyStats } from '@/types';

class ExportService {
  async exportToPDF(stats: YearlyStats | MonthlyStats, type: 'monthly' | 'yearly'): Promise<void> {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('CAPE - Rapport de Protection de l\'Enfance', 14, 20);
    
    doc.setFontSize(12);
    const title = type === 'yearly' 
      ? `Année: ${(stats as YearlyStats).year}`
      : `Mois: ${(stats as MonthlyStats).month}`;
    doc.text(title, 14, 30);
    
    doc.text(`Total: ${stats.total}`, 14, 40);
    doc.text(`Garçons: ${stats.boys}`, 14, 47);
    doc.text(`Filles: ${stats.girls}`, 14, 54);

    const problemsData = Object.entries(stats.problemsDistribution).map(([type, count]) => [
      type, count.toString()
    ]);

    autoTable(doc, {
      startY: 65,
      head: [['Type de Problème', 'Nombre']],
      body: problemsData,
    });

    doc.save(`rapport_${type}_${Date.now()}.pdf`);
  }

  async exportToExcel(stats: YearlyStats | MonthlyStats, type: 'monthly' | 'yearly'): Promise<void> {
    const ws_data = [
      ['CAPE - Rapport'],
      [''],
      ['Total', stats.total],
      ['Garçons', stats.boys],
      ['Filles', stats.girls],
      [''],
      ['Type de Problème', 'Nombre'],
      ...Object.entries(stats.problemsDistribution).map(([type, count]) => [type, count])
    ];

    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Rapport');
    
    XLSX.writeFile(wb, `rapport_${type}_${Date.now()}.xlsx`);
  }

  async exportToWord(stats: YearlyStats | MonthlyStats, type: 'monthly' | 'yearly'): Promise<void> {
    const doc = new Document({
      sections: [{
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: 'CAPE - Rapport de Protection de l\'Enfance',
                bold: true,
                size: 32
              })
            ]
          }),
          new Paragraph({ text: '' }),
          new Paragraph({ text: `Total: ${stats.total}` }),
          new Paragraph({ text: `Garçons: ${stats.boys}` }),
          new Paragraph({ text: `Filles: ${stats.girls}` }),
          new Paragraph({ text: '' }),
          new Table({
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph('Type de Problème')] }),
                  new TableCell({ children: [new Paragraph('Nombre')] })
                ]
              }),
              ...Object.entries(stats.problemsDistribution).map(([type, count]) =>
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph(type)] }),
                    new TableCell({ children: [new Paragraph(count.toString())] })
                  ]
                })
              )
            ]
          })
        ]
      }]
    });

    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport_${type}_${Date.now()}.docx`;
    a.click();
  }
}

export const exportService = new ExportService();
