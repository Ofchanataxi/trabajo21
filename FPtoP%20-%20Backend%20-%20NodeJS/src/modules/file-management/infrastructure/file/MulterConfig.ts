// src/infrastructure/file/MulterConfig.ts
import multer from 'multer';

export const readFile = multer();

export const upload = multer({ dest: '/tmp/uploads' });
const storage = multer.memoryStorage();
export const uploadTemp = multer({ storage: storage });
