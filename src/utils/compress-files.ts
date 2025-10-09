import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';

export const compressFile = async (
  fileBuffer: Buffer,
  fileName: string,
  fileType: string
): Promise<{ buffer: Buffer; contentType: string }> => {
  let bufferToUpload: Buffer;
  let contentType = fileType;

  if (fileType.startsWith('image/')) {
    bufferToUpload = await sharp(fileBuffer)
      .resize(1024, 1024, { fit: 'inside' })
      .jpeg({ quality: 80 })
      .toBuffer();
    contentType = 'image/jpeg';
  } else if (fileType.startsWith('video/')) {
    const tempInputPath = `/tmp/${fileName}`;
    const tempOutputPath = `/tmp/compressed-${fileName}`;

    fs.writeFileSync(tempInputPath, fileBuffer);

    await new Promise((resolve, reject) => {
      ffmpeg(tempInputPath)
        .outputOptions([
          '-vcodec libx264',
          '-crf 28',
          '-preset fast',
          '-acodec aac',
        ])
        .save(tempOutputPath)
        .on('end', resolve)
        .on('error', reject);
    });

    bufferToUpload = fs.readFileSync(tempOutputPath);

    fs.unlinkSync(tempInputPath);
    fs.unlinkSync(tempOutputPath);

    contentType = 'video/mp4';
  } else {
    bufferToUpload = fileBuffer; // fallback
  }

  return { buffer: bufferToUpload, contentType };
};
