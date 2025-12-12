import { Request, Response } from 'express';
import cloudinary from '@config/cloudinary';

// Upload a single file (expects multer memory storage)
export const uploadFile = async (req: Request, res: Response): Promise<void> => {
  try {
    // multer sets file on req.file
    // @ts-ignore
    const file = req.file;
    if (!file) {
      res.status(400).json({ message: 'No file provided' });
      return;
    }

    const streamUpload = (buffer: Buffer) =>
      new Promise<any>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'materi', resource_type: 'image' },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          },
        );
        stream.end(buffer);
      });

    // @ts-ignore
    const result = await streamUpload(file.buffer);
    return res.json({ url: result.secure_url, raw: result });
  } catch (error) {
    console.error('[upload] Error uploading file', error);
    res.status(500).json({ message: 'Upload failed' });
  }
};

export default { uploadFile };
