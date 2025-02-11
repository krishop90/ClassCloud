const ffmpeg = require('fluent-ffmpeg');
const path = require('path');

ffmpeg.setFfmpegPath('C:/ffmpeg-master-latest-win64-gpl-shared/bin/ffmpeg.exe');
ffmpeg.setFfprobePath('C:/ffmpeg-master-latest-win64-gpl-shared/bin/ffprobe.exe');

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
