import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from 'generated/prisma/client';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = "Internal server error";
        let errorName = "InternalServerError";

        // Handle Nest HttpExceptions
        if (exception instanceof HttpException) {
            const res = exception.getResponse();
            status = exception.getStatus();

            if (typeof res === "string") {
                message = res;
            } else if (typeof res === "object" && res !== null) {
                message = (res as any).message || message;
            }

            errorName = exception.name;
        }

        // Handle Prisma errors
        else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
            if (exception.code === "P2002") {
                status = 409;
                message = "A record with this value already exists";
            }
            if (exception.code === "P2025") {
                status = 404;
                message = "Record not found";
            }
            errorName = "PrismaClientKnownRequestError";
        }

        // Handle unknown errors
        else if (exception instanceof Error) {
            message = exception.message;
            errorName = exception.name;
        }

        response.status(status).json({
            success: false,
            statusCode: status,
            message,
            error: errorName,
            timestamp: new Date().toISOString(),
            path: request.url,
        });
    }
}