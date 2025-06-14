const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');

// Function to download a file
function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {}); // Delete the file if there's an error
      reject(err);
    });
  });
}

async function main() {
  try {
    console.log('Starting build process...');

    // Create temp directory if it doesn't exist
    const tempDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Install npm dependencies first
    console.log('Installing npm dependencies...');
    execSync('npm install', { stdio: 'inherit' });
    console.log('Dependencies installed successfully');

    // Download yt-dlp based on environment
    if (process.env.NODE_ENV === 'production') {
      console.log('Installing yt-dlp for production...');
      execSync('curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp && chmod a+rx /usr/local/bin/yt-dlp', { stdio: 'inherit' });
      console.log('yt-dlp installed successfully in production');
    } else {
      console.log('Downloading yt-dlp for development...');
      const ytDlpPath = path.join(__dirname, 'yt-dlp.exe');
      await downloadFile('https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe', ytDlpPath);
      console.log('yt-dlp downloaded successfully for development');
    }

    console.log('Build completed successfully!');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

main(); 