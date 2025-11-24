import fs from 'fs';
import path from 'path';
import multer from 'multer';
import sharp from 'sharp';

const UPLOAD_ROOT = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOAD_ROOT)) fs.mkdirSync(UPLOAD_ROOT, { recursive: true });

const storage = multer.memoryStorage();

export const imageFileFilter = (req, file, cb) => {
  if (/^image\/(jpeg|png|webp)$/.test(file.mimetype)) cb(null, true);
  else cb(new Error('Invalid image format (jpg, png, webp allowed)'));
};

export const videoFileFilter = (req, file, cb) => {
  if (/^video\/(mp4|webm|ogg)$/.test(file.mimetype)) cb(null, true);
  else cb(new Error('Invalid video format (mp4, webm, ogg allowed)'));
};

export const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
});

function uniqueName(prefix, ext) {
  const id = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  return `${prefix}_${id}.${ext}`;
}

export async function saveAvatar(buffer) {
  const filename = uniqueName('avatar', 'webp');
  const filepath = path.join(UPLOAD_ROOT, filename);
  await sharp(buffer).resize(512, 512, { fit: 'cover' }).webp({ quality: 90 }).toFile(filepath);
  return `/uploads/${filename}`;
}

export async function saveCover(buffer) {
  const filename = uniqueName('cover', 'webp');
  const filepath = path.join(UPLOAD_ROOT, filename);
  // 3:1 ratio, e.g., 1500x500
  await sharp(buffer).resize(1500, 500, { fit: 'cover' }).webp({ quality: 90 }).toFile(filepath);
  return `/uploads/${filename}`;
}

export async function saveImage(buffer) {
  const filename = uniqueName('img', 'webp');
  const filepath = path.join(UPLOAD_ROOT, filename);
  await sharp(buffer).resize(1600, 1600, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 90 }).toFile(filepath);
  return `/uploads/${filename}`;
}

export async function saveVideo(file) {
  // For prototype: write buffer to disk without transcoding
  const ext = file.mimetype.split('/')[1] || 'mp4';
  const filename = uniqueName('vid', ext);
  const filepath = path.join(UPLOAD_ROOT, filename);
  await fs.promises.writeFile(filepath, file.buffer);
  return `/uploads/${filename}`;
}
