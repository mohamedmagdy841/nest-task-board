import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { safeUserSelect } from 'src/prisma/selects/user.select';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TASK_CREATED, TASK_DELETED, TASK_UPDATED } from './events/task.events';
import { FindTasksQueryDto } from './dto/find-tasks.query';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MailService } from 'src/mail/mail.service';
import { generateTasksCsv } from './utils/csv';

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    private readonly mailService: MailService,
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

  async findAll(query: FindTasksQueryDto) {
    const {
      page = 1,
      limit = 20,
      createdBy,
      assignedTo,
      search,
      status,
      sortBy = 'createdAt',
      order = 'desc',
    } = query;

    const skip = (page - 1) * limit;

    const where: any = {};

    // Filter: created by
    if (createdBy) {
      where.createdById = createdBy;
    }

    // Filter: assigned to
    if (assignedTo) {
      where.assignees = {
        some: {
          userId: assignedTo,
        },
      };
    }

    // Search by title
    if (search) {
      where.title = {
        contains: search,
      };
    }

    if (status) {
      where.status = status;
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: order,
        },
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
      }),
      this.prisma.task.count({ where }),
    ]);

    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        hasNextPage: skip + items.length < total,
      },
    };
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

  // @Cron('0 9 * * 5') // Every Friday at 9 AM
  @Cron(CronExpression.EVERY_30_SECONDS)
  async weeklyDoneTasksSummary() {
    if (process.env.NODE_ENV === 'production') {
      return;
    }
    console.log('Generating weekly done tasks summary email...');

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const tasks = await this.prisma.task.findMany({
      where: {
        status: 'done',
        completedAt: {
          gte: oneWeekAgo,
        },
      },
      include: {
        createdBy: {
          select: safeUserSelect,
        },
        assignees: {
          include: {
            user: { select: safeUserSelect },
          },
        },
      },
      orderBy: {
        completedAt: 'desc',
      },
    });

    if (!tasks.length) return;

    const normalizedTasks = tasks.map(task => ({
      id: task.id,
      title: task.title,
      priority: task.priority,
      completedAt: task.completedAt?.toDateString(),
      createdBy: task.createdBy.name,
      assignees: task.assignees.map(a => a.user.name).join(', '),
    }));

    const csv = generateTasksCsv(normalizedTasks);

    await this.mailService.sendTemplateMail({
      to: process.env.ADMIN_EMAIL!,
      subject: `Weekly Tasks Summary (${tasks.length} completed)`,
      template: 'weekly-done-tasks',
      context: {
        total: normalizedTasks.length,
        generatedAt: new Date().toDateString(),
      },
      attachments: [
        {
          filename: 'weekly-completed-tasks.csv',
          content: csv,
          contentType: 'text/csv',
        }
      ]
    });
  }
}


