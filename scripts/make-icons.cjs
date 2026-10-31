const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// CRC32 table
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function createPng(width, height, getPixel) {
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowSize);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter: None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x, y, width, height);
      const pixelOffset = rowOffset + 1 + x * 4;
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a !== undefined ? a : 255;
    }
  }

  const compressedData = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8-bit depth
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0; // Deflate
  ihdrData[11] = 0; // Filter
  ihdrData[12] = 0; // No interlace

  const ihdrChunk = createChunk('IHDR', ihdrData);
  const idatChunk = createChunk('IDAT', compressedData);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(8 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const crc = crc32(chunk.subarray(4, 8 + len));
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

// Draw Tracker Growth app icon pattern
function appIconShader(x, y, w, h) {
  const nx = x / w;
  const ny = y / h;
  const cx = 0.5;
  const cy = 0.5;
  const dist = Math.sqrt((nx - cx) ** 2 + (ny - cy) ** 2);

  // Deep Obsidian background (#0B1020) with subtle radial glow
  let r = 11;
  let g = 16;
  let b = 32;

  // Center inner card (#111A2C)
  const isCard = nx >= 0.12 && nx <= 0.88 && ny >= 0.12 && ny <= 0.88;
  if (isCard) {
    r = 17;
    g = 26;
    b = 44;
  }

  // Neon glow around center
  if (dist < 0.45) {
    const glow = (1 - dist / 0.45) * 0.4;
    r = Math.min(255, Math.floor(r + 130 * glow));
    g = Math.min(255, Math.floor(g + 150 * glow));
    b = Math.min(255, Math.floor(b + 255 * glow));
  }

  // Upward growth vector path: (0.25, 0.7) -> (0.45, 0.55) -> (0.6, 0.6) -> (0.75, 0.3)
  const pts = [
    [0.25, 0.70],
    [0.45, 0.55],
    [0.60, 0.62],
    [0.75, 0.30]
  ];

  // Draw segments
  for (let i = 0; i < pts.length - 1; i++) {
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const d = distToSegment(nx, ny, p1[0], p1[1], p2[0], p2[1]);
    if (d < 0.04) {
      // Glow on line
      const alpha = 1 - d / 0.04;
      r = Math.min(255, Math.floor(130 + 125 * alpha));
      g = Math.min(255, Math.floor(150 + 105 * alpha));
      b = 255;
    }
  }

  // Draw arrowhead node at (0.75, 0.30)
  const headDist = Math.sqrt((nx - 0.75) ** 2 + (ny - 0.30) ** 2);
  if (headDist < 0.05) {
    // Emerald green (#35C99A)
    return [53, 201, 154, 255];
  }

  return [r, g, b, 255];
}

// 1200x630 OpenGraph / Twitter Card Shader
function shareCardShader(x, y, w, h) {
  const nx = x / w;
  const ny = y / h;

  // Obsidian background
  let r = 11;
  let g = 16;
  let b = 32;

  // Indigo header bar on top
  if (ny < 0.08) {
    r = 23;
    g = 35;
    b = 56;
  }

  // Subtle radial gradient from center-left
  const dist = Math.sqrt((nx - 0.35) ** 2 + (ny - 0.5) ** 2);
  if (dist < 0.6) {
    const glow = (1 - dist / 0.6) * 0.35;
    r = Math.min(255, Math.floor(r + 130 * glow));
    g = Math.min(255, Math.floor(g + 150 * glow));
    b = Math.min(255, Math.floor(b + 255 * glow));
  }

  // Emerald highlight accent bottom bar
  if (ny > 0.96) {
    return [53, 201, 154, 255];
  }

  return [r, g, b, 255];
}

function distToSegment(px, py, x1, y1, x2, y2) {
  const l2 = (x1 - x2) ** 2 + (y1 - y2) ** 2;
  if (l2 === 0) return Math.sqrt((px - x1) ** 2 + (py - y1) ** 2);
  let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.sqrt((px - (x1 + t * (x2 - x1))) ** 2 + (py - (y1 + t * (y2 - y1))) ** 2);
}

const publicDir = path.resolve(__dirname, '../public');
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

// 192x192 PWA Icon
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPng(192, 192, appIconShader));
// 512x512 PWA Icon
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPng(512, 512, appIconShader));
// Maskable icon with 15% safe padding
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPng(512, 512, appIconShader));
// Apple Touch Icon
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPng(180, 180, appIconShader));
// Open Graph 1200x630 Share preview image
fs.writeFileSync(path.join(publicDir, 'share-preview.png'), createPng(1200, 630, shareCardShader));

console.log('Successfully generated all PWA icons & share preview images in /public');
