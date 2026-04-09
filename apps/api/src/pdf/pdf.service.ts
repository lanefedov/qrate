import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { buildReport, ReportData } from './templates/report';

@Injectable()
export class PdfService {
  private readonly uploadsDir = path.join(process.cwd(), 'uploads', 'pdfs');

  constructor() {
    fs.mkdirSync(this.uploadsDir, { recursive: true });
  }

  async generateReport(data: ReportData, orderId: string): Promise<string> {
    const pdfBytes = await buildReport(data);
    const filePath = path.join(this.uploadsDir, `${orderId}.pdf`);
    fs.writeFileSync(filePath, pdfBytes);
    return filePath;
  }

  getFilePath(orderId: string): string {
    return path.join(this.uploadsDir, `${orderId}.pdf`);
  }
}
