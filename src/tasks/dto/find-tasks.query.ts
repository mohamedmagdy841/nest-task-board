import { IsInt, IsOptional, IsString, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class FindTasksQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number = 10;

  // Filters
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  createdBy?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  assignedTo?: number;

  // Search
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  status?: string;

  // Sorting
  @IsOptional()
  @IsIn(['createdAt', 'dueDate'])
  sortBy?: 'createdAt' | 'dueDate' = 'createdAt';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc' = 'desc';
}
