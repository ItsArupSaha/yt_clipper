// src/app/api/trim/route.ts
import { spawn } from "child_process";
import fs from "fs";
import { NextRequest, NextResponse } from "next/server";
import os from "os";
import path from "path";

const MAX_SEC = 15 * 60;
const toSeconds = (t: string) =>
  t
    .split(":")
    .reverse()
    .reduce((s, v, i) => s + Number(v) * 60 ** i, 0);

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.url || !body?.start || !body?.end)
    return NextResponse.json(
      { error: "Missing url/start/end" },
      { status: 400 }
    );

  const { url, start, end, quality = "720p" } = body as {
    url: string;
    start: string;
    end: string;
    quality?: string;
  };

  // Map quality to yt-dlp format string
  const formatMap = {
    "720p": "bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/best[height<=720][ext=mp4]/best",
    "480p": "bestvideo[height<=480][ext=mp4]+bestaudio[ext=m4a]/best[height<=480][ext=mp4]/best",
    "360p": "bestvideo[height<=360][ext=mp4]+bestaudio[ext=m4a]/best[height<=360][ext=mp4]/best",
  };

  const s = toSeconds(start),
    e = toSeconds(end);
  if (e <= s)
    return NextResponse.json({ error: "end must be > start" }, { status: 400 });
  if (e - s > MAX_SEC)
    return NextResponse.json(
      { error: "clip too long (max 15 min)" },
      { status: 400 }
    );

  const tmpFile = path.join(os.tmpdir(), `${Date.now()}.mp4`);
  const section = `${start}-${end}`;
  const args = [
    url,
    "-f",
    formatMap[quality as keyof typeof formatMap] || formatMap["720p"],
    "--download-sections",
    `*${section}`,
    "--merge-output-format",
    "mp4",
    "-o",
    tmpFile,
    "--no-part",
    "--max-filesize",
    "2G", // Limit file size to 2GB
    "--retries",
    "3", // Retry failed downloads
    "--fragment-retries",
    "3", // Retry failed fragments
    "--file-access-retries",
    "3", // Retry failed file access
  ];

  const proc = spawn("yt-dlp", args);
  proc.stderr.on("data", () => {}); // silence or log if you prefer

  return new Promise<NextResponse>((resolve) => {
    proc.on("close", (code) => {
      if (code !== 0 || !fs.existsSync(tmpFile))
        return resolve(
          NextResponse.json({ error: "yt-dlp failed" }, { status: 500 })
        );

      const buf = fs.readFileSync(tmpFile);
      fs.unlinkSync(tmpFile);
      resolve(
        new NextResponse(buf, {
          headers: {
            "Content-Type": "video/mp4",
            "Content-Disposition": 'attachment; filename="clip.mp4"',
          },
        })
      );
    });
  });
}

export function GET() {
  return NextResponse.json({ error: "Use POST" }, { status: 405 });
}
