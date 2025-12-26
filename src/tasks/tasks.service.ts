import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { safeUserSelect } from 'src/prisma/selects/user.select';
import type { Express } from 'express';
@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTaskDto: CreateTaskDto, userId: number) {
    return this.prisma.task.create({
      data: {
        title: createTaskDto.title,
        description: createTaskDto.description,
        createdById: userId,
        assignedToId: createTaskDto.assignedToId ?? null,
      }
    });
  }

  async findAll() {
    return this.prisma.task.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        createdAt: true,
        createdBy: { select: safeUserSelect },
        assignedTo: { select: safeUserSelect },
      }
    });
  }

  async findOne(id: number) {
    const task = await this.prisma.task.findUnique({
      where: {id},
      select: {
        id: true,
        title: true,
        description: true,
        createdAt: true,
        createdBy: { select: safeUserSelect },
        assignedTo: { select: safeUserSelect },
      }
    });

    if (!task) {
      throw new NotFoundException(`Task with id ${id} not found`);
    }

    return task;
  }

  async update(
    id: number, 
    updateTaskDto: UpdateTaskDto,
    userId: number,
    role: string,
  ) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      select: {
        id: true,
        createdById: true,
      },
    });

    if (!task) {
      throw new NotFoundException(`Task with id ${id} not found`);
    }

    if (userId !== task.createdById && role !== 'ADMIN') {
      throw new ForbiddenException("You don't have permission for that.")
    }

    const newTask = await this.prisma.task.update({
      where: {id},
      data: {
        title: updateTaskDto.title,
        description: updateTaskDto.description,
        assignedToId: updateTaskDto.assignedToId,
      },
      select: {
        id: true,
        title: true,
        description: true,
        createdAt: true,
        createdBy: { select: safeUserSelect },
        assignedTo: { select: safeUserSelect },
      }
    });

    return newTask;
  }

  async remove(
    id: number, 
    userId: number,
    role: string,
  ) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      select: {
        id: true,
        createdById: true,
      },
    });

    if (!task) {
      throw new NotFoundException(`Task with id ${id} not found`);
    }

    if (userId !== task.createdById && role !== 'ADMIN') {
      throw new ForbiddenException("You don't have permission for that.");
    }
    
    await this.prisma.task.delete({ where: {id}});
    return;
  }

  async uploadImage(
    id: number,
    userId: number,
    role: string,
    file:  Express.Multer.File,
  ) {

    if (!file) {
      throw new BadRequestException('No image uploaded');
    }

    const task = await this.prisma.task.findUnique({
      where: { id },
      select: {
        id: true,
        createdById: true
      }
    });

    if (!task) {
      throw new NotFoundException(`Task with id ${id} not found`);
    }

    if(userId !== task.createdById && role !== 'ADMIN') {
      throw new ForbiddenException("You don't have permission for that.");
    }

    return this.prisma.task_Files.create({
      data: {
        fileUrl: file.path,
        fileType: file.fieldname,
        mimeType: file.mimetype,
        size: file.size,
        taskId: task.id,
      }
    });
  }

  async uploadImages(
    id: number,
    userId: number,
    role: string,
    files:  Array<Express.Multer.File>,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No images uploaded');
    }

    const task = await this.prisma.task.findUnique({
      where: { id },
      select: {
        id: true,
        createdById: true
      }
    });

    if (!task) {
      throw new NotFoundException(`Task with id ${id} not found`);
    }

    if(userId !== task.createdById && role !== 'ADMIN') {
      throw new ForbiddenException("You don't have permission for that.");
    }

    for (const file of files) {
      if (!file.mimetype.startsWith('image/')) {
        throw new BadRequestException('Invalid image type');
      }
    }

    return this.prisma.task_Files.createMany({
      data: files.map((file) => ({
        fileUrl: file.path,
        fileType: file.fieldname,
        mimeType: file.mimetype,
        size: file.size,
        taskId: task.id,
      }))
    });
  }

  async uploadPdf(
    id: number,
    userId: number,
    role: string,
    file:  Express.Multer.File,
  ) {

    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const task = await this.prisma.task.findUnique({
      where: { id },
      select: {
        id: true,
        createdById: true
      }
    });

    if (!task) {
      throw new NotFoundException(`Task with id ${id} not found`);
    }

    if(userId !== task.createdById && role !== 'ADMIN') {
      throw new ForbiddenException("You don't have permission for that.");
    }

    return this.prisma.task_Files.create({
      data: {
        fileUrl: file.path,
        fileType: file.fieldname,
        mimeType: file.mimetype,
        size: file.size,
        taskId: task.id,
      }
    });
  }
}


