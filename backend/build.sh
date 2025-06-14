#!/bin/bash

# Install yt-dlp
curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /tmp/yt-dlp
chmod a+rx /tmp/yt-dlp
mv /tmp/yt-dlp /usr/local/bin/yt-dlp

# Install ffmpeg
apt-get update
apt-get install -y ffmpeg

# Install npm dependencies
npm install 