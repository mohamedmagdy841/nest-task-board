import { extname } from 'path';
import { BadRequestException } from '@nestjs/common';

export const imageFileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: Function,
) => {
  const allowedMimeTypes = [
    'image/png',
    'image/jpeg',
    'image/webp',
  ];

  const allowedExtensions = [
    '.png',
    '.jpg',
    '.jpeg',
    '.webp',
  ];

  const ext = extname(file.originalname).toLowerCase();

  if (
    !allowedMimeTypes.includes(file.mimetype) ||
    !allowedExtensions.includes(ext)
  ) {
    return cb(
      new BadRequestException(
        'Only PNG, JPG, JPEG, and WEBP images are allowed',
      ),
      false,
    );
  }

  cb(null, true);
};


export const pdfFileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: Function,
) => {
  if (
    file.mimetype !== 'application/pdf' ||
    extname(file.originalname).toLowerCase() !== '.pdf'
  ) {
    return cb(
      new BadRequestException('Only PDF files are allowed'),
      false,
    );
  }

  cb(null, true);
};
