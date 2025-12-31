import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { safeUserSelect } from 'src/prisma/selects/user.select';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TASK_CREATED, TASK_DELETED, TASK_UPDATED } from './events/task.events';
@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(createTaskDto: CreateTaskDto, userId: number) {
    const task = await this.prisma.task.create({
      data: {
        title: createTaskDto.title,
        description: createTaskDto.description,
        status: createTaskDto.status,
        createdById: userId,
        assignedToId: createTaskDto.assignedToId ?? null,
      },
      select: {
        id: true,
        title: true,
        description: true,
        createdAt: true,
        status: true,
        createdBy: { select: safeUserSelect },
        assignedTo: { select: safeUserSelect },
      }
    });

    this.eventEmitter.emit(TASK_CREATED, {task, actorId: userId});

    return task;
  }

  async findAll() {
    return this.prisma.task.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        createdAt: true,
        status: true,
        createdBy: { select: safeUserSelect },
        assignedTo: { select: safeUserSelect },
        files: {
          select: {
            id: true,
            fileUrl: true,
            fileType: true,
            mimeType: true,
            size: true,
            createdAt: true,
          }
        },
      },
      orderBy: {
        createdAt: 'desc',
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
        status: true,
        createdBy: { select: safeUserSelect },
        assignedTo: { select: safeUserSelect },
        files: {
          select: {
            id: true,
            fileUrl: true,
            fileType: true,
            mimeType: true,
            size: true,
            createdAt: true,
          }
        },
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
        status: updateTaskDto.status,
      },
      select: {
        id: true,
        title: true,
        description: true,
        createdAt: true,
        status: true,
        createdBy: { select: safeUserSelect },
        assignedTo: { select: safeUserSelect },
      }
    });

    this.eventEmitter.emit(TASK_UPDATED, {task: newTask, actorId: userId});

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

    this.eventEmitter.emit(TASK_DELETED, {task, actorId: userId});

    return;
  }
}


