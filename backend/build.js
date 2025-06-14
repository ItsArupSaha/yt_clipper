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

    // Download yt-dlp
    console.log('Downloading yt-dlp...');
    const ytDlpPath = path.join(__dirname, 'yt-dlp.exe');
    await downloadFile('https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe', ytDlpPath);
    console.log('yt-dlp downloaded successfully');

    // Install npm dependencies
    console.log('Installing npm dependencies...');
    execSync('npm install', { stdio: 'inherit' });
    console.log('Dependencies installed successfully');

    console.log('Build completed successfully!');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

main(); 