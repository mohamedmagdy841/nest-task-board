import { join } from "path";

export const UPLOADS_DIR = join(process.cwd(), 'uploads');
export const MAX_IMAGE_COUNT = 3;
export const MAX_IMAGE_SIZE = 3 * 1024 * 1024; // 3MB
export const MAX_PDF_SIZE = 5 * 1024 * 1024; // 5MB