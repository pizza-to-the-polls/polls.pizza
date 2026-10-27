#!/usr/bin/env node
/**
 * set-cache-headers.mjs
 *
 * Applies Cache-Control metadata to the objects that decide whether a client
 * can boot the app: the HTML entry points, the service-worker kill switch, and
 * the `/build` assets.
 *
 * Why: the site previously served HTML and JS with **no** Cache-Control header,
 * so browsers applied heuristic (implicit) caching. A client could run an old
 * `build/app.js` whose component-chunk manifest referenced content-hashed
 * chunk files that the next deploy had deleted with `aws s3 sync --delete`.
 * That mismatch is the class of failure behind #156 / #115.
 *
 * Rules (first match wins):
 *   - `*.html`, `sw.js`            -> no-cache, must-revalidate
 *     HTML must always revalidate so it cannot reference deleted chunks.
 *     `sw.js` is a kill switch and must never be served stale.
 *   - `build/<name>-<hash>.<js|css>` -> public, max-age=31536000, immutable
 *     Filenames contain a content hash, so the bytes can never change.
 *   - everything else in `build/`  -> no-cache, must-revalidate
 *     IMPORTANT: `app.js`, `app.esm.js`, `app.css` and the `*.entry.js`
 *     chunks are NOT content-hashed. Marking those immutable would pin the
 *     app shell in every client for a year, so they must revalidate.
 *
 * Everything outside these paths (images, videos, PDFs) is left untouched:
 * their names are stable and they are not part of the boot path.
 *
 * Implementation note: S3 cannot mutate metadata in place, so each object is
 * copied onto itself server-side (`copy-object --metadata-directive REPLACE`).
 * Because REPLACE discards all existing metadata, Content-Type must be set
 * explicitly from the file extension or objects would be served as
 * `binary/octet-stream`.
 *
 * Usage: node scripts/set-cache-headers.mjs <s3-bucket> [--dry-run]
 */
import { execFileSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { extname, join, relative, sep } from "node:path";

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const BUCKET = args.find(arg => !arg.startsWith("--"));

if (!BUCKET) {
  console.error("Usage: node scripts/set-cache-headers.mjs <s3-bucket> [--dry-run]");
  process.exit(1);
}

const BUILD_DIR = join(process.cwd(), "dist", "www");

const NO_CACHE = "no-cache, must-revalidate";
const IMMUTABLE = "public, max-age=31536000, immutable";

// Stencil emits content-hashed chunks as `<name>-<hash>.js` where <hash> is 8
// characters of [A-Za-z0-9_-] (observed: `index-BH3xwe5X.js`,
// `active-router-BPjx9MQW.js`, `p-ac0da039.entry.js`).
const HASHED_BUILD_ASSET_RE = /-[A-Za-z0-9_-]{8}\.(?:js|css)$/;

const rulesFor = key => {
  if (key === "sw.js" || key.endsWith(".html") || key.endsWith(".htm")) {
    return NO_CACHE;
  }
  if (key.startsWith("build/")) {
    return HASHED_BUILD_ASSET_RE.test(key) ? IMMUTABLE : NO_CACHE;
  }
  return null; // untouched
};

const CONTENT_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".htm": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".map": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".pdf": "application/pdf",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml",
  ".wasm": "application/wasm",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
};

const walk = dir => {
  const entries = readdirSync(dir, { withFileTypes: true });
  const keys = [];
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      keys.push(...walk(fullPath));
    } else {
      keys.push(relative(BUILD_DIR, fullPath).split(sep).join("/"));
    }
  }
  return keys;
};

const contentTypeFor = key => CONTENT_TYPES[extname(key).toLowerCase()] || "application/octet-stream";

const keys = walk(BUILD_DIR).sort();
const targets = keys.map(key => ({ key, cacheControl: rulesFor(key) })).filter(t => t.cacheControl !== null);

console.log(`[set-cache-headers] ${targets.length} object(s) to update in s3://${BUCKET}${DRY_RUN ? " (dry run)" : ""}`);

let updated = 0;
let failed = 0;

for (const { key, cacheControl } of targets) {
  if (DRY_RUN) {
    console.log(`  ${key} -> ${cacheControl}`);
    continue;
  }
  try {
    execFileSync(
      "aws",
      [
        "s3api",
        "copy-object",
        "--bucket",
        BUCKET,
        "--key",
        key,
        "--copy-source",
        `${BUCKET}/${key}`,
        "--metadata-directive",
        "REPLACE",
        "--cache-control",
        cacheControl,
        "--content-type",
        contentTypeFor(key),
        "--acl",
        "public-read",
      ],
      { stdio: ["ignore", "ignore", "pipe"] },
    );
    updated++;
  } catch (err) {
    // Non-fatal: the content is already uploaded by `aws s3 sync`; a metadata
    // failure must not fail the deploy.
    failed++;
    const detail = err.stderr ? err.stderr.toString().trim().split("\n")[0] : err.message;
    console.error(`[set-cache-headers] Failed on ${key}: ${detail}`);
  }
}

console.log(`[set-cache-headers] Done. updated=${updated} failed=${failed}${DRY_RUN ? " (dry run)" : ""}`);

// Report failures but do not fail the deploy: cache metadata is best-effort.
process.exit(0);
