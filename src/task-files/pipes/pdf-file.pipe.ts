import {
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { MAX_PDF_SIZE } from '../../task-files/constants/file.constants';

export const PdfFilePipe = new ParseFilePipe({
  validators: [
    new MaxFileSizeValidator({ maxSize: MAX_PDF_SIZE }),
  ],
});