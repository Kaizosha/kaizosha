import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const source = process.argv[2];
if (!source) throw new Error('Pass the native SekaiWorld.sekaiatlas path.');
const output = resolve(process.argv[3] || fileURLToPath(new URL('./atlas-data.mjs', import.meta.url)));
const bytes = readFileSync(source);
if (bytes.subarray(0, 8).toString('ascii') !== 'SEKAIAT\0' || bytes.readUInt32LE(8) !== 1) {
  throw new Error('Expected a version 1 Sekai atlas.');
}
const headerSize = bytes.readUInt32LE(12);
const particleCount = bytes.readUInt32LE(16);
const featureCount = bytes.readUInt32LE(20);
const segmentCount = bytes.readUInt32LE(36);
const metadataLength = Number(bytes.readBigUInt64LE(40));
const pointsOffset = Number(bytes.readBigUInt64LE(48));
const linesOffset = Number(bytes.readBigUInt64LE(80));
if (headerSize !== 128 || pointsOffset + particleCount * 16 > bytes.length || linesOffset + segmentCount * 12 > bytes.length) {
  throw new Error('The native atlas is truncated.');
}
const metadata = JSON.parse(bytes.subarray(headerSize, headerSize + metadataLength));
const latitude = packed => packed / 65535 * 180 - 90;
const longitude = packed => packed / 65535 * 360 - 180;
const vector = (lat, lon) => {
  const phi = lat * Math.PI / 180;
  const lambda = lon * Math.PI / 180;
  return [Math.cos(phi) * Math.cos(lambda), Math.sin(phi), Math.cos(phi) * Math.sin(lambda)].map(value => Number(value.toFixed(5)));
};
const points = Array.from({ length: Math.min(4096, particleCount) }, (_, index) => {
  const offset = pointsOffset + index * 16;
  return vector(latitude(bytes.readUInt16LE(offset)), longitude(bytes.readUInt16LE(offset + 2)));
});
const lines = [];
for (let index = 0; index < segmentCount; index++) {
  const offset = linesOffset + index * 12;
  if (bytes[offset + 2] !== 0) continue;
  const lat1 = latitude(bytes.readUInt16LE(offset + 4));
  const lon1 = longitude(bytes.readUInt16LE(offset + 6));
  const lat2 = latitude(bytes.readUInt16LE(offset + 8));
  const lon2 = longitude(bytes.readUInt16LE(offset + 10));
  const longitudeDistance = Math.min(Math.abs(lon2 - lon1), 360 - Math.abs(lon2 - lon1));
  const length = Math.hypot(lat2 - lat1, longitudeDistance * Math.cos((lat1 + lat2) / 2 * Math.PI / 180));
  if (length >= 0.7) lines.push([...vector(lat1, lon1), ...vector(lat2, lon2)]);
}
const information = {
  source: metadata.source,
  sourceVersion: metadata.sourceVersion,
  sourceSHA256: metadata.sourceSHA256,
  atlasSHA256: createHash('sha256').update(bytes).digest('hex'),
  license: 'Public domain',
  credit: 'Made with Natural Earth',
  sourceURL: 'https://www.naturalearthdata.com/downloads/10m-cultural-vectors/',
  termsURL: 'https://www.naturalearthdata.com/about/terms-of-use/',
  nativeParticleCount: particleCount,
  nativeFeatureCount: featureCount,
  previewParticleCount: points.length,
  previewBoundarySegmentCount: lines.length,
  sampling: 'First 4096 native particles in atlas rank order. Actual LOD 0 boundary segments with length at least 0.7 degrees.'
};
writeFileSync(output, `export const atlasInformation = ${JSON.stringify(information)};\nexport const atlasPoints = ${JSON.stringify(points)};\nexport const atlasLines = ${JSON.stringify(lines)};\n`);
writeFileSync(join(dirname(output), 'atlas-source.json'), JSON.stringify(information, null, 2) + '\n');
console.log(`${points.length} native preview points and ${lines.length} coarse boundary segments.`);
