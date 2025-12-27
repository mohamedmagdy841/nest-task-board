import { IsNotEmpty, IsString } from "class-validator";

export class EventDto {
    @IsString()
    @IsNotEmpty()
    message: string;
}