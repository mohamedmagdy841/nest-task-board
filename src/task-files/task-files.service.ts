import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from 'eventemitter2';
import { PrismaService } from 'src/prisma/prisma.service';
import { FILE_UPLOADED } from 'src/tasks/events/task.events';
import fs from 'fs';
import { join } from 'path';
import { UPLOADS_DIR } from './constants/file.constants';

@Injectable()
export class TaskFilesService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly eventEmitter: EventEmitter2,
    ) { }

    async uploadImage(
        taskId: number,
        userId: number,
        role: string,
        file: Express.Multer.File,
    ) {

        if (!file) {
            throw new BadRequestException('No image uploaded');
        }

        const task = await this.prisma.task.findUnique({
            where: { id: taskId },
            select: {
                id: true,
                createdById: true
            }
        });

        if (!task) {
            throw new NotFoundException(`Task with id ${taskId} not found`);
        }

        if (userId !== task.createdById && role !== 'ADMIN') {
            throw new ForbiddenException("You don't have permission for that.");
        }

        const fileRecord = await this.prisma.task_Files.create({
            data: {
                fileUrl: `/uploads/tasks/${file.filename}`,
                fileType: file.fieldname,
                mimeType: file.mimetype,
                size: file.size,
                taskId: task.id,
            }
        });

        this.eventEmitter.emit(FILE_UPLOADED, fileRecord);

        return fileRecord;
    }

    async uploadImages(
        taskId: number,
        userId: number,
        role: string,
        files: Array<Express.Multer.File>,
    ) {
        if (!files || files.length === 0) {
            throw new BadRequestException('No images uploaded');
        }

        const task = await this.prisma.task.findUnique({
            where: { id: taskId },
            select: {
                id: true,
                createdById: true
            }
        });

        if (!task) {
            throw new NotFoundException(`Task with id ${taskId} not found`);
        }

        if (userId !== task.createdById && role !== 'ADMIN') {
            throw new ForbiddenException("You don't have permission for that.");
        }

        for (const file of files) {
            if (!file.mimetype.startsWith('image/')) {
                throw new BadRequestException('Invalid image type');
            }
        }

        return this.prisma.task_Files.createMany({
            data: files.map((file) => ({
                fileUrl: `/uploads/tasks/${file.filename}`,
                fileType: file.fieldname,
                mimeType: file.mimetype,
                size: file.size,
                taskId: task.id,
            }))
        });
    }

    async uploadPdf(
        taskId: number,
        userId: number,
        role: string,
        file: Express.Multer.File,
    ) {

        if (!file) {
            throw new BadRequestException('No file uploaded');
        }

        const task = await this.prisma.task.findUnique({
            where: { id: taskId },
            select: {
                id: true,
                createdById: true
            }
        });

        if (!task) {
            throw new NotFoundException(`Task with id ${taskId} not found`);
        }

        if (userId !== task.createdById && role !== 'ADMIN') {
            throw new ForbiddenException("You don't have permission for that.");
        }

        const fileRecord = await this.prisma.task_Files.create({
            data: {
                fileUrl: `/uploads/tasks/${file.filename}`,
                fileType: file.fieldname,
                mimeType: file.mimetype,
                size: file.size,
                taskId: task.id,
            }
        });

        this.eventEmitter.emit(FILE_UPLOADED, {
            fileRecord,
            actorId: userId,
        });

        return fileRecord;
    }

    async deleteFile(
        taskId: number,
        fileId: number,
        userId: number,
        role: string,
    ) {
        const task = await this.prisma.task.findUnique({
            where: { id: taskId },
            select: {
                id: true,
                createdById: true
            }
        });

        if (!task) {
            throw new NotFoundException(`Task with id ${taskId} not found`);
        }

        if (userId !== task.createdById && role !== 'ADMIN') {
            throw new ForbiddenException("You don't have permission for that.");
        }

        const file = await this.prisma.task_Files.findUnique({
            where: { id: fileId },
        });

        if (!file || file.taskId !== taskId) {
            throw new NotFoundException(`File with id ${fileId} not found for this task`);
        }

        const filePath = join(
            UPLOADS_DIR,
            file.fileUrl.replace('/uploads/', ''),
        );

        try {
            await fs.promises.unlink(filePath);
        } catch (error) {
            console.error(`Failed to delete file from storage: ${error.message}`);
        }

        await this.prisma.task_Files.delete({
            where: { id: fileId },
        });

        return { message: 'File deleted successfully' };
    }

    async deleteAllFilesForTask(
        taskId: number,
        userId: number,
        role: string,
    ) {
        const task = await this.prisma.task.findUnique({
            where: { id: taskId },
            select: { id: true, createdById: true },
        });

        if (!task) {
            throw new NotFoundException(`Task with id ${taskId} not found`);
        }

        if (userId !== task.createdById && role !== 'ADMIN') {
            throw new ForbiddenException("You don't have permission for that.");
        }

        const files = await this.prisma.task_Files.findMany({
            where: { taskId },
        });

        if (files.length === 0) {
            return { message: 'No files to delete' };
        }

        await Promise.all(
            files.map(async (file) => {
                const filePath = join(
                    UPLOADS_DIR,
                    file.fileUrl.replace('/uploads/', ''),
                );

                try {
                    await fs.promises.unlink(filePath);
                } catch (error) {
                    console.error(`Failed to delete file from storage: ${error.message}`);
                }
            })
        );

        const result = await this.prisma.task_Files.deleteMany({
            where: { taskId },
        });

        return {
            message: 'All files deleted successfully',
            deletedCount: result.count,
        };
    }
}
