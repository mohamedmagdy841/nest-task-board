import {
    Controller, Delete, HttpCode, HttpStatus, Param,
    ParseIntPipe, Post, Req, UploadedFile,
    UploadedFiles, UseGuards, UseInterceptors
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { imageFileFilter, pdfFileFilter } from 'src/task-files/config/multer.filter';
import { taskFileStorage } from 'src/task-files/config/multer.storage';
import { MAX_IMAGE_COUNT } from 'src/task-files/constants/file.constants';
import { ImageFilePipe } from 'src/task-files/pipes/image-file.pipe';
import { PdfFilePipe } from 'src/task-files/pipes/pdf-file.pipe';
import { TaskFilesService } from './task-files.service';
import type { Request } from 'express';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@UseGuards(AuthGuard)
@Controller('task-files')
export class TaskFilesController {
    constructor(private readonly taskFilesService: TaskFilesService) { }

    @HttpCode(HttpStatus.OK)
    @Post(':taskId/upload-image')
    @UseInterceptors(FileInterceptor('image', {
        storage: taskFileStorage,
        fileFilter: imageFileFilter,
    }))
    uploadImage(
        @Param('taskId', ParseIntPipe) taskId: number,
        @Req() req: Request,
        @UploadedFile(ImageFilePipe) file: Express.Multer.File,
    ) {
        return this.taskFilesService.uploadImage(taskId, req.user.sub, req.user.role, file);
    }

    @HttpCode(HttpStatus.OK)
    @Post(':taskId/upload-images')
    @UseInterceptors(FilesInterceptor('images', MAX_IMAGE_COUNT, {
        storage: taskFileStorage,
        fileFilter: imageFileFilter,
    }))
    uploadImages(
        @Param('taskId', ParseIntPipe) taskId: number,
        @Req() req: Request,
        @UploadedFiles() files: Array<Express.Multer.File>,
    ) {
        return this.taskFilesService.uploadImages(taskId, req.user.sub, req.user.role, files);
    }

    @HttpCode(HttpStatus.OK)
    @Post(':taskId/upload-pdf')
    @UseInterceptors(FileInterceptor('pdf', {
        storage: taskFileStorage,
        fileFilter: pdfFileFilter,
    }))
    uploadPdf(
        @Param('taskId', ParseIntPipe) taskId: number,
        @Req() req: Request,
        @UploadedFile(PdfFilePipe) file: Express.Multer.File,
    ) {
        return this.taskFilesService.uploadPdf(taskId, req.user.sub, req.user.role, file);
    }

    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete(':taskId/delete/:fileId')
    deleteFile(
        @Param('taskId', ParseIntPipe) taskId: number,
        @Param('fileId', ParseIntPipe) fileId: number,
        @Req() req: Request,
    ) {
        return this.taskFilesService.deleteFile(taskId, fileId, req.user.sub, req.user.role);
    }

    @HttpCode(HttpStatus.OK)
    @Delete(':taskId/delete-all')
    deleteAllFiles(
        @Param('taskId', ParseIntPipe) taskId: number,
        @Req() req: Request,
    ) {
        return this.taskFilesService.deleteAllFilesForTask(
            taskId,
            req.user.sub,
            req.user.role,
        );
    }
}
