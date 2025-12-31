import { diskStorage } from 'multer';
import * as crypto from 'crypto';
import { extname, join } from 'path';
import { UPLOADS_DIR } from '../constants/file.constants';

export const taskFileStorage = diskStorage({
        destination: join(UPLOADS_DIR, 'tasks'),
        filename: (req, file, callback) => {
        const hash = crypto.randomBytes(8).toString('hex');
        const ext = extname(file.originalname);
        const newName = `${file.fieldname}-${hash}${ext}`;
        callback(null, newName);
    },
});