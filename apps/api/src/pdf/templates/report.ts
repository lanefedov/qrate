import { PDFDocument, PDFFont, PDFPage, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import * as fs from 'fs';
import * as path from 'path';

const PAGE_WIDTH = 595.28; // A4
const PAGE_HEIGHT = 841.89;
const MARGIN_LEFT = 50;
const MARGIN_RIGHT = 50;
const MARGIN_TOP = 60;
const MARGIN_BOTTOM = 50;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;

const COLOR_BLACK = rgb(0, 0, 0);
const COLOR_GRAY = rgb(0.4, 0.4, 0.4);
const COLOR_LIGHT_GRAY = rgb(0.85, 0.85, 0.85);
const COLOR_TABLE_HEADER = rgb(0.15, 0.25, 0.45);
const COLOR_WHITE = rgb(1, 1, 1);
const COLOR_ACCENT = rgb(0.1, 0.3, 0.6);
const COLOR_TOTAL_BG = rgb(0.92, 0.95, 1);

const fmt = new Intl.NumberFormat('ru-RU', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatMoney(n: number): string {
  return fmt.format(n) + ' ₽';
}

function formatPercent(n: number): string {
  return fmt.format(n) + ' %';
}

function formatDate(d: Date | string): string {
  const date = d instanceof Date ? d : new Date(d);
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export interface ReportWorker {
  name: string;
  salary: number;
  hours: number;
  fundHours: number;
}

export interface ReportBreakdown {
  materialsCost: number;
  equipmentCost: number;
  additionalCost: number;
  otherCost: number;
  laborCost: number;
  laborWithCoefficients: number;
  travelCost: number;
  estimateCost: number;
  subtotal: number;
  overheadAmount: number;
  totalNic: number;
}

export interface ReportCustomer {
  fullName: string;
  organization: string;
  position?: string;
  phone?: string;
  email?: string;
}

export interface ReportData {
  orderNumber: string;
  orderName: string;
  testType: string;
  requestDate: Date | string;
  customer: ReportCustomer;
  input: {
    materialsCost: number;
    equipmentCost: number;
    additionalCost: number;
    otherCost: number;
    workers: ReportWorker[];
    bonusRate: number;
    taxRate: number;
    travelCost: number;
    estimateCost: number;
    overheadRate: number;
  };
  breakdown: ReportBreakdown;
  nic: number;
}

class PdfBuilder {
  private doc!: PDFDocument;
  private font!: PDFFont;
  private page!: PDFPage;
  private y = PAGE_HEIGHT - MARGIN_TOP;

  async init(): Promise<void> {
    this.doc = await PDFDocument.create();
    this.doc.registerFontkit(fontkit);

    const fontPath = path.join(__dirname, '..', 'fonts', 'Roboto-Regular.ttf');
    const fontBytes = fs.readFileSync(fontPath);
    this.font = await this.doc.embedFont(fontBytes);

    this.addPage();
  }

  private addPage(): void {
    this.page = this.doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    this.y = PAGE_HEIGHT - MARGIN_TOP;
  }

  private ensureSpace(needed: number): void {
    if (this.y - needed < MARGIN_BOTTOM) {
      this.drawFooter();
      this.addPage();
    }
  }

  private text(
    str: string,
    x: number,
    size: number,
    color = COLOR_BLACK,
    bold = false,
  ): void {
    this.page.drawText(str, { x, y: this.y, size, font: this.font, color });
    if (bold) {
      this.page.drawText(str, {
        x: x + 0.35,
        y: this.y,
        size,
        font: this.font,
        color,
      });
    }
  }

  private textAt(
    str: string,
    x: number,
    y: number,
    size: number,
    color = COLOR_BLACK,
    bold = false,
  ): void {
    this.page.drawText(str, { x, y, size, font: this.font, color });
    if (bold) {
      this.page.drawText(str, {
        x: x + 0.35,
        y,
        size,
        font: this.font,
        color,
      });
    }
  }

  private textWidth(str: string, size: number): number {
    return this.font.widthOfTextAtSize(str, size);
  }

  private line(
    y: number,
    color = COLOR_LIGHT_GRAY,
    thickness = 0.5,
  ): void {
    this.page.drawLine({
      start: { x: MARGIN_LEFT, y },
      end: { x: PAGE_WIDTH - MARGIN_RIGHT, y },
      thickness,
      color,
    });
  }

  private rect(
    x: number,
    y: number,
    w: number,
    h: number,
    color = COLOR_LIGHT_GRAY,
  ): void {
    this.page.drawRectangle({ x, y, width: w, height: h, color });
  }

  private drawSectionTitle(title: string): void {
    this.ensureSpace(30);
    this.y -= 8;
    this.line(this.y + 14, COLOR_ACCENT, 1.5);
    this.text(title, MARGIN_LEFT, 11, COLOR_ACCENT, true);
    this.y -= 18;
  }

  private drawKeyValue(label: string, value: string): void {
    this.ensureSpace(16);
    this.text(label, MARGIN_LEFT + 8, 9.5, COLOR_GRAY);
    this.text(value, MARGIN_LEFT + 200, 9.5, COLOR_BLACK);
    this.y -= 15;
  }

  private drawTableRow(
    cells: string[],
    colWidths: number[],
    size: number,
    color = COLOR_BLACK,
    bold = false,
    bgColor?: ReturnType<typeof rgb>,
  ): void {
    const rowHeight = 18;
    this.ensureSpace(rowHeight + 2);

    if (bgColor) {
      this.rect(MARGIN_LEFT, this.y - 4, CONTENT_WIDTH, rowHeight, bgColor);
    }

    let x = MARGIN_LEFT + 4;
    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i] ?? '';
      const colW = colWidths[i] ?? 80;

      const isNumericCol = i > 0 && cells.length > 2;
      if (isNumericCol) {
        const tw = this.textWidth(cell, size);
        this.textAt(cell, x + colW - tw - 8, this.y, size, color, bold);
      } else {
        this.textAt(cell, x, this.y, size, color, bold);
      }
      x += colW;
    }
    this.y -= rowHeight;
  }

  private drawFooter(): void {
    const footerY = 25;
    const footerText = `Дата формирования: ${formatDate(new Date())}  |  Система QRate v1.0`;
    this.line(footerY + 10, COLOR_LIGHT_GRAY, 0.5);
    this.textAt(footerText, MARGIN_LEFT, footerY, 7, COLOR_GRAY);
  }

  async build(data: ReportData): Promise<Uint8Array> {
    await this.init();

    // ── Title ──
    const title = 'Расчёт начальной (максимальной) цены испытаний';
    const titleW = this.textWidth(title, 15);
    this.text(title, (PAGE_WIDTH - titleW) / 2, 15, COLOR_BLACK, true);
    this.y -= 18;

    const subtitle = 'Система QRate — Центр коммерческого космоса';
    const subW = this.textWidth(subtitle, 9);
    this.text(subtitle, (PAGE_WIDTH - subW) / 2, 9, COLOR_GRAY);
    this.y -= 24;

    // ── Order info ──
    this.drawSectionTitle('Информация о заказе');
    this.drawKeyValue('№ заказа:', data.orderNumber);
    this.drawKeyValue('Наименование:', data.orderName);
    this.drawKeyValue('Вид испытаний:', data.testType);
    this.drawKeyValue('Дата обращения:', formatDate(data.requestDate));
    this.drawKeyValue('Дата расчёта:', formatDate(new Date()));

    // ── Customer ──
    this.drawSectionTitle('Заказчик');
    this.drawKeyValue('ФИО:', data.customer.fullName);
    this.drawKeyValue('Организация:', data.customer.organization);
    if (data.customer.position) {
      this.drawKeyValue('Должность:', data.customer.position);
    }
    const contacts = [data.customer.phone, data.customer.email]
      .filter(Boolean)
      .join(', ');
    if (contacts) {
      this.drawKeyValue('Контакты:', contacts);
    }

    // ── Input parameters ──
    this.drawSectionTitle('Входные параметры');
    const paramCols = [310, CONTENT_WIDTH - 310];
    this.drawTableRow(
      ['Параметр', 'Значение'],
      paramCols,
      9,
      COLOR_WHITE,
      true,
      COLOR_TABLE_HEADER,
    );
    const params: [string, string][] = [
      ['Затраты на материалы (Зм)', formatMoney(data.input.materialsCost)],
      ['Затраты на оборудование (Зоб)', formatMoney(data.input.equipmentCost)],
      ['Дополнительные затраты (Здоп)', formatMoney(data.input.additionalCost)],
      ['Прочие затраты (Зпр)', formatMoney(data.input.otherCost)],
      ['Коэффициент доплат/премий (Кф)', formatPercent(data.input.bonusRate)],
      ['Коэффициент начислений (Кн)', formatPercent(data.input.taxRate)],
      ['Командировочные расходы (Зкр)', formatMoney(data.input.travelCost)],
      ['Сметные расходы (Зсм)', formatMoney(data.input.estimateCost)],
      ['Коэффициент накладных (Ктр)', formatPercent(data.input.overheadRate)],
    ];
    params.forEach(([label, value], i) => {
      const bg = i % 2 === 0 ? undefined : rgb(0.96, 0.96, 0.96);
      this.drawTableRow([label, value], paramCols, 9, COLOR_BLACK, false, bg);
    });

    // ── Workers ──
    this.drawSectionTitle('Исполнители');
    const wCols = [30, 160, 90, 70, 70, 75];
    this.drawTableRow(
      ['№', 'ФИО', 'Зарплата (₽)', 'Время (ч)', 'Фонд (ч)', 'Затраты (₽)'],
      wCols,
      8.5,
      COLOR_WHITE,
      true,
      COLOR_TABLE_HEADER,
    );
    data.input.workers.forEach((w, i) => {
      const cost = w.salary * w.hours / w.fundHours;
      const bg = i % 2 === 0 ? undefined : rgb(0.96, 0.96, 0.96);
      this.drawTableRow(
        [
          String(i + 1),
          w.name,
          formatMoney(w.salary),
          fmt.format(w.hours),
          fmt.format(w.fundHours),
          formatMoney(cost),
        ],
        wCols,
        9,
        COLOR_BLACK,
        false,
        bg,
      );
    });

    // ── Breakdown ──
    this.drawSectionTitle('Детализация расчёта');
    const bCols = [310, CONTENT_WIDTH - 310];
    this.drawTableRow(
      ['Статья затрат', 'Сумма (₽)'],
      bCols,
      9,
      COLOR_WHITE,
      true,
      COLOR_TABLE_HEADER,
    );
    const breakdownRows: [string, number][] = [
      ['Материалы', data.breakdown.materialsCost],
      ['Оборудование', data.breakdown.equipmentCost],
      ['Доп. затраты', data.breakdown.additionalCost],
      ['Прочие', data.breakdown.otherCost],
      ['Трудозатраты', data.breakdown.laborCost],
      ['Трудозатраты с коэффициентами', data.breakdown.laborWithCoefficients],
      ['Командировочные', data.breakdown.travelCost],
      ['Сметные', data.breakdown.estimateCost],
      ['Промежуточный итог', data.breakdown.subtotal],
      ['Накладные расходы', data.breakdown.overheadAmount],
    ];
    breakdownRows.forEach(([label, value], i) => {
      const bg = i % 2 === 0 ? undefined : rgb(0.96, 0.96, 0.96);
      this.drawTableRow(
        [label, formatMoney(value)],
        bCols,
        9,
        COLOR_BLACK,
        false,
        bg,
      );
    });

    // ── Total NIC (highlighted) ──
    this.ensureSpace(30);
    this.y -= 2;
    this.drawTableRow(
      ['ИТОГО НИЦ', formatMoney(data.breakdown.totalNic)],
      bCols,
      11,
      COLOR_BLACK,
      true,
      COLOR_TOTAL_BG,
    );

    // ── Footer on last page ──
    this.drawFooter();

    return this.doc.save();
  }
}

export async function buildReport(data: ReportData): Promise<Uint8Array> {
  const builder = new PdfBuilder();
  return builder.build(data);
}
