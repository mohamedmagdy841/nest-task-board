import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTaskDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    title: string;

    @IsString()
    @IsOptional()
    @MaxLength(2000)
    description?: string;

    @IsInt()
    @Min(1)
    @IsOptional()
    @Type(() => Number)
    assignedToId?: number;
}
