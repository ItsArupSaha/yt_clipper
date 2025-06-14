// scripts/ytcheck.js
import { spawnSync } from "child_process";

const r = spawnSync("yt-dlp", ["--version"], {
  encoding: "utf8"
});

console.log(r.stdout.trim() || r.stderr);
