import {
  Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun,
  ImageRun, AlignmentType, WidthType, BorderStyle, ShadingType,
  VerticalAlign, HeightRule, PageBreak, convertInchesToTwip,
} from 'docx';
import type { DistributionItem } from './stats';
import logoHeaderUrl from '../../assets/logo_header.png';
import logoCapeUrl   from '../../assets/logo_cape.png';

// ─── constants ────────────────────────────────────────────
const FONT     = 'Arial';
const GREEN    = 'C8E6C9';
const BORDER   = { style: BorderStyle.SINGLE, size: 6, color: '000000' };
const ALL_B    = { top: BORDER, bottom: BORDER, left: BORDER, right: BORDER };
const PAGE_W   = 10466; // A4 minus 0.5" margins each side

// ─── helpers ──────────────────────────────────────────────
async function loadImage(url: string): Promise<ArrayBuffer> {
  const res  = await fetch(url);
  const blob = await res.blob();
  return blob.arrayBuffer();
}

function rtlPara(text: string, opts: { bold?: boolean; size?: number; underline?: boolean; center?: boolean; spaceBefore?: number; spaceAfter?: number } = {}): Paragraph {
  return new Paragraph({
    bidirectional: true,
    alignment: opts.center ? AlignmentType.CENTER : AlignmentType.RIGHT,
    spacing: { before: opts.spaceBefore ?? 120, after: opts.spaceAfter ?? 120 },
    children: [new TextRun({
      text,
      font: FONT,
      size: opts.size ?? 24,
      bold: opts.bold ?? false,
      rightToLeft: true,
      color: '000000',
      ...(opts.underline ? { underline: {} } : {}),
    })],
  });
}

function headerCell(text: string, w: number, bg = GREEN): TableCell {
  return new TableCell({
    width: { size: w, type: WidthType.DXA },
    borders: ALL_B,
    shading: { type: ShadingType.CLEAR, fill: bg },
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 80, bottom: 80, left: 100, right: 100 },
    children: [new Paragraph({
      bidirectional: true,
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text, font: FONT, size: 24, bold: true, rightToLeft: true, color: '000000' })],
    })],
  });
}

function dataCell(text: string, w: number, bg = 'FFFFFF'): TableCell {
  return new TableCell({
    width: { size: w, type: WidthType.DXA },
    borders: ALL_B,
    shading: { type: ShadingType.CLEAR, fill: bg },
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    children: [new Paragraph({
      bidirectional: true,
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text, font: FONT, size: 22, rightToLeft: true, color: '000000' })],
    })],
  });
}

function buildDistTable(data: DistributionItem[]): Table {
  const w1 = Math.round(PAGE_W * 0.50);
  const w2 = Math.round(PAGE_W * 0.25);
  const w3 = PAGE_W - w1 - w2;
  const headerRow = new TableRow({
    height: { value: convertInchesToTwip(0.4), rule: HeightRule.ATLEAST },
    children: [
      headerCell('الفئة',       w1, GREEN),
      headerCell('العدد',       w2, GREEN),
      headerCell('النسبة %',   w3, GREEN),
    ],
  });
  const dataRows = data.map((item, idx) => {
    const bg = idx % 2 === 0 ? 'FFFFFF' : 'F5F5F5';
    return new TableRow({
      height: { value: convertInchesToTwip(0.38), rule: HeightRule.ATLEAST },
      children: [
        dataCell(item.label,            w1, bg),
        dataCell(item.count.toString(), w2, bg),
        dataCell(`${item.percent}%`,    w3, bg),
      ],
    });
  });
  return new Table({
    width: { size: PAGE_W, type: WidthType.DXA },
    columnWidths: [w1, w2, w3],
    rows: [headerRow, ...dataRows],
  });
}

async function buildLogoHeader(logo1: ArrayBuffer, logo2: ArrayBuffer): Promise<Paragraph[]> {
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 60 },
      children: [new ImageRun({ data: logo1, transformation: { width: 650, height: 90 } })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 200 },
      children: [new ImageRun({ data: logo2, transformation: { width: 260, height: 90 } })],
    }),
    new Paragraph({
      bidirectional: true,
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 80 },
      children: [new TextRun({ text: 'مركز المواكبة لحماية الطفولة - تطوان', font: FONT, size: 22, bold: true, rightToLeft: true, color: '000000', underline: {} })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 200 },
      children: [new TextRun({ text: new Date().toLocaleDateString('ar-MA'), font: FONT, size: 20, color: '555555' })],
    }),
  ];
}

function buildSummary(title: string, data: DistributionItem[], total: number): Paragraph {
  const top = [...data].sort((a, b) => b.count - a.count)[0];
  const text = top
    ? `يتضح من خلال البيانات المتعلقة بـ "${title}" أن المجموع الكلي للحالات المسجلة بلغ ${total} حالة. وتُشكّل فئة "${top.label}" النسبة الأعلى بـ ${top.count} حالة أي ما يعادل ${top.percent}% من مجموع الحالات. تعكس هذه المعطيات أهمية التركيز على هذه الفئة في برامج التدخل والمواكبة الاجتماعية.`
    : `لا توجد بيانات كافية لإعداد الملخص.`;
  return rtlPara(text, { size: 24, spaceBefore: 200, spaceAfter: 200 });
}

// ─── single section builder ────────────────────────────────
async function buildSection(
  title: string,
  data: DistributionItem[],
  total: number,
  logo1: ArrayBuffer,
  logo2: ArrayBuffer,
  addPageBreak = false,
): Promise<Paragraph[]> {
  const logoParas = await buildLogoHeader(logo1, logo2);
  return [
    ...(addPageBreak ? [new Paragraph({ children: [new PageBreak()] })] : []),
    ...logoParas,
    rtlPara(title, { bold: true, size: 28, underline: true, center: true, spaceBefore: 200, spaceAfter: 300 }),
    buildDistTable(data) as any,
    new Paragraph({ spacing: { before: 240, after: 0 }, children: [] }),
    rtlPara('الملخص التحليلي:', { bold: true, size: 24, spaceBefore: 200, spaceAfter: 80 }),
    buildSummary(title, data, total),
  ];
}

// ─── download helper ───────────────────────────────────────
function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement('a');
  a.href     = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── PUBLIC API ────────────────────────────────────────────

export async function exportSingleDistribution(
  title: string,
  data: DistributionItem[],
  total: number,
  filename: string,
): Promise<void> {
  const [logo1, logo2] = await Promise.all([loadImage(logoHeaderUrl), loadImage(logoCapeUrl)]);
  const children = await buildSection(title, data, total, logo1, logo2, false);
  const doc = new Document({
    sections: [{
      properties: { page: { margin: { top: convertInchesToTwip(0.5), bottom: convertInchesToTwip(0.5), left: convertInchesToTwip(0.5), right: convertInchesToTwip(0.5) } } },
      children,
    }],
  });
  const blob = await Packer.toBlob(doc);
  download(blob, `${filename}_${new Date().toISOString().slice(0, 10)}.docx`);
}

export async function exportMasterReport(
  ageDist:       DistributionItem[],
  catDist:       DistributionItem[],
  violDist:      DistributionItem[],
  eduDist:       DistributionItem[],
  total:         number,
): Promise<void> {
  const [logo1, logo2] = await Promise.all([loadImage(logoHeaderUrl), loadImage(logoCapeUrl)]);

  const sections = [
    await buildSection('توزيع الحالات حسب الفئة العمرية',    ageDist,  total, logo1, logo2, false),
    await buildSection('توزيع الحالات حسب نوع الحالة',        catDist,  total, logo1, logo2, true),
    await buildSection('توزيع الحالات حسب نوع العنف',         violDist, total, logo1, logo2, true),
    await buildSection('توزيع الحالات حسب المستوى الدراسي',   eduDist,  total, logo1, logo2, true),
  ];

  const doc = new Document({
    sections: [{
      properties: { page: { margin: { top: convertInchesToTwip(0.5), bottom: convertInchesToTwip(0.5), left: convertInchesToTwip(0.5), right: convertInchesToTwip(0.5) } } },
      children: sections.flat(),
    }],
  });
  const blob = await Packer.toBlob(doc);
  download(blob, `التقرير_الشامل_${new Date().toISOString().slice(0, 10)}.docx`);
}
