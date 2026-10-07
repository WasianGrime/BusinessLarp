// Copies the Chrome extension files into the Vite build output and stamps
// the manifest with the package version. Run via `npm run build:extension`.
import { cpSync, readFileSync, writeFileSync } from "node:fs";

const OUT = "dist-extension";
const { version } = JSON.parse(readFileSync("package.json", "utf8"));

cpSync("extension", OUT, { recursive: true });
const manifestPath = `${OUT}/manifest.json`;
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
manifest.version = version;
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");

console.log(`Chrome extension v${version} ready in ${OUT}/ (load it via chrome://extensions → Load unpacked)`);
