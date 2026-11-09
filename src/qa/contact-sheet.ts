import {readFileSync, writeFileSync} from 'node:fs';
import {PNG} from 'pngjs';

const thumbW = 480;
const thumbH = 270;
const pad = 16;
const labelH = 28;

export const stitchContactSheet = (
  items: {id: string; path: string}[],
  outputPath: string,
): void => {
  const cols = Math.min(3, Math.max(1, items.length));
  const rows = Math.ceil(items.length / cols);
  const sheetW = cols * thumbW + (cols + 1) * pad;
  const sheetH = rows * (thumbH + labelH) + (rows + 1) * pad;

  const out = new PNG({width: sheetW, height: sheetH});
  for (let y = 0; y < sheetH; y++) {
    for (let x = 0; x < sheetW; x++) {
      const i = (y * sheetW + x) << 2;
      out.data[i] = 10;
      out.data[i + 1] = 9;
      out.data[i + 2] = 9;
      out.data[i + 3] = 255;
    }
  }

  items.forEach((item, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    const ox = pad + col * (thumbW + pad);
    const oy = pad + row * (thumbH + labelH + pad);
    const src = PNG.sync.read(readFileSync(item.path));
    const scale = Math.min(thumbW / src.width, thumbH / src.height);
    const dw = Math.round(src.width * scale);
    const dh = Math.round(src.height * scale);
    const dx = ox + Math.floor((thumbW - dw) / 2);
    const dy = oy;

    blitScale(out, src, dx, dy, dw, dh);
    drawLabel(out, item.id, ox + 8, oy + thumbH + 4);
  });

  writeFileSync(outputPath, PNG.sync.write(out));
};

const blitScale = (
  dest: PNG,
  src: PNG,
  dx: number,
  dy: number,
  dw: number,
  dh: number,
): void => {
  for (let y = 0; y < dh; y++) {
    for (let x = 0; x < dw; x++) {
      const sx = Math.floor((x / dw) * src.width);
      const sy = Math.floor((y / dh) * src.height);
      const si = (sy * src.width + sx) << 2;
      const di = ((dy + y) * dest.width + (dx + x)) << 2;
      if (di < 0 || dx + x >= dest.width || dy + y >= dest.height) {
        continue;
      }
      dest.data[di] = src.data[si]!;
      dest.data[di + 1] = src.data[si + 1]!;
      dest.data[di + 2] = src.data[si + 2]!;
      dest.data[di + 3] = 255;
    }
  }
};

const drawLabel = (out: PNG, text: string, x: number, y: number): void => {
  const glyphs = text.slice(0, 24);
  for (let i = 0; i < glyphs.length; i++) {
    const px = x + i * 10;
    for (let dy = 0; dy < 12; dy++) {
      for (let dx = 0; dx < 8; dx++) {
        const di = ((y + dy) * out.width + (px + dx)) << 2;
        if (px + dx >= out.width || y + dy >= out.height) {
          continue;
        }
        out.data[di] = 240;
        out.data[di + 1] = 230;
        out.data[di + 2] = 220;
        out.data[di + 3] = 255;
      }
    }
  }
};
