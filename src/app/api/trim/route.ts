// src/app/api/trim/route.ts
import { spawn } from "child_process";
import fs from "fs";
import { NextRequest, NextResponse } from "next/server";
import os from "os";
import path from "path";

// Maximum allowed clip duration in seconds (15 minutes)
const MAX_SEC = 15 * 60;

/**
 * Converts a time string (HH:MM:SS) to seconds
 * @param t Time string in HH:MM:SS format
 * @returns Number of seconds
 */
const toSeconds = (t: string) =>
  t
    .split(":")
    .reverse()
    .reduce((s, v, i) => s + Number(v) * 60 ** i, 0);

/**
 * API Route Handler for Video Trimming
 * 
 * This endpoint handles the video trimming process using yt-dlp:
 * 1. Validates input parameters
 * 2. Downloads the specified section of the video
 * 3. Returns the trimmed video as a downloadable file
 * 
 * @param req NextRequest object containing the request data
 * @returns NextResponse with the trimmed video or error message
 */
export async function POST(req: NextRequest) {
  // Parse and validate request body
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

  // Map quality options to yt-dlp format strings
  const formatMap = {
    "720p": "bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/best[height<=720][ext=mp4]/best",
    "480p": "bestvideo[height<=480][ext=mp4]+bestaudio[ext=m4a]/best[height<=480][ext=mp4]/best",
    "360p": "bestvideo[height<=360][ext=mp4]+bestaudio[ext=m4a]/best[height<=360][ext=mp4]/best",
  };

  // Validate time range
  const s = toSeconds(start),
    e = toSeconds(end);
  if (e <= s)
    return NextResponse.json({ error: "end must be > start" }, { status: 400 });
  if (e - s > MAX_SEC)
    return NextResponse.json(
      { error: "clip too long (max 15 min)" },
      { status: 400 }
    );

  // Create temporary file path for the trimmed video
  const tmpFile = path.join(os.tmpdir(), `${Date.now()}.mp4`);
  const section = `${start}-${end}`;

  // Configure yt-dlp command arguments
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

  // Spawn yt-dlp process
  const proc = spawn("yt-dlp", args);
  proc.stderr.on("data", () => {}); // silence or log if you prefer

  // Handle process completion
  return new Promise<NextResponse>((resolve) => {
    proc.on("close", (code) => {
      if (code !== 0 || !fs.existsSync(tmpFile))
        return resolve(
          NextResponse.json({ error: "yt-dlp failed" }, { status: 500 })
        );

      // Read the trimmed video file
      const buf = fs.readFileSync(tmpFile);
      // Clean up temporary file
      fs.unlinkSync(tmpFile);
      // Return video with appropriate headers
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
