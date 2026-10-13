import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const require = createRequire(import.meta.url);
const sharp = require('sharp');
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const output = resolve(root, 'assets/media');
const video = resolve(output, 'together-coast.mp4');
const poster = resolve(output, 'together-coast.svg');
const width = 768;
const height = 432;
const fps = 24;
const duration = 12;
const cues = [
  'The path follows the water.',
  'We can hear the waves below.',
  'The light changes by the minute.',
  "Let’s stay here a little longer.",
];

function wave(y, time, offset, length = 540) {
  let d = `M ${offset} ${y.toFixed(2)}`;
  for (let x = 0; x <= length; x += 8) {
    const pointY = y + Math.sin(x * 0.033 + time * 1.8 + y * 0.12) * 2.2
      + Math.sin(x * 0.073 - time * 1.1) * 0.8;
    d += ` L ${(offset + x).toFixed(1)} ${pointY.toFixed(2)}`;
  }
  return d;
}

function scene(time) {
  const cue = cues[Math.min(3, Math.floor(time / 3))];
  const light = 0.22 + 0.13 * Math.sin(time * 0.55);
  const gullX = 484 + time * 5.5;
  const gullY = 109 + Math.sin(time * 1.5) * 3;
  const waves = Array.from({ length: 13 }, (_, i) => {
    const y = 208 + i * 10.5;
    return `<path d="${wave(y, time, 246 + (i % 3) * 19, 520)}" fill="none" stroke="${i % 3 === 0 ? '#e9e9e5' : '#b5b7b7'}" stroke-width="${i % 3 === 0 ? 1.5 : 0.75}" opacity="${(0.28 + i * 0.022).toFixed(2)}"/>`;
  }).join('');
  const glints = Array.from({ length: 10 }, (_, i) => {
    const x = 515 + i * 23 + Math.sin(time * 1.4 + i) * 5;
    const y = 194 + i * 7.6;
    return `<path d="M ${x.toFixed(1)} ${y.toFixed(1)} l ${8 + i % 4} -1.4" stroke="#fafaf6" stroke-width="1.4" opacity="${(0.3 + light).toFixed(2)}"/>`;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="sky" x2="0" y2="1"><stop stop-color="#f5f5f1"/><stop offset="1" stop-color="#d7d9d8"/></linearGradient>
    <linearGradient id="sea" x2="0" y2="1"><stop stop-color="#9c9fa0"/><stop offset="1" stop-color="#d5d6d3"/></linearGradient>
    <radialGradient id="light"><stop stop-color="#fff" stop-opacity="0.85"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
    <clipPath id="water"><path d="M 228 184 Q 440 174 768 176 L 768 432 L 353 432 Q 254 319 228 184 Z"/></clipPath>
  </defs>
  <rect width="768" height="432" fill="url(#sky)"/>
  <ellipse cx="${(560 + time * 2).toFixed(1)}" cy="132" rx="220" ry="130" fill="url(#light)" opacity="${light.toFixed(2)}"/>
  <path d="M 0 192 Q 130 184 240 188 Q 326 175 429 181 Q 542 174 768 177 L 768 432 H 0 Z" fill="url(#sea)"/>
  <path d="M 0 193 Q 128 180 227 189 Q 305 175 414 181 Q 574 173 768 177" fill="none" stroke="#838686" stroke-width="1.3"/>
  <g clip-path="url(#water)">${waves}${glints}</g>
  <path d="M 0 173 C 95 161 176 166 242 180 C 285 190 311 203 335 216 C 241 220 155 237 0 248 Z" fill="#909392"/>
  <path d="M 0 174 C 99 165 164 169 225 181 C 261 187 292 196 319 207" fill="none" stroke="#757979" stroke-width="2"/>
  <path d="M 0 222 C 116 200 199 207 266 227 C 313 242 342 270 367 304 C 395 345 431 383 480 432 H 0 Z" fill="#656968"/>
  <path d="M 0 253 C 87 223 175 221 231 240 C 296 261 315 302 341 328 C 357 344 389 373 434 432 H 0 Z" fill="#797d7b"/>
  <path d="M 0 296 C 111 249 172 253 216 265 C 252 276 279 294 299 320 C 327 358 349 393 372 432 H 0 Z" fill="#a1a4a0"/>
  <path d="M 0 325 C 91 280 163 275 207 285 C 250 296 270 322 283 350 C 296 377 305 407 315 432 H 0 Z" fill="#d2d3cd"/>
  <path d="M 0 343 C 81 298 140 291 189 298 C 227 304 248 323 260 345 C 275 376 282 402 288 432 H 0 Z" fill="#ecece6"/>
  <path d="M 0 351 C 75 309 133 300 178 305 C 208 309 231 324 245 349 C 258 374 267 406 272 432" fill="none" stroke="#b6b9b3" stroke-width="2"/>
  <path d="M 0 286 C 91 253 153 251 209 263 C 254 275 286 307 308 346" fill="none" stroke="#454948" stroke-width="1.5" opacity="0.55"/>
  <g fill="none" stroke="#494e4d" stroke-linecap="round" opacity="0.75">
    <path d="M 41 258 l -7 -11 m 7 11 l 8 -14 M 70 249 l -4 -13 m 4 13 l 8 -10 M 113 247 l -5 -11 m 5 11 l 6 -14 M 178 258 l -4 -13 m 4 13 l 8 -11" stroke-width="1.2"/>
    <path d="M 14 306 l -5 -15 m 5 15 l 6 -10 M 88 280 l -3 -16 m 3 16 l 7 -13 M 162 283 l -3 -13 m 3 13 l 7 -11" stroke-width="1"/>
  </g>
  <g transform="translate(${gullX.toFixed(1)} ${gullY.toFixed(1)})" fill="none" stroke="#5b5f5e" stroke-width="1.5" stroke-linecap="round">
    <path d="M -16 2 Q -8 -5 0 1 Q 8 -6 16 0"/>
    <path d="M 42 17 Q 48 12 54 17 Q 60 11 66 15" stroke-width="1"/>
  </g>
  <path d="M 42 38 H 102" stroke="#5a5f5d" stroke-width="2"/>
  <text x="42" y="60" font-family="Arial, Helvetica, sans-serif" font-size="10" letter-spacing="3.2" fill="#454b49">TOGETHER</text>
  <text x="42" y="105" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="500" fill="#303635">${cue}</text>
  <text x="42" y="125" font-family="Arial, Helvetica, sans-serif" font-size="10" letter-spacing="1.8" fill="#626866">A MOMENT BY THE SEA</text>
  <text x="727" y="403" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-size="10" letter-spacing="1.7" fill="#f6f5ef">${String(Math.floor(time / 3) + 1).padStart(2, '0')} / 04</text>
</svg>`;
}

await mkdir(output, { recursive: true });
await writeFile(poster, scene(0));

const ffmpeg = spawn('/opt/homebrew/bin/ffmpeg', [
  '-hide_banner', '-loglevel', 'error', '-y',
  '-f', 'rawvideo', '-pixel_format', 'rgb24', '-video_size', `${width}x${height}`,
  '-framerate', String(fps), '-i', 'pipe:0',
  '-c:v', 'libx264', '-preset', 'medium', '-crf', '29',
  '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', video,
], { stdio: ['pipe', 'inherit', 'inherit'] });

try {
  for (let frame = 0; frame < duration * fps; frame++) {
    const pixels = await sharp(Buffer.from(scene(frame / fps))).removeAlpha().raw().toBuffer();
    if (!ffmpeg.stdin.write(pixels)) await new Promise(resolveDrain => ffmpeg.stdin.once('drain', resolveDrain));
  }
  ffmpeg.stdin.end();
  const code = await new Promise((resolveExit, reject) => {
    ffmpeg.once('error', reject);
    ffmpeg.once('close', resolveExit);
  });
  if (code !== 0) throw new Error(`ffmpeg exited with code ${code}`);
} catch (error) {
  ffmpeg.stdin.destroy();
  throw error;
}

console.log(`Wrote ${poster} and ${video}`);
