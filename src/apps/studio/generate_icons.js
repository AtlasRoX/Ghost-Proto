const fs = require('fs');
const path = require('path');

// ICONDIR Header (6 bytes)
const iconDir = Buffer.alloc(6);
iconDir.writeUInt16LE(0, 0); // Reserved
iconDir.writeUInt16LE(1, 2); // Type: 1 = Icon
iconDir.writeUInt16LE(1, 4); // Count: 1 image

// ICONDIRENTRY (16 bytes)
const iconDirEntry = Buffer.alloc(16);
iconDirEntry.writeUInt8(16, 0);   // Width: 16
iconDirEntry.writeUInt8(16, 1);   // Height: 16
iconDirEntry.writeUInt8(0, 2);    // Colors: 0 (no palette)
iconDirEntry.writeUInt8(0, 3);    // Reserved: 0
iconDirEntry.writeUInt16LE(1, 4); // Color planes: 1
iconDirEntry.writeUInt16LE(32, 6); // Bits per pixel: 32
iconDirEntry.writeUInt32LE(1096, 8); // Size of image data (40 + 1024 + 32)
iconDirEntry.writeUInt32LE(22, 12); // Offset: 22 (6 + 16)

// BITMAPINFOHEADER (40 bytes)
const bmpHeader = Buffer.alloc(40);
bmpHeader.writeUInt32LE(40, 0);    // Size of this header
bmpHeader.writeInt32LE(16, 4);     // Width: 16
bmpHeader.writeInt32LE(32, 8);     // Height: 32 (height * 2 for XOR + AND masks)
bmpHeader.writeUInt16LE(1, 12);    // Planes: 1
bmpHeader.writeUInt16LE(32, 14);   // Bits per pixel: 32
bmpHeader.writeUInt32LE(0, 16);    // Compression: 0 (BI_RGB)
bmpHeader.writeUInt32LE(1024, 20); // Image size: 1024 (16 * 16 * 4)
bmpHeader.writeInt32LE(0, 24);     // X pixels/meter
bmpHeader.writeInt32LE(0, 28);     // Y pixels/meter
bmpHeader.writeUInt32LE(0, 32);    // Colors used: 0
bmpHeader.writeUInt32LE(0, 36);    // Colors important: 0

// Pixel data: 256 pixels * 4 bytes = 1024 bytes (solid black with full alpha: 0, 0, 0, 255)
const pixels = Buffer.alloc(1024);
for (let i = 0; i < 256; i++) {
  pixels.writeUInt8(0, i * 4);     // B
  pixels.writeUInt8(0, i * 4 + 1); // G
  pixels.writeUInt8(0, i * 4 + 2); // R
  pixels.writeUInt8(255, i * 4 + 3); // A
}

// AND mask: 16 * 16 / 8 = 32 bytes (fully opaque, all 0s)
const andMask = Buffer.alloc(32);

// Combine everything
const icoBuffer = Buffer.concat([iconDir, iconDirEntry, bmpHeader, pixels, andMask]);

const destDir = path.join(__dirname, 'src-tauri', 'icons');
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

fs.writeFileSync(path.join(destDir, 'icon.ico'), icoBuffer);
console.log('✓ Successfully generated a valid modern 32-bit DIB icon.ico');
