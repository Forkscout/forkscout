// generate-icons.js — Creates simple solid-color PNG icons for the extension
import { deflateSync } from "zlib";
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "icons");
mkdirSync(OUT_DIR, { recursive: true });

function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) {
    c ^= b;
    for (let i = 0; i < 8; i++) c = (c >>> 1) ^ (c & 1 ? 0xedb88320 : 0);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const t = Buffer.from(type, "ascii");
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([t, data])));
  return Buffer.concat([len, t, data, crcBuf]);
}

function makePNG(size, r, g, b) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0);
  ihdrData.writeUInt32BE(size, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 2; // RGB color type

  // Draw a simple rounded-ish icon: purple bg + white lightning bolt "⚡"
  const raw = Buffer.alloc(size * (1 + size * 3));
  for (let y = 0; y < size; y++) {
    const off = y * (1 + size * 3);
    raw[off] = 0; // filter: None
    for (let x = 0; x < size; x++) {
      // Rounded rect mask
      const margin = size * 0.18;
      const inRect =
        x >= margin && x < size - margin && y >= margin && y < size - margin;
      // Simple lightning bolt shape (scaled to size)
      const cx = x / size,
        cy = y / size;
      const bolt =
        (cx > 0.35 && cx < 0.65 && cy > 0.15 && cy < 0.5 && cx < cy + 0.2) ||
        (cx > 0.3 && cx < 0.6 && cy > 0.45 && cy < 0.85 && cx > cy - 0.2);
      let pr = r,
        pg = g,
        pb = b;
      if (bolt && inRect) {
        pr = 255;
        pg = 255;
        pb = 255;
      } else if (!inRect) {
        pr = 16;
        pg = 16;
        pb = 18;
      }
      raw[off + 1 + x * 3] = pr;
      raw[off + 1 + x * 3 + 1] = pg;
      raw[off + 1 + x * 3 + 2] = pb;
    }
  }

  return Buffer.concat([
    sig,
    chunk("IHDR", ihdrData),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0))
  ]);
}

// Forkscout purple: #7c6af7 = rgb(124, 106, 247)
const [R, G, B] = [124, 106, 247];

for (const size of [16, 32, 48, 128]) {
  const png = makePNG(size, R, G, B);
  writeFileSync(join(OUT_DIR, `icon${size}.png`), png);
  console.log(`✓ icon${size}.png`);
}
