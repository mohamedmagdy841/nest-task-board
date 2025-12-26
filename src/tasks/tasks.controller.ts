import { 
  Controller, Get, Post, Body, Patch, 
  Param, Delete, UseGuards, Req, ParseIntPipe, 
  HttpCode, HttpStatus, 
  UseInterceptors,
  UploadedFile,
  UploadedFiles
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import type { Request, Express } from 'express';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { taskFileStorage } from './config/multer.storage';
import { ImageFilePipe } from './pipes/image-file.pipe';
import { MAX_IMAGE_COUNT } from './constants/file.constants';
import { PdfFilePipe } from './pipes/pdf-file.pipe';
import { imageFileFilter, pdfFileFilter } from './config/multer.filter';


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

  @HttpCode(HttpStatus.OK)
  @Post(':id/upload-image')
  @UseInterceptors(FileInterceptor('image', {
    storage: taskFileStorage,
    fileFilter: imageFileFilter,
  }))
  uploadImage(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
    @UploadedFile(ImageFilePipe) file: Express.Multer.File,
  ) {
    return this.tasksService.uploadImage(id, req.user.sub, req.user.role, file);
  }

  @HttpCode(HttpStatus.OK)
  @Post(':id/upload-images')
  @UseInterceptors(FilesInterceptor('images', MAX_IMAGE_COUNT, {
    storage: taskFileStorage,
    fileFilter: imageFileFilter,
  }))
  uploadImages(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    return this.tasksService.uploadImages(id, req.user.sub, req.user.role, files);
  }

  @HttpCode(HttpStatus.OK)
  @Post(':id/upload-pdf')
  @UseInterceptors(FileInterceptor('pdf', {
    storage: taskFileStorage,
    fileFilter: pdfFileFilter,
  }))
  uploadPdf(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
    @UploadedFile(PdfFilePipe) file: Express.Multer.File,
  ) {
    return this.tasksService.uploadPdf(id, req.user.sub, req.user.role, file);
  }
}
