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
  ) { }

  async create(createTaskDto: CreateTaskDto, userId: number) {
    const { assigneeIds, ...taskData } = createTaskDto;

    const task = await this.prisma.task.create({
      data: {
        ...taskData,
        createdById: userId,
        assignees: assigneeIds?.length
          ? {
            createMany: {
              data: assigneeIds.map((userId) => ({
                userId,
              })),
            },
          }
          : undefined,
      },
      include: {
        createdBy: { select: safeUserSelect },
        assignees: {
          include: {
            user: { select: safeUserSelect },
          },
        },
        comments: true,
        files: true,
      },
    });

    this.eventEmitter.emit(TASK_CREATED, { task, actorId: userId });

    return task;
  }

  async findAll() {
    return this.prisma.task.findMany({
      include: {
        createdBy: { select: safeUserSelect },
        assignees: {
          include: {
            user: { select: safeUserSelect },
          },
        },
        comments: {
          include: {
            createdBy: { select: safeUserSelect },
          },
        },
        files: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        createdBy: { select: safeUserSelect },
        assignees: {
          include: {
            user: { select: safeUserSelect },
          },
        },
        comments: {
          include: {
            createdBy: { select: safeUserSelect },
          },
        },
        files: true,
      },
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

    const { assigneeIds, ...taskData } = updateTaskDto;

    const updatedTask = await this.prisma.task.update({
      where: { id },
      data: {
        ...taskData,
        assignees: assigneeIds
          ? {
            deleteMany: {},
            createMany: {
              data: assigneeIds.map((userId) => ({ userId })),
            },
          }
          : undefined,
      },
      include: {
        createdBy: { select: safeUserSelect },
        assignees: {
          include: {
            user: { select: safeUserSelect },
          },
        },
      },
    });

    this.eventEmitter.emit(TASK_UPDATED, { task: updatedTask, actorId: userId });

    return updatedTask;
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

    await this.prisma.task.delete({ where: { id } });

    this.eventEmitter.emit(TASK_DELETED, { task, actorId: userId });

    return;
  }
}


