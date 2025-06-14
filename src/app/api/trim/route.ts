// src/app/api/trim/route.ts
import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://yt-clipper-backend.onrender.com' 
    : 'http://localhost:3001');

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
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url, start, end, quality } = body;

    console.log('Sending request to backend:', { url, start, end, quality });

    const response = await fetch(`${BACKEND_URL}/api/trim`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ url, start, end, quality }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Backend error:', errorData);
      throw new Error(errorData.details || 'Failed to process video');
    }

    // Get the video data
    const videoData = await response.arrayBuffer();

    // Return the video with appropriate headers
    return new NextResponse(videoData, {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": "attachment; filename=trimmed_video.mp4",
      },
    });
  } catch (error) {
    console.error("Error in trim API:", error);
    return NextResponse.json(
      { 
        error: "Failed to process video",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export function GET() {
  return NextResponse.json({ error: "Use POST" }, { status: 405 });
}
