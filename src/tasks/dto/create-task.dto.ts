import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  MaxLength,
  IsEnum,
  IsArray,
  IsDateString,
} from 'class-validator';
import { TaskStatus } from '../enums/task-status.enum';
import { TaskPriority } from '../enums/priority.enum';

export class CreateTaskDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    title: string;

    @IsString()
    @IsOptional()
    @MaxLength(2000)
    description?: string;

    @IsEnum(TaskStatus)
    @IsOptional()
    status?: TaskStatus;

    @IsEnum(TaskPriority)
    @IsOptional()
    priority?: TaskPriority;

    @IsOptional()
    @IsDateString()
    dueDate?: Date;

    @IsOptional()
    @IsDateString()
    completedAt?: Date;

    @IsArray()
    @IsInt({ each: true })
    @IsOptional()
    assigneeIds?: number[];
}
