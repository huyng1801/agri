import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import fontkit from '@pdf-lib/fontkit';
import { PDFDocument, type PDFFont } from 'pdf-lib';

const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const PAGE_MARGIN = 72;
const FONT_FILE = 'NotoSans-Regular.ttf';

let cachedFontBytes: Promise<Uint8Array> | null = null;

export async function buildUnicodePdf(lines: string[], options?: { titleSize?: number; bodySize?: number }) {
  const titleSize = options?.titleSize ?? 18;
  const bodySize = options?.bodySize ?? 11;
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);
  const font = await pdfDoc.embedFont(await loadFontBytes(), { subset: true });
  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - PAGE_MARGIN;

  for (const [index, line] of lines.entries()) {
    const fontSize = index === 0 ? titleSize : bodySize;
    const wrapped = wrapText(line, font, fontSize, PAGE_WIDTH - PAGE_MARGIN * 2);

    for (const segment of wrapped) {
      if (y < PAGE_MARGIN) {
        page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
        y = PAGE_HEIGHT - PAGE_MARGIN;
      }

      page.drawText(segment, {
        x: PAGE_MARGIN,
        y,
        size: fontSize,
        font
      });
      y -= fontSize + 8;
    }

    y -= index === 0 ? 10 : 2;
  }

  return Buffer.from(await pdfDoc.save());
}

async function loadFontBytes() {
  if (!cachedFontBytes) {
    const fontPath = resolveFontPath();
    cachedFontBytes = readFile(fontPath);
  }
  return cachedFontBytes;
}

function resolveFontPath() {
  const candidates = [
    resolve(process.cwd(), 'assets', 'fonts', FONT_FILE),
    resolve(process.cwd(), 'backend', 'assets', 'fonts', FONT_FILE),
    resolve(__dirname, '../../../assets/fonts', FONT_FILE),
    resolve(__dirname, '../../../../assets/fonts', FONT_FILE)
  ];

  const match = candidates.find((candidate) => existsSync(candidate));
  if (!match) {
    throw new Error(`Không tìm thấy font PDF Unicode: ${FONT_FILE}`);
  }

  return match;
}

function wrapText(text: string, font: PDFFont, fontSize: number, maxWidth: number) {
  const paragraphs = text.split(/\r?\n/);
  const lines: string[] = [];

  for (const paragraph of paragraphs) {
    if (!paragraph.trim()) {
      lines.push('');
      continue;
    }

    let current = '';
    for (const word of paragraph.split(/\s+/)) {
      const candidate = current ? `${current} ${word}` : word;
      if (font.widthOfTextAtSize(candidate, fontSize) <= maxWidth) {
        current = candidate;
        continue;
      }

      if (current) lines.push(current);

      if (font.widthOfTextAtSize(word, fontSize) <= maxWidth) {
        current = word;
        continue;
      }

      const broken = breakLongWord(word, font, fontSize, maxWidth);
      lines.push(...broken.slice(0, -1));
      current = broken[broken.length - 1] ?? '';
    }

    if (current) lines.push(current);
  }

  return lines.length ? lines : [''];
}

function breakLongWord(word: string, font: PDFFont, fontSize: number, maxWidth: number) {
  const result: string[] = [];
  let current = '';

  for (const char of word) {
    const candidate = current + char;
    if (font.widthOfTextAtSize(candidate, fontSize) <= maxWidth) {
      current = candidate;
      continue;
    }
    if (current) result.push(current);
    current = char;
  }

  if (current) result.push(current);
  return result;
}
