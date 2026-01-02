import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { FindCommentsQueryDto } from './dto/find-comments.query';
import { safeUserSelect } from 'src/prisma/selects/user.select';

@Injectable()
export class TaskCommentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    taskId: number,
    dto: CreateCommentDto,
    userId: number,
  ) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      select: { id: true },
    });

    if (!task) {
      throw new NotFoundException(`Task with id ${taskId} not found`);
    }

    return this.prisma.comment.create({
      data: {
        content: dto.content,
        taskId,
        createdById: userId,
      },
      include: {
        createdBy: { select: safeUserSelect },
      },
    });
  }

  async findAll(
    taskId: number,
    query: FindCommentsQueryDto,
  ) {
    const { page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const taskExists = await this.prisma.task.findUnique({
      where: { id: taskId },
      select: { id: true },
    });

    if (!taskExists) {
      throw new NotFoundException(`Task with id ${taskId} not found`);
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.comment.findMany({
        where: { taskId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: { select: safeUserSelect },
        },
      }),
      this.prisma.comment.count({
        where: { taskId },
      }),
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

  async findOne(taskId: number, commentId: number) {
    const comment = await this.prisma.comment.findFirst({
      where: {
        id: commentId,
        taskId,
      },
      include: {
        createdBy: { select: safeUserSelect },
      },
    });

    if (!comment) {
      throw new NotFoundException(
        `Comment with id ${commentId} not found for task ${taskId}`,
      );
    }

    return comment;
  }

  async update(
    taskId: number,
    commentId: number,
    dto: UpdateCommentDto,
    userId: number,
    role: string,
  ) {
    const comment = await this.prisma.comment.findFirst({
      where: {
        id: commentId,
        taskId,
      },
      select: {
        id: true,
        createdById: true,
      },
    });

    if (!comment) {
      throw new NotFoundException(
        `Comment with id ${commentId} not found`,
      );
    }

    if (comment.createdById !== userId && role !== 'ADMIN') {
      throw new ForbiddenException(
        "You don't have permission to edit this comment",
      );
    }

    return this.prisma.comment.update({
      where: { id: commentId },
      data: dto,
      include: {
        createdBy: { select: safeUserSelect },
      },
    });
  }

  async remove(
    taskId: number,
    commentId: number,
    userId: number,
    role: string,
  ) {
    const comment = await this.prisma.comment.findFirst({
      where: {
        id: commentId,
        taskId,
      },
      select: {
        id: true,
        createdById: true,
      },
    });

    if (!comment) {
      throw new NotFoundException(
        `Comment with id ${commentId} not found`,
      );
    }

    if (comment.createdById !== userId && role !== 'ADMIN') {
      throw new ForbiddenException(
        "You don't have permission to delete this comment",
      );
    }

    await this.prisma.comment.delete({
      where: { id: commentId },
    });

    return;
  }
}