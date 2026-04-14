import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { buildReport, ReportData } from './templates/report';
import { sanitizeForLog, toLogMessage } from '../common/logging.utils';

@Injectable()
export class PdfService {
  private readonly uploadsDir = path.join(process.cwd(), 'uploads', 'pdfs');
  private readonly logger = new Logger(PdfService.name);

  constructor() {
    fs.mkdirSync(this.uploadsDir, { recursive: true });
  }

  async generateReport(data: ReportData, orderId: string): Promise<string> {
    this.logger.log(
      toLogMessage('pdf.generate.started', {
        orderId,
        report: sanitizeForLog({
          orderNumber: data.orderNumber,
          orderName: data.orderName,
          nic: data.nic,
        }),
      }),
    );

    const pdfBytes = await buildReport(data);
    const filePath = path.join(this.uploadsDir, `${orderId}.pdf`);
    fs.writeFileSync(filePath, pdfBytes);

    this.logger.log(
      toLogMessage('pdf.generate.completed', {
        orderId,
        filePath,
        bytes: pdfBytes.length,
      }),
    );

    return filePath;
  }

  getFilePath(orderId: string): string {
    return path.join(this.uploadsDir, `${orderId}.pdf`);
  }
}
