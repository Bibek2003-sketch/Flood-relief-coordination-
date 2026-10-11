import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

// Resolve private storage directory outside public web root
export const VOICE_STORAGE_DIR = process.env.VOICE_STORAGE_DIR 
  ? path.resolve(process.env.VOICE_STORAGE_DIR)
  : path.resolve(__dirname, '../../storage/voice');

// Ensure directory exists with restricted permissions
if (!fs.existsSync(VOICE_STORAGE_DIR)) {
  fs.mkdirSync(VOICE_STORAGE_DIR, { recursive: true });
}

// Allowed MIME types for voice SOS recordings
const ALLOWED_MIME_TYPES = new Set([
  'audio/webm',
  'audio/webm;codecs=opus',
  'video/webm', // MediaRecorder in Chrome sometimes uses video/webm container for audio
  'audio/ogg',
  'audio/ogg;codecs=opus',
  'audio/mp4',
  'audio/m4a',
  'audio/x-m4a',
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/wave',
  'audio/x-wav',
  'audio/aac'
]);

// Map mime type to safe standard extension
function getSafeExtension(mimetype: string, originalName?: string): string {
  const cleanMime = mimetype.toLowerCase().split(';')[0].trim();
  switch (cleanMime) {
    case 'audio/webm':
    case 'video/webm':
      return '.webm';
    case 'audio/ogg':
      return '.ogg';
    case 'audio/mp4':
    case 'audio/m4a':
    case 'audio/x-m4a':
      return '.m4a';
    case 'audio/mpeg':
    case 'audio/mp3':
      return '.mp3';
    case 'audio/wav':
    case 'audio/wave':
    case 'audio/x-wav':
      return '.wav';
    case 'audio/aac':
      return '.aac';
    default:
      if (originalName && path.extname(originalName)) {
        const ext = path.extname(originalName).toLowerCase();
        if (['.webm', '.ogg', '.m4a', '.mp3', '.wav', '.aac'].includes(ext)) {
          return ext;
        }
      }
      return '.webm';
  }
}

// Multer Disk Storage with randomized unguessable filenames to prevent path traversal & collisions
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    if (!fs.existsSync(VOICE_STORAGE_DIR)) {
      fs.mkdirSync(VOICE_STORAGE_DIR, { recursive: true });
    }
    cb(null, VOICE_STORAGE_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = getSafeExtension(file.mimetype, file.originalname);
    const randomHex = crypto.randomBytes(16).toString('hex');
    const safeName = `sos_${Date.now()}_${randomHex}${ext}`;
    cb(null, safeName);
  }
});

// File filter rejecting non-audio files
const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const cleanMime = file.mimetype.toLowerCase().split(';')[0].trim();
  if (ALLOWED_MIME_TYPES.has(cleanMime) || file.mimetype.startsWith('audio/')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid audio format. Allowed types: WebM, OGG, MP4, WAV, AAC.'));
  }
};

// Max 10MB limit (90s opus/webm audio is typically ~500KB - 1.5MB)
export const voiceUpload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 Megabytes
  },
  fileFilter
});

