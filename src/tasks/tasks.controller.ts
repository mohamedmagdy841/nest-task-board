import { 
  Controller, Get, Post, Body, Patch, 
  Param, Delete, UseGuards, Req, ParseIntPipe, 
  HttpCode, HttpStatus 
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import type { Request } from 'express';

@UseGuards(AuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post()
  create(
    @Body() createTaskDto: CreateTaskDto,
    @Req() req: Request,
  ) {
    return this.tasksService.create(createTaskDto, req.user.sub);
  }

  @HttpCode(HttpStatus.OK)
  @Get()
  findAll() {
    return this.tasksService.findAll();
  }

  @HttpCode(HttpStatus.OK)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tasksService.findOne(id);
  }

  @HttpCode(HttpStatus.OK)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateTaskDto: UpdateTaskDto,
    @Req() req: Request,
  ) {
    return this.tasksService.update(id, updateTaskDto, req.user.sub, req.user.role);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ) {
    return this.tasksService.remove(id, req.user.sub, req.user.role);
  }
}
