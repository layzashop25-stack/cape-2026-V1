import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  ImageRun,
  AlignmentType,
  WidthType,
  BorderStyle,
  ShadingType,
  PageBreak,
  VerticalAlign,
  HeightRule,
  LineRuleType,
  convertInchesToTwip,
} from 'docx';
import type { Case } from '@/types';

// ─── Logo imports (files must be in src/assets/) ─────────────────────────────
import logo1Url from '../../assets/logo_header.png';
import logo2Url from '../../assets/logo_cape.png';

async function urlToBase64(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url);
  const blob = await res.blob();
  return await blob.arrayBuffer();
}

// ─── interfaces ──────────────────────────────────────────────────────────────

export interface RapportOverrides {
  caseNumber: string;         // رقم الحالة — editable in modal
  receptionDate: string;      // تاريخ الاستقبال — editable in modal
  interventionItems: string[];
  resultsItems: string[];
  futureStepsItems: string[];
  stakeholdersItems: string[];
  summaryText: string;
  caseInfoText: string;
}

// ─── constants ───────────────────────────────────────────────────────────────

const FONT = 'Arial';
const GREEN_BG = 'C8E6C9';
const BORDER = { style: BorderStyle.SINGLE, size: 6, color: '000000' };
const ALL_BORDERS = { top: BORDER, bottom: BORDER, left: BORDER, right: BORDER };

// Page content width: A4 (11906 DXA) - 2×720 DXA (0.5" margins) = 10466 DXA
const PAGE_W = 10466;

// ─── helpers ─────────────────────────────────────────────────────────────────

function bulletPara(text: string): Paragraph {
  return new Paragraph({
    bidirectional: true,
    alignment: AlignmentType.RIGHT,
    spacing: { before: 80, after: 80, line: 360 },
    indent: { right: convertInchesToTwip(0.3) },
    children: [
      new TextRun({ text: `• ${text}`, font: FONT, size: 26, rightToLeft: true, color: '000000' }),
    ],
  });
}

// RIGHT column — green label
function blackCell(text: string): TableCell {
  const w = Math.round(PAGE_W * 0.25);
  return new TableCell({
    width: { size: w, type: WidthType.DXA },
    borders: ALL_BORDERS,
    shading: { type: ShadingType.CLEAR, fill: GREEN_BG },
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [
      new Paragraph({
        bidirectional: true,
        alignment: AlignmentType.CENTER,
        spacing: { before: 100, after: 100 },
        children: [
          new TextRun({ text, font: FONT, size: 26, bold: true, color: "000000", rightToLeft: true }),
        ],
      }),
    ],
  });
}

// LEFT column — content with bullets
function contentCell(paragraphs: Paragraph[]): TableCell {
  const w = PAGE_W - Math.round(PAGE_W * 0.25);
  return new TableCell({
    width: { size: w, type: WidthType.DXA },
    borders: ALL_BORDERS,
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: paragraphs,
  });
}

function emptyPara(spacing = 160): Paragraph {
  return new Paragraph({
    spacing: { before: spacing, after: spacing },
    children: [new TextRun({ text: '' })],
  });
}

function sectionHeading(text: string): Paragraph {
  return new Paragraph({
    bidirectional: true,
    alignment: AlignmentType.CENTER,
    spacing: { before: 400, after: 240 },
    children: [
      new TextRun({
        text,
        font: FONT,
        size: 32,
        bold: true,
        underline: {},
        color: '000000',
        rightToLeft: true,
      }),
    ],
  });
}

// ─── build default overrides ─────────────────────────────────────────────────

export function buildDefaultOverrides(caseData: Case): RapportOverrides {
  const childName =
    `${caseData.firstName ?? ''} ${caseData.lastName ?? ''}`.trim() ||
    caseData.name ||
    '—';
  const fileNumber = caseData.fileNumber || caseData.id.slice(0, 8).toUpperCase();
  const worker = caseData.completedBy || '—';
  const receptionDate = caseData.date
    ? new Date(caseData.date).toLocaleDateString('ar-MA')
    : '—';
  const birthDate = caseData.birthDate
    ? new Date(caseData.birthDate).toLocaleDateString('ar-MA')
    : '—';
  const gender = caseData.gender === 'male' ? 'ذكر' : 'أنثى';
  const fatherName =
    `${caseData.fatherFirstName ?? ''} ${caseData.fatherLastName ?? ''}`.trim() || '—';
  const motherName =
    `${caseData.motherFirstName ?? ''} ${caseData.motherLastName ?? ''}`.trim() || '—';

  const violenceLabels: Record<string, string> = {
    physical: 'جسدي', sexual: 'جنسي', psychological: 'نفسي', social: 'اجتماعي',
  };
  const violenceStr =
    (caseData.violenceTypes ?? [])
      .map((v: string) => violenceLabels[v] ?? v)
      .join('، ') || '—';

  const caseTypeLabels: Record<string, string> = {
    violence: 'عنف', addiction: 'إدمان', neglect: 'إهمال',
    exploitation: 'استغلال', family_issues: 'مشاكل عائلية', other: 'أخرى',
  };
  const caseTypeAr = caseTypeLabels[caseData.problemType] ?? caseData.problemType ?? '—';

  const summaryText =
    `• تم التواصل مع ${caseData.sender || 'الجهة المُبلِّغة'} بخصوص الحالة المُسجَّلة تحت رقم ${fileNumber}، والمتعلقة بالطفل ${childName} المولود بتاريخ ${birthDate} في ${caseData.birthPlace || '—'}، الجنس: ${gender}. مصدر التبليغ: ${caseData.reportSource || '—'}.\n` +
    `• الطفل في وضعية ${caseTypeAr}.${caseData.childCondition ? ` الحالة التي أتى بها الطفل: ${caseData.childCondition}.` : ''}${caseData.notes ? ` ملاحظات: ${caseData.notes}.` : ''}`;

  const caseInfoText =
    `• الطفل ${childName}، المولود بتاريخ ${birthDate} في ${caseData.birthPlace || '—'}، ${gender}، يقيم مع ${caseData.childLivingPlace || '—'}. الأب: ${fatherName} (${caseData.fatherProfession || '—'})، الأم: ${motherName} (${caseData.motherProfession || '—'}). الوضع الأسري: ${caseData.parentsStatus || '—'}. نوع العنف: ${violenceStr}.${caseData.violenceNature ? ` طبيعة العنف: ${caseData.violenceNature}.` : ''}${caseData.childStatement ? ` تصريح الطفل: ${caseData.childStatement}.` : ''}${caseData.childRequests ? ` طلبات الطفل: ${caseData.childRequests}.` : ''}\n` +
    `• تم تسجيل الطفل ${childName} في منصة المواكبة للاستفادة من الدعم الاجتماعي تحت رقم الملف ${fileNumber}، بتاريخ ${receptionDate}، من طرف ${worker}.`;

  return {
    caseNumber: fileNumber,
    receptionDate,
    interventionItems: [
      'التواصل مع الجمعية المتواجدة فيها الحالة',
      'جمع المعلومات بخصوص الحالة',
      'تشخيص الوضعية',
    ],
    resultsItems: ['تسجيل الطفل في منصة المواكبة للاستفادة من الدعم الاجتماعي'],
    futureStepsItems: ['تسطير برنامج للتتبع والمواكبة', 'التواصل مع الحضانة'],
    stakeholdersItems: [
      'متندوبية التعاون الوطني بتطوان',
      'مركز المواكبة لحماية الطفولة',
      'حضانة مهد البراءة للأشخاص في وضعية إعاقة',
    ],
    summaryText,
    caseInfoText,
  };
}

// ─── main export ─────────────────────────────────────────────────────────────

export async function generateCaseRapport(
  caseData: Case,
  overrides: RapportOverrides,
): Promise<void> {
  const childName =
    `${caseData.firstName ?? ''} ${caseData.lastName ?? ''}`.trim() ||
    caseData.name ||
    '—';
  const worker = caseData.completedBy || '—';

  // Load real logo images
  const [logo1Data, logo2Data] = await Promise.all([
    urlToBase64(logo1Url),
    urlToBase64(logo2Url),
  ]);

  // ── Logo 1: wide header banner ────────────────────────────────────────────
  const logo1Para = new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 60 },
    children: [
      new ImageRun({
        data: logo1Data,
        transformation: { width: 650, height: 90 },
        type: 'png',
      }),
    ],
  });

  // ── Logo 2: CAPE square logo ──────────────────────────────────────────────
  const logo2Para = new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 450 },
    children: [
      new ImageRun({
        data: logo2Data,
        transformation: { width: 260, height: 90 },
        type: 'png',
      }),
    ],
  });

  // ── Sub-header table (متندوبية | مركز المواكبة) ───────────────────────────
  const halfW = Math.floor(PAGE_W / 2);
  const subHeaderTable = new Table({
    width: { size: PAGE_W, type: WidthType.DXA },
    columnWidths: [halfW, PAGE_W - halfW],
    rows: [
      new TableRow({
        height: { value: convertInchesToTwip(0.38), rule: HeightRule.ATLEAST },
        children: [
          new TableCell({
            width: { size: halfW, type: WidthType.DXA },
            borders: ALL_BORDERS,
            verticalAlign: VerticalAlign.CENTER,
            margins: { top: 60, bottom: 60, left: 120, right: 120 },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: 'متندوبية التعاون الوطني بتطوان',
                    font: FONT,
                    size: 22,
                    bold: true,
                    color: '000000',
                    underline: {},
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: PAGE_W - halfW, type: WidthType.DXA },
            borders: ALL_BORDERS,
            verticalAlign: VerticalAlign.CENTER,
            margins: { top: 60, bottom: 60, left: 120, right: 120 },
            children: [
              new Paragraph({
                bidirectional: true,
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: 'مركز المواكبة لحماية الطفولة',
                    font: FONT,
                    size: 22,
                    rightToLeft: true,
                    bold: true,
                    color: '000000',
                    underline: {},
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  // ── Report title ──────────────────────────────────────────────────────────
  const reportTitle = new Paragraph({
    bidirectional: true,
    alignment: AlignmentType.CENTER,
    spacing: { before: 240, after: 450 },
    children: [
      new TextRun({
        text: 'تقرير عن حالة طفل تم تسجيله في منصة المواكبة للاستفادة من الدعم الاجتماعي',
        font: FONT,
        size: 28,
        bold: true,
        underline: {},
        rightToLeft: true,
        color: '000000',
      }),
    ],
  });

  // ── Info table ────────────────────────────────────────────────────────────
  const iCol1 = Math.round(PAGE_W * 0.18);
  const iCol2 = Math.round(PAGE_W * 0.37);
  const iCol3 = PAGE_W - iCol1 - iCol2;

  const greenHeaderCell = (text: string, w: number) =>
    new TableCell({
      width: { size: w, type: WidthType.DXA },
      borders: ALL_BORDERS,
      shading: { type: ShadingType.CLEAR, fill: GREEN_BG },
      verticalAlign: VerticalAlign.CENTER,
      margins: { top: 60, bottom: 60, left: 80, right: 80 },
      children: [
        new Paragraph({
          bidirectional: true,
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text, font: FONT, size: 24, bold: true, rightToLeft: true, color: '000000' })],
        }),
      ],
    });

  const infoTable = new Table({
    width: { size: PAGE_W, type: WidthType.DXA },
    columnWidths: [iCol1, iCol2, iCol3],
    rows: [
      new TableRow({
        height: { value: convertInchesToTwip(0.48), rule: HeightRule.ATLEAST },
        children: [
          greenHeaderCell('رقم الحالة', iCol1),
          greenHeaderCell('المساعد(ة) المكلف(ة)', iCol2),
          greenHeaderCell('التاريخ', iCol3),
        ],
      }),
      new TableRow({
        height: { value: convertInchesToTwip(0.65), rule: HeightRule.ATLEAST },
        children: [
          new TableCell({
            width: { size: iCol1, type: WidthType.DXA },
            borders: ALL_BORDERS,
            verticalAlign: VerticalAlign.CENTER,
            margins: { top: 60, bottom: 60, left: 80, right: 80 },
            children: [
              new Paragraph({
                bidirectional: true,
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: overrides.caseNumber, font: FONT, size: 24, rightToLeft: true, color: '000000' })],
              }),
            ],
          }),
          new TableCell({
            width: { size: iCol2, type: WidthType.DXA },
            borders: ALL_BORDERS,
            verticalAlign: VerticalAlign.CENTER,
            margins: { top: 60, bottom: 60, left: 80, right: 80 },
            children: [
              new Paragraph({
                bidirectional: true,
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: worker, font: FONT, size: 24, rightToLeft: true, color: '000000' })],
              }),
            ],
          }),
          new TableCell({
            width: { size: iCol3, type: WidthType.DXA },
            borders: ALL_BORDERS,
            verticalAlign: VerticalAlign.CENTER,
            margins: { top: 60, bottom: 60, left: 80, right: 80 },
            children: [
              new Paragraph({
                bidirectional: true,
                alignment: AlignmentType.RIGHT,
                children: [new TextRun({ text: `عملية الاستقبال: ${overrides.receptionDate}`, font: FONT, size: 22, rightToLeft: true, color: '000000' })],
              }),
              new Paragraph({
                bidirectional: true,
                alignment: AlignmentType.RIGHT,
                children: [new TextRun({ text: 'المكان: مركز المواكبة لحماية الطفولة', font: FONT, size: 22, rightToLeft: true, color: '000000' })],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  // ── Intervention table — [content LEFT 75% | green label RIGHT 25%] ───────
  const intW1 = PAGE_W - Math.round(PAGE_W * 0.25);
  const intW2 = Math.round(PAGE_W * 0.25);

  const interventionTable = new Table({
    width: { size: PAGE_W, type: WidthType.DXA },
    columnWidths: [intW1, intW2],
    rows: [
      new TableRow({
        height: { value: convertInchesToTwip(1.0), rule: HeightRule.ATLEAST },
        children: [contentCell(overrides.interventionItems.map(bulletPara)), blackCell('نوعية التدخل')],
      }),
      new TableRow({
        height: { value: convertInchesToTwip(0.8), rule: HeightRule.ATLEAST },
        children: [contentCell(overrides.resultsItems.map(bulletPara)), blackCell('النتائج المحققة')],
      }),
      new TableRow({
        height: { value: convertInchesToTwip(1.0), rule: HeightRule.ATLEAST },
        children: [contentCell(overrides.futureStepsItems.map(bulletPara)), blackCell('الخطوات المستقبلية')],
      }),
      new TableRow({
        height: { value: convertInchesToTwip(1.0), rule: HeightRule.ATLEAST },
        children: [contentCell(overrides.stakeholdersItems.map(bulletPara)), blackCell('المتدخلون في الحالة')],
      }),
    ],
  });

  // ── Page 2 body paragraphs ────────────────────────────────────────────────
  const textToParagraphs = (text: string): Paragraph[] =>
    text
      .split('\n')
      .filter(line => line.trim().length > 0)
      .map(line =>
        new Paragraph({
          bidirectional: true,
          alignment: AlignmentType.RIGHT,
          spacing: { before: 200, after: 200, line: 440, lineRule: LineRuleType.AUTO },
          indent: { right: convertInchesToTwip(0.3) },
          children: [
            new TextRun({ text: line, font: FONT, size: 28, rightToLeft: true, color: '000000' }),
          ],
        }),
      );

  // ── Assemble document ─────────────────────────────────────────────────────
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(0.5),
              bottom: convertInchesToTwip(0.5),
              left: convertInchesToTwip(0.5),
              right: convertInchesToTwip(0.5),
            },
          },
        },
        children: [
          // ── PAGE 1 ──────────────────────────────────────────────────────
          logo1Para,
          logo2Para,
          subHeaderTable,
          emptyPara(120),
          reportTitle,
          infoTable,
          emptyPara(180),
          interventionTable,
          emptyPara(160),

          // ── PAGE BREAK ───────────────────────────────────────────────────
          new Paragraph({ children: [new PageBreak()] }),

          // ── PAGE 2 ──────────────────────────────────────────────────────
          emptyPara(200),

          sectionHeading('ملخص حول وضعية الحالة '),
          ...textToParagraphs(overrides.summaryText),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 280, after: 280 },
            children: [
              new TextRun({ text: '──────────────────────────────────────', color: '888888', size: 18 }),
            ],
          }),

          sectionHeading('معلومات عن الحالة '),
          ...textToParagraphs(overrides.caseInfoText),
        ],
      },
    ],
  });

  // ── Download ──────────────────────────────────────────────────────────────
  const blob = await Packer.toBlob(doc);
  const downloadUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  const dateStr = new Date().toISOString().slice(0, 10);
  a.download = `${childName}_${overrides.caseNumber}_${dateStr}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(downloadUrl);
}