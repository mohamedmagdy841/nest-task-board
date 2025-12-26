import { diskStorage } from 'multer';
import * as crypto from 'crypto';
import { extname } from 'path';

export const taskFileStorage = diskStorage({
        destination: 'uploads/tasks',
        filename: (req, file, callback) => {
        const hash = crypto.randomBytes(8).toString('hex');
        const ext = extname(file.originalname);
        const newName = `${file.fieldname}-${hash}${ext}`;
        callback(null, newName);
    },
});