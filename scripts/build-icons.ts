/**
 * Icon pipeline.
 *
 * Masks the browser-tab icon to a circle so it matches the portrait in the navigation,
 * which has been round since the photograph was added. A square avatar beside a round
 * one is the kind of small disagreement that reads as unfinished.
 *
 * Run with `npm run icons`. Idempotent: masking an already-circular image to the same
 * circle changes nothing, so re-running is safe.
 *
 * Deliberately does NOT round `apple-icon.png`.
 *
 * iOS applies its own mask to the home-screen icon, and it composites the image over
 * black rather than over the wallpaper. A transparent corner therefore renders as a
 * black corner inside Apple's own rounded square, which looks worse than the square
 * image Apple expects. Apple's guidance is to supply a full-bleed opaque square, so
 * that is what stays on disk.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import sharp from "sharp";

const root = resolve(process.cwd());
const iconPath = resolve(root, "src/app/icon.png");
const faviconPath = resolve(root, "public/favicon.ico");

/** A filled circle the size of the canvas, used as an alpha mask via `dest-in`. */
function circle(size: number) {
  return Buffer.from(
    `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">` +
      `<circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#fff"/></svg>`,
  );
}

async function roundedPng(source: Buffer, size: number) {
  return sharp(source)
    .resize(size, size, { fit: "cover" })
    .composite([{ input: circle(size), blend: "dest-in" }])
    .png()
    .toBuffer();
}

/**
 * Wrap a PNG in a single-image ICO container.
 *
 * `sharp` cannot write .ico, but the format permits PNG payloads, which every browser
 * that still asks for /favicon.ico understands. The alternative was leaving a square
 * .ico as the fallback for the round .png, so the icon shape depended on which file a
 * given browser happened to request.
 */
function icoFromPng(png: Buffer, size: number) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(1, 4); // one image

  const entry = Buffer.alloc(16);
  entry.writeUInt8(size >= 256 ? 0 : size, 0); // width, 0 means 256
  entry.writeUInt8(size >= 256 ? 0 : size, 1); // height
  entry.writeUInt8(0, 2); // palette size, 0 for truecolour
  entry.writeUInt8(0, 3); // reserved
  entry.writeUInt16LE(1, 4); // colour planes
  entry.writeUInt16LE(32, 6); // bits per pixel
  entry.writeUInt32LE(png.length, 8);
  entry.writeUInt32LE(header.length + entry.length, 12); // offset to the payload

  return Buffer.concat([header, entry, png]);
}

/** Wrapped rather than top level: this repo's `tsx` emits CJS, which has no TLA. */
async function main() {
  const source = readFileSync(iconPath);
  const { width, height } = await sharp(source).metadata();
  console.log(`source  src/app/icon.png ${width}x${height}`);

  const tabIcon = await roundedPng(source, 128);
  writeFileSync(iconPath, tabIcon);
  console.log(`wrote   src/app/icon.png       128x128 round, ${tabIcon.length} bytes`);

  const faviconPng = await roundedPng(source, 32);
  const ico = icoFromPng(faviconPng, 32);
  writeFileSync(faviconPath, ico);
  console.log(`wrote   public/favicon.ico     32x32 round, ${ico.length} bytes`);

  console.log("\napple-icon.png left square on purpose: iOS masks it itself and composites");
  console.log("over black, so transparent corners would render as black corners.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
