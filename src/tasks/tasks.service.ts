import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
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

    return file;
  }

  async uploadImages(
    id: number,
    userId: number,
    role: string,
    files:  Array<Express.Multer.File>,
  ) {
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

    return files;
  }

  async uploadPdf(
    id: number,
    userId: number,
    role: string,
    file:  Express.Multer.File,
  ) {
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

    return file;
  }
}


