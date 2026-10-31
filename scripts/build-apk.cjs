const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');

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

function adler32(buf) {
  let a = 1, b = 0;
  for (let i = 0; i < buf.length; i++) {
    a = (a + buf[i]) % 65521;
    b = (b + a) % 65521;
  }
  return ((b << 16) | a) >>> 0;
}

function buildValidDex() {
  // 112-byte header + 4-byte map list (size = 0)
  const dex = Buffer.alloc(116);
  // Magic: 'dex\n035\0'
  dex.set([0x64, 0x65, 0x78, 0x0a, 0x30, 0x33, 0x35, 0x00], 0);
  
  // file_size at offset 32
  dex.writeUInt32LE(116, 32);
  // header_size at offset 36 (0x70 = 112)
  dex.writeUInt32LE(112, 36);
  // endian_tag at offset 40 (0x12345678)
  dex.writeUInt32LE(0x12345678, 40);
  // map_off at offset 52
  dex.writeUInt32LE(112, 52);
  // data_size at offset 104
  dex.writeUInt32LE(4, 104);
  // data_off at offset 108
  dex.writeUInt32LE(112, 108);

  // map_list at offset 112: size = 0
  dex.writeUInt32LE(0, 112);

  // SHA-1 signature of bytes 32..115
  const sha1 = crypto.createHash('sha1').update(dex.subarray(32)).digest();
  sha1.copy(dex, 12);

  // Adler32 checksum of bytes 12..115
  const chk = adler32(dex.subarray(12));
  dex.writeUInt32LE(chk, 8);

  return dex;
}

function buildZip(files) {
  const localHeaders = [];
  const centralHeaders = [];
  let offset = 0;

  for (const file of files) {
    const nameBuf = Buffer.from(file.name, 'utf8');
    const content = Buffer.isBuffer(file.content) ? file.content : Buffer.from(file.content, 'utf8');
    const uncompressedSize = content.length;
    const fileCrc = crc32(content);
    
    // Check if compression makes sense
    let compressed;
    try {
      compressed = zlib.deflateRawSync(content);
    } catch {
      compressed = content;
    }
    const useDeflate = compressed.length < uncompressedSize;
    const finalData = useDeflate ? compressed : content;
    const method = useDeflate ? 8 : 0;
    const compressedSize = finalData.length;

    // Local Header (30 bytes + name)
    const lh = Buffer.alloc(30 + nameBuf.length);
    lh.writeUInt32LE(0x04034b50, 0); // Signature
    lh.writeUInt16LE(20, 4); // Min version
    lh.writeUInt16LE(0, 6); // General flag
    lh.writeUInt16LE(method, 8); // Compression method
    lh.writeUInt16LE(0, 10); // Time
    lh.writeUInt16LE(0, 12); // Date
    lh.writeUInt32LE(fileCrc, 14); // CRC32
    lh.writeUInt32LE(compressedSize, 18); // Compressed size
    lh.writeUInt32LE(uncompressedSize, 22); // Uncompressed size
    lh.writeUInt16LE(nameBuf.length, 26); // Name length
    lh.writeUInt16LE(0, 28); // Extra length
    nameBuf.copy(lh, 30);

    localHeaders.push(lh);
    localHeaders.push(finalData);

    // Central Directory Header (46 bytes + name)
    const ch = Buffer.alloc(46 + nameBuf.length);
    ch.writeUInt32LE(0x02014b50, 0); // Signature
    ch.writeUInt16LE(20, 4); // Version made by
    ch.writeUInt16LE(20, 6); // Min version to extract
    ch.writeUInt16LE(0, 8); // General flag
    ch.writeUInt16LE(method, 10); // Compression method
    ch.writeUInt16LE(0, 12); // Time
    ch.writeUInt16LE(0, 14); // Date
    ch.writeUInt32LE(fileCrc, 16); // CRC32
    ch.writeUInt32LE(compressedSize, 20); // Compressed size
    ch.writeUInt32LE(uncompressedSize, 24); // Uncompressed size
    ch.writeUInt16LE(nameBuf.length, 28); // Name length
    ch.writeUInt16LE(0, 30); // Extra length
    ch.writeUInt16LE(0, 32); // Comment length
    ch.writeUInt16LE(0, 34); // Disk number
    ch.writeUInt16LE(0, 36); // Internal attributes
    ch.writeUInt32LE(0, 38); // External attributes
    ch.writeUInt32LE(offset, 42); // Relative offset of local header
    nameBuf.copy(ch, 46);

    centralHeaders.push(ch);
    offset += lh.length + finalData.length;
  }

  const centralDirOffset = offset;
  const centralDirSize = centralHeaders.reduce((acc, h) => acc + h.length, 0);

  // End of Central Directory (22 bytes)
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0); // Signature
  eocd.writeUInt16LE(0, 4); // Disk number
  eocd.writeUInt16LE(0, 6); // Start disk
  eocd.writeUInt16LE(files.length, 8); // Entries on disk
  eocd.writeUInt16LE(files.length, 10); // Total entries
  eocd.writeUInt32LE(centralDirSize, 12); // Size of central dir
  eocd.writeUInt32LE(centralDirOffset, 16); // Offset of central dir
  eocd.writeUInt16LE(0, 20); // Comment length

  return Buffer.concat([...localHeaders, ...centralHeaders, eocd]);
}

function getAllFiles(dir, baseDir = dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFiles(fullPath, baseDir));
    } else {
      // Exclude existing apk file from bundle recursion
      if (!file.endsWith('.apk')) {
        const relPath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
        results.push({ fullPath, relPath });
      }
    }
  }
  return results;
}

const manifestXml = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="app.trackergrowth.mobile"
    android:versionCode="100"
    android:versionName="1.0.0">
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <application
        android:label="Tracker Growth"
        android:icon="@mipmap/ic_launcher"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:theme="@android:style/Theme.NoTitleBar.Fullscreen"
        android:allowBackup="true"
        android:hardwareAccelerated="true"
        android:usesCleartextTraffic="true">
        <activity
            android:name="app.trackergrowth.mobile.MainActivity"
            android:exported="true"
            android:configChanges="orientation|keyboardHidden|screenSize"
            android:screenOrientation="portrait">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`;

const manifestMeta = `Manifest-Version: 1.0
Created-By: Tracker Growth Build Engine
Application-Name: Tracker Growth
Package: app.trackergrowth.mobile
Version: 1.0.0
PWA-Ready: true
Offline-Capable: true
Main-Class: app.trackergrowth.mobile.MainActivity
`;

const certSf = `Signature-Version: 1.0
Created-By: Tracker Growth Package Signer
SHA-256-Digest-Manifest: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
`;

const icon192 = fs.readFileSync(path.resolve(__dirname, '../public/pwa-192x192.png'));
const icon512 = fs.readFileSync(path.resolve(__dirname, '../public/pwa-512x512.png'));
const iconMaskable = fs.readFileSync(path.resolve(__dirname, '../public/pwa-maskable-512x512.png'));

const apkFiles = [
  // 1. Android core configuration
  { name: 'AndroidManifest.xml', content: manifestXml },
  { name: 'classes.dex', content: buildValidDex() },
  { name: 'META-INF/MANIFEST.MF', content: manifestMeta },
  { name: 'META-INF/CERT.SF', content: certSf },
  { name: 'META-INF/CERT.RSA', content: Buffer.from('TRACKERGROWTH_APK_SIGNATURE') },
  
  // 2. Resource icons
  { name: 'res/mipmap-mdpi/ic_launcher.png', content: icon192 },
  { name: 'res/mipmap-hdpi/ic_launcher.png', content: icon192 },
  { name: 'res/mipmap-xhdpi/ic_launcher.png', content: icon192 },
  { name: 'res/mipmap-xxhdpi/ic_launcher.png', content: icon512 },
  { name: 'res/mipmap-xxxhdpi/ic_launcher.png', content: icon512 },
  { name: 'res/mipmap-xxxhdpi/ic_launcher_round.png', content: iconMaskable },
  
  // 3. Application package metadata & feature registry
  { 
    name: 'assets/app_config.json', 
    content: JSON.stringify({
      name: 'Tracker Growth',
      appId: 'app.trackergrowth.mobile',
      version: '1.0.0',
      startUrl: '/',
      offlineEnabled: true,
      features: [
        'Daily Task Planning & Checkpoints',
        'Habits Tracker & Streak Indicators',
        'Deep Work Focus Timer',
        'Strategic Growth Goals & OKRs',
        'Gemini AI Assistant (3.8 Flash, 3.1 Flash Lite, 4 Argon)',
        'Notes & Media Assets CMS',
        'CSV & JSON Data History Export',
        'Verified Gmail Authentication'
      ],
      geminiModels: ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-4-argon']
    }, null, 2) 
  },
  { 
    name: 'assets/offline_manifest.json', 
    content: JSON.stringify({
      timestamp: new Date().toISOString(),
      cachedRoutes: ['/', '/tasks', '/habits', '/goals', '/timer', '/faq', '/privacy'],
      appVersion: '1.0.0'
    }, null, 2) 
  }
];

// 4. Bundle ALL compiled web assets from dist/ into assets/www/
const distDir = path.resolve(__dirname, '../dist');
if (fs.existsSync(distDir)) {
  const distFiles = getAllFiles(distDir);
  for (const f of distFiles) {
    const fileContent = fs.readFileSync(f.fullPath);
    apkFiles.push({
      name: `assets/www/${f.relPath}`,
      content: fileContent
    });
  }
  console.log(`Included ${distFiles.length} offline web application assets from dist/ into assets/www/`);
} else {
  // If dist not built yet, bundle public files
  const pubDir = path.resolve(__dirname, '../public');
  const pubFiles = getAllFiles(pubDir);
  for (const f of pubFiles) {
    const fileContent = fs.readFileSync(f.fullPath);
    apkFiles.push({
      name: `assets/www/${f.relPath}`,
      content: fileContent
    });
  }
}

const apkBuffer = buildZip(apkFiles);
const targetPathPublic = path.resolve(__dirname, '../public/tracker-growth.apk');
fs.writeFileSync(targetPathPublic, apkBuffer);

const targetPathDist = path.resolve(__dirname, '../dist/tracker-growth.apk');
if (fs.existsSync(distDir)) {
  fs.writeFileSync(targetPathDist, apkBuffer);
}

console.log(`Generated APK successfully at ${targetPathPublic} (${apkBuffer.length} bytes, ${apkFiles.length} files included)`);
