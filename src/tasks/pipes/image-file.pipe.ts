import { MaxFileSizeValidator, ParseFilePipe } from "@nestjs/common";
import { MAX_IMAGE_SIZE } from "../constants/file.constants";

export const ImageFilePipe = new ParseFilePipe({
    validators: [
        new MaxFileSizeValidator({ maxSize: MAX_IMAGE_SIZE }),
    ]
});