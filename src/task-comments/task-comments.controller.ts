import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TaskCommentsService } from './task-comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { FindCommentsQueryDto } from './dto/find-comments.query';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import type { Request } from 'express';

@UseGuards(AuthGuard)
@Controller('tasks/:taskId/comments')
export class TaskCommentsController {
  constructor(private readonly taskCommentsService: TaskCommentsService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post()
  create(
    @Param('taskId', ParseIntPipe) taskId: number,
    @Body() dto: CreateCommentDto,
    @Req() req: Request,
  ) {
    return this.taskCommentsService.create(
      taskId,
      dto,
      req.user.sub,
    );
  }

  @HttpCode(HttpStatus.OK)
  @Get()
  findAll(
    @Param('taskId', ParseIntPipe) taskId: number,
    @Query() query: FindCommentsQueryDto,
  ) {
    return this.taskCommentsService.findAll(taskId, query);
  }

  @HttpCode(HttpStatus.OK)
  @Get(':commentId')
  findOne(
    @Param('taskId', ParseIntPipe) taskId: number,
    @Param('commentId', ParseIntPipe) commentId: number,
  ) {
    return this.taskCommentsService.findOne(taskId, commentId);
  }

  @HttpCode(HttpStatus.OK)
  @Patch(':commentId')
  update(
    @Param('taskId', ParseIntPipe) taskId: number,
    @Param('commentId', ParseIntPipe) commentId: number,
    @Body() dto: UpdateCommentDto,
    @Req() req: Request,
  ) {
    return this.taskCommentsService.update(
      taskId,
      commentId,
      dto,
      req.user.sub,
      req.user.role,
    );
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':commentId')
  remove(
    @Param('taskId', ParseIntPipe) taskId: number,
    @Param('commentId', ParseIntPipe) commentId: number,
    @Req() req: Request,
  ) {
    return this.taskCommentsService.remove(
      taskId,
      commentId,
      req.user.sub,
      req.user.role,
    );
  }
}
