import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  MaxLength,
  IsEnum,
  IsDate,
  IsArray,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
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

    @IsDate()
    @Type(() => Date)
    @IsOptional()
    dueDate?: Date;

    @IsDate()
    @Type(() => Date)
    @IsOptional()
    completedAt?: Date;

    @IsArray()
    @IsInt({ each: true })
    @IsOptional()
    assigneeIds?: number[];
}
