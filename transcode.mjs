/**
 * transcode.mjs
 * Converts the HEVC (H.265) birthday video to H.264 (AVC) + AAC
 * so it plays in all major browsers (Chrome, Firefox, Edge, Safari, mobile).
 *
 * Input:  src/video/VID_20260910_074203_744.mp4  (hvc1/HEVC — audio-only in Chrome)
 * Output: src/video/VID_20260910_074203_744.mp4  (avc1/H.264 — universal support)
 *
 * The file is backed up as VID_20260910_074203_744_hevc_backup.mp4 first.
 */

import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import ffmpeg from "fluent-ffmpeg";
import { existsSync, copyFileSync } from "fs";
import { resolve } from "path";

const INPUT  = resolve("src/video/VID_20260910_074203_744.mp4");
const BACKUP = resolve("src/video/VID_20260910_074203_744_hevc_backup.mp4");
const OUTPUT = resolve("src/video/VID_20260910_074203_744_h264.mp4");

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

// Backup the original HEVC file before overwriting
if (!existsSync(BACKUP)) {
  console.log("📦 Backing up original HEVC file…");
  copyFileSync(INPUT, BACKUP);
  console.log(`   → ${BACKUP}`);
}

console.log("🎬 Transcoding HEVC → H.264 (browser-compatible)…");
console.log(`   Input : ${INPUT}`);
console.log(`   Output: ${OUTPUT}`);

ffmpeg(INPUT)
  .videoCodec("libx264")        // H.264 — universally supported in browsers
  .audioCodec("aac")            // AAC — universally supported in browsers
  .outputOptions([
    "-crf 23",                  // quality (18=high, 28=low) — 23 is a good default
    "-preset fast",             // encoding speed vs compression tradeoff
    "-movflags +faststart",     // move moov atom to front for faster web playback
    "-pix_fmt yuv420p",         // ensures widest browser compatibility
    "-vf scale=trunc(iw/2)*2:trunc(ih/2)*2", // ensure even dimensions (required by H.264)
  ])
  .save(OUTPUT)
  .on("start", (cmd) => console.log("\n▶  ffmpeg command:\n  ", cmd, "\n"))
  .on("progress", (p) => {
    process.stdout.write(`\r   Progress: ${p.percent?.toFixed(1) ?? "?"}%  (${p.timemark})`);
  })
  .on("error", (err) => {
    console.error("\n\n❌ Transcoding failed:", err.message);
    process.exit(1);
  })
  .on("end", () => {
    console.log("\n\n✅ Transcoding complete!");
    console.log(`   Output saved to: ${OUTPUT}`);
    console.log("\nNext step: rename the output file to replace the original:");
    console.log("  Move-Item -Force src/video/VID_20260910_074203_744_h264.mp4 src/video/VID_20260910_074203_744.mp4");
  });
