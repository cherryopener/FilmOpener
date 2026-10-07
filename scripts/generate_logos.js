const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function createPng(width, height, color1, color2, label) {
  // Simple PNG encoder using Node.js built-in zlib
  function crc32(buf) {
    let crc = 0 ^ -1;
    for (let i = 0; i < buf.length; i++) {
      let byte = buf[i];
      for (let j = 0; j < 8; j++) {
        let bit = (crc ^ byte) & 1;
        crc = (crc >>> 1) ^ (bit ? 0xedb88320 : 0);
        byte >>>= 1;
      }
    }
    return (crc ^ -1) >>> 0;
  }

  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);
    const crc = crc32(Buffer.concat([typeBuf, data]));
    crcBuf.writeUInt32BE(crc, 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  // Header
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type 6: RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdr = chunk('IHDR', ihdrData);

  // Raw image data with scanline filters (filter byte 0 per line)
  const [r1, g1, b1] = hexToRgb(color1);
  const [r2, g2, b2] = hexToRgb(color2);

  const rawRows = [];
  for (let y = 0; y < height; y++) {
    const row = Buffer.alloc(1 + width * 4);
    row[0] = 0; // filter type 0
    for (let x = 0; x < width; x++) {
      const idx = 1 + x * 4;
      // create a clean stylized pill/badge gradient
      const isStripe = x < width * 0.28;
      const r = isStripe ? r2 : r1;
      const g = isStripe ? g2 : g1;
      const b = isStripe ? b2 : b1;
      row[idx] = r;
      row[idx + 1] = g;
      row[idx + 2] = b;
      row[idx + 3] = 255;
    }
    rawRows.push(row);
  }

  const rawData = Buffer.concat(rawRows);
  const compressed = zlib.deflateSync(rawData);
  const idat = chunk('IDAT', compressed);
  const iend = chunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  return [
    parseInt(clean.substring(0, 2), 16),
    parseInt(clean.substring(2, 4), 16),
    parseInt(clean.substring(4, 6), 16)
  ];
}

const logos = [
  { name: 'kodak_logo.png', c1: '#FFB700', c2: '#ED0000', label: 'KODAK' },
  { name: 'fuji_logo.png', c1: '#01916D', c2: '#EE1337', label: 'FUJIFILM' },
  { name: 'agfa_logo.png', c1: '#CF2E2E', c2: '#333333', label: 'AGFA' },
  { name: 'ilford_logo.png', c1: '#1A1A1A', c2: '#D0021B', label: 'ILFORD' },
  { name: 'cinestill_logo.png', c1: '#00A8B5', c2: '#FF2E4C', label: 'CINESTILL' },
  { name: 'lomography_logo.png', c1: '#E60067', c2: '#00B4D8', label: 'LOMOGRAPHY' },
  { name: 'foma_logo.png', c1: '#0D3B66', c2: '#64B5F6', label: 'FOMA' },
  { name: 'rollei_logo.png', c1: '#C41E3A', c2: '#2D3142', label: 'ROLLEI' },
  { name: 'default_logo.png', c1: '#475569', c2: '#94A3B8', label: 'FILM' }
];

const outDir = path.join(__dirname, '../public/logos');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

logos.forEach(logo => {
  const buf = createPng(140, 64, logo.c1, logo.c2, logo.label);
  fs.writeFileSync(path.join(outDir, logo.name), buf);
  console.log(`Generated logo: ${logo.name}`);
});
