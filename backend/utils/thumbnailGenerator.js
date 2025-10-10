const ffmpeg = require('fluent-ffmpeg');
const path = require('path');

// Configure via environment when available; otherwise rely on system PATH
if (process.env.FFMPEG_PATH) {
  ffmpeg.setFfmpegPath(process.env.FFMPEG_PATH);
}
if (process.env.FFPROBE_PATH) {
  ffmpeg.setFfprobePath(process.env.FFPROBE_PATH);
}

const generateThumbnail = (videoPath, thumbnailDir) => {
  return new Promise((resolve, reject) => {
    const timestamp = Date.now();
    const thumbnailFilename = `${timestamp}.jpg`;
    const thumbnailPath = path.join(thumbnailDir, thumbnailFilename);
    
    ffmpeg(videoPath)
      .screenshots({
        count: 1,
        folder: thumbnailDir,
        filename: thumbnailFilename,
        size: '320x240',
      })
      .on('end', () => {
        resolve(thumbnailPath);
      })
      .on('error', (err) => {
        reject(err);
      });
  });
};

module.exports = generateThumbnail;
