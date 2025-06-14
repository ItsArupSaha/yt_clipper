const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const YTDlpWrap = require('yt-dlp-wrap').default;
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://yt-clipper.vercel.app',
    'https://yt-clipper-frontend.vercel.app'
  ],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Initialize yt-dlp
const ytDlp = new YTDlpWrap();

// Create temp directory if it doesn't exist
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

// Convert HH:MM:SS to seconds
function timeToSeconds(timeStr) {
  const [hours, minutes, seconds] = timeStr.split(':').map(Number);
  return hours * 3600 + minutes * 60 + seconds;
}

// Wait for file to exist and be ready
function waitForFile(filePath, timeout = 60000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const checkFile = () => {
      try {
        if (fs.existsSync(filePath)) {
          const stats = fs.statSync(filePath);
          if (stats.size > 0) {
            // Check if file is still being written
            const currentSize = stats.size;
            setTimeout(() => {
              const newStats = fs.statSync(filePath);
              if (newStats.size === currentSize) {
                resolve(true);
              } else {
                checkFile();
              }
            }, 1000);
          } else {
            checkFile();
          }
        } else if (Date.now() - startTime > timeout) {
          reject(new Error(`Timeout waiting for file: ${filePath}`));
        } else {
          setTimeout(checkFile, 1000);
        }
      } catch (error) {
        if (Date.now() - startTime > timeout) {
          reject(error);
        } else {
          setTimeout(checkFile, 1000);
        }
      }
    };
    checkFile();
  });
}

// Clean up files safely
async function cleanupFiles(files) {
  for (const file of files) {
    try {
      if (fs.existsSync(file)) {
        await new Promise((resolve) => {
          fs.unlink(file, (err) => {
            if (err) console.error(`Error deleting ${file}:`, err);
            resolve();
          });
        });
      }
    } catch (error) {
      console.error(`Error cleaning up ${file}:`, error);
    }
  }
}

// Routes
app.post('/api/trim', async (req, res) => {
  const { url, start, end, quality } = req.body;
  console.log('Received request:', { url, start, end, quality });

  if (!url || !start || !end) {
    console.error('Missing parameters:', { url, start, end });
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  const timestamp = Date.now();
  const outputPath = path.join(tempDir, `output_${timestamp}.mp4`);
  const trimmedPath = path.join(tempDir, `trimmed_${timestamp}.mp4`);
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
    console.log('Trimming video...', { startSeconds, endSeconds, duration, trimmedPath });
    
    await new Promise((resolve, reject) => {
      ffmpeg(outputPath)
        .setStartTime(startSeconds)
        .setDuration(duration)
        .output(trimmedPath)
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
    await waitForFile(trimmedPath);
    console.log('Trimmed file is ready');

    // Verify trimmed file exists and has content
    const trimmedStats = fs.statSync(trimmedPath);
    console.log('Trimmed file size:', trimmedStats.size, 'bytes');

    console.log('Sending file to client...');
    // Send the trimmed video
    res.download(trimmedPath, 'trimmed_video.mp4', async (err) => {
      if (err) {
        console.error('Error sending file:', err);
      }
      // Clean up files after sending
      await cleanupFiles([outputPath, trimmedPath, partPath]);
      console.log('Temporary files cleaned up');
    });

  } catch (error) {
    console.error('Error processing video:', error);
    // Clean up files on error
    await cleanupFiles([outputPath, trimmedPath, partPath]);
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

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log('Temp directory:', tempDir);
}); 