import { PDFDocument } from 'pdf-lib';
import { buildUnicodePdf } from './unicode-pdf';

describe('buildUnicodePdf', () => {
  it('creates a readable PDF buffer for Vietnamese text', async () => {
    const buffer = await buildUnicodePdf([
      'HTXONLINE - Hóa đơn dịch vụ',
      'Hợp tác xã: Mỹ Thọ',
      'Trạng thái: Đã thanh toán'
    ]);

    expect(buffer.subarray(0, 5).toString()).toBe('%PDF-');

    const document = await PDFDocument.load(buffer);
    expect(document.getPageCount()).toBeGreaterThan(0);
  });
});
