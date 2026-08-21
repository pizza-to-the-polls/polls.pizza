/**
 * ensure-sourcemap-links.mjs
 *
 * Ensures every compiled .js file under dist/www/build/ that has a sibling
 * .map file also contains a `//# sourceMappingURL=<file>.map` comment.
 *
 * This closes the gap where Stencil sometimes emits .map files without the
 * corresponding sourceMappingURL comment, causing Bugsnag to report
 * "Source mapping failed: Missing source map link."
 *
 * Idempotent — safe to run regardless of build state.
 *
 * Usage: node scripts/ensure-sourcemap-links.mjs
 */

import { appendFileSync, existsSync, readFileSync, readdirSync } from "node:fs";
import { extname, join } from "node:path";

const BUILD_DIR = join(process.cwd(), "dist", "www", "build");

const files = readdirSync(BUILD_DIR);
const jsFiles = files.filter(f => extname(f) === ".js");

let patched = 0;
let skipped = 0;

for (const jsFile of jsFiles) {
  const jsPath = join(BUILD_DIR, jsFile);
  const mapFile = `${jsFile}.map`;
  const mapPath = join(BUILD_DIR, mapFile);

  if (!existsSync(mapPath)) {
    continue;
  }

  const content = readFileSync(jsPath, "utf8");

  if (/sourceMappingURL=/.test(content)) {
    skipped++;
    continue;
  }

  appendFileSync(jsPath, `\n//# sourceMappingURL=${mapFile}`);
  patched++;
}

console.log(`[ensure-sourcemap-links] patched=${patched} skipped=${skipped} (already had comment) total-js=${jsFiles.length}`);
