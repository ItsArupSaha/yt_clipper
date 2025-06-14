const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const YTDlpWrap = require('yt-dlp-wrap').default;
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');  // Regular fs for sync operations
const fsPromises = require('fs').promises;  // Promises version for async operations
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// CORS configuration
app.use(cors({
  origin: true, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept']
}));

app.use(express.json());

// Initialize yt-dlp
const ytDlp = new YTDlpWrap();

// Create temp directory if it doesn't exist
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Convert HH:MM:SS to seconds
function timeToSeconds(timeStr) {
  const [hours, minutes, seconds] = timeStr.split(':').map(Number);
  return hours * 3600 + minutes * 60 + seconds;
}

// Wait for file to exist and be ready
async function waitForFile(filePath, timeout = 60000) {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    try {
      const stats = await fsPromises.stat(filePath);
      if (stats.size > 0) {
        // Wait a bit more to ensure the file is completely written
        await new Promise(resolve => setTimeout(resolve, 1000));
        const newStats = await fsPromises.stat(filePath);
        if (newStats.size === stats.size) {
          return true;
        }
      }
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  throw new Error(`Timeout waiting for file: ${filePath}`);
}

// Clean up files safely
async function cleanupFiles(files) {
  for (const file of files) {
    try {
      await fsPromises.unlink(file);
      console.log(`Deleted file: ${file}`);
    } catch (error) {
      console.error(`Error deleting file ${file}:`, error);
    }
  }
}

// Routes
app.post('/api/trim', async (req, res) => {
  const { url, start, end, quality } = req.body;
  console.log('Received trim request:', { url, start, end, quality });

  if (!url || !start || !end) {
    return res.status(400).json({
      error: "Missing required parameters",
      details: "URL, start time, and end time are required"
    });
  }

  const outputPath = path.join(tempDir, `trimmed_${Date.now()}.mp4`);
  const partPath = `${outputPath}.part`;

  try {
    // Convert time strings to seconds
    const startSeconds = timeToSeconds(start);
    const endSeconds = timeToSeconds(end);
    const duration = endSeconds - startSeconds;

    if (duration <= 0) {
      return res.status(400).json({ error: 'End time must be greater than start time' });
    }

    console.log('Output path:', outputPath);

    // Download video with yt-dlp
    console.log('Getting video info...');
    const videoInfo = await ytDlp.getVideoInfo(url);
    console.log('Available formats:', videoInfo.formats.map(f => ({ height: f.height, format_id: f.format_id })));
    
    const format = videoInfo.formats.find(f => f.height === parseInt(quality)) || videoInfo.formats[0];
    console.log('Selected format:', format);

    console.log('Downloading video...');
    await ytDlp.exec([
      url,
      '-f', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',  // Better format selection
      '--merge-output-format', 'mp4',
      '--no-check-certificate',  // Skip certificate validation
      '--prefer-insecure',  // Prefer insecure connections
      '--no-warnings',  // Suppress warnings
      '--no-playlist',  // Download only the video, not the playlist
      '--extractor-args', 'youtube:player_client=android',  // Use mobile client
      '-o', outputPath
    ]);
    console.log('Download complete');

    // Wait for the file to be ready
    console.log('Waiting for file to be ready...');
    await waitForFile(outputPath);
    console.log('File is ready');

    // Verify file exists and has content
    const stats = fs.statSync(outputPath);
    console.log('File size:', stats.size, 'bytes');

    // Trim video with ffmpeg
    console.log('Trimming video...', { startSeconds, endSeconds, duration, outputPath });
    
    await new Promise((resolve, reject) => {
      ffmpeg(outputPath)
        .setStartTime(startSeconds)
        .setDuration(duration)
        .output(outputPath)
        .on('start', (commandLine) => {
          console.log('FFmpeg command:', commandLine);
        })
        .on('progress', (progress) => {
          console.log('Processing: ' + Math.floor(progress.percent) + '% done');
        })
        .on('end', () => {
          console.log('Trimming complete');
          resolve();
        })
        .on('error', (err) => {
          console.error('FFmpeg error:', err);
          reject(err);
        })
        .run();
    });

    // Wait for trimmed file to be ready
    console.log('Waiting for trimmed file to be ready...');
    await waitForFile(outputPath);
    console.log('Trimmed file is ready');

    // Verify trimmed file exists and has content
    const trimmedStats = fs.statSync(outputPath);
    console.log('Trimmed file size:', trimmedStats.size, 'bytes');

    console.log('Sending file to client...');
    // Send the trimmed video
    res.download(outputPath, 'trimmed_video.mp4', async (err) => {
      if (err) {
        console.error('Error sending file:', err);
      }
      // Clean up files after sending
      await cleanupFiles([outputPath, partPath]);
      console.log('Temporary files cleaned up');
    });

  } catch (error) {
    console.error('Error processing video:', error);
    // Clean up files on error
    await cleanupFiles([outputPath, partPath]);
    res.status(500).json({ 
      error: 'Error processing video',
      details: error.message 
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Test yt-dlp endpoint
app.get('/test-ytdlp', async (req, res) => {
  try {
    const version = await ytDlp.getVersion();
    res.json({ 
      status: 'ok',
      version: version,
      message: 'yt-dlp is working correctly'
    });
  } catch (error) {
    console.error('yt-dlp test error:', error);
    res.status(500).json({ 
      status: 'error',
      error: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: "Internal server error",
    details: err.message
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log('Temp directory:', tempDir);
}); 