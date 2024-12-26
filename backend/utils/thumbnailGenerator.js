const ffmpeg = require('fluent-ffmpeg');
const path = require('path');

ffmpeg.setFfmpegPath('C:/ffmpeg-master-latest-win64-gpl-shared/bin/ffmpeg.exe');
ffmpeg.setFfprobePath('C:/ffmpeg-master-latest-win64-gpl-shared/bin/ffprobe.exe');


const generateThumbnail = (videoPath, thumbnailDir) => {
  return new Promise((resolve, reject) => {
    const thumbnailPath = path.join(thumbnailDir, `${Date.now()}.jpg`);
    
    ffmpeg(videoPath)
      .on('end', () => {
        resolve(thumbnailPath);  // Return the path to the thumbnail
      })
      .on('error', (err) => {
        reject(err);  // Handle errors in thumbnail generation
      })
      .screenshots({
        count: 1,
        folder: thumbnailDir,
        filename: `${Date.now()}.jpg`,  // Generates a unique filename
        size: '320x240',
      });
  });
};

module.exports = generateThumbnail;
