import multer from 'multer';
import { promises as fs } from 'fs';
import path from 'path';
import { nanoid } from 'nanoid';

// Configure multer for file uploads
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'));
    }
  },
});

export async function saveUploadedFile(
  buffer: Buffer,
  originalName: string,
  mimetype: string
): Promise<{
  url: string;
  filename: string;
  size: number;
}> {
  const uploadsDir = path.join(process.cwd(), 'uploads');
  
  // Ensure uploads directory exists
  try {
    await fs.access(uploadsDir);
  } catch {
    await fs.mkdir(uploadsDir, { recursive: true });
  }

  const fileExtension = path.extname(originalName);
  const filename = `${nanoid()}${fileExtension}`;
  const filepath = path.join(uploadsDir, filename);

  await fs.writeFile(filepath, buffer);

  return {
    url: `/uploads/${filename}`,
    filename,
    size: buffer.length,
  };
}

export function getImageDimensions(buffer: Buffer): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    // For a full implementation, you'd use a library like 'sharp' or 'image-size'
    // For now, we'll return default dimensions
    resolve({ width: 1024, height: 768 });
  });
}

export function convertToBase64(buffer: Buffer): string {
  return buffer.toString('base64');
}
