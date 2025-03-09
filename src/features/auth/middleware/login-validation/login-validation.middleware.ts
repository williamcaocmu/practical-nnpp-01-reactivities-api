import {
  BadRequestException,
  Injectable,
  NestMiddleware,
  Type,
} from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { NextFunction, Request, Response } from 'express';

export const ValidationMiddleware = <TDto extends Type<any>>(
  DtoClass: TDto,
) => {
  @Injectable()
  class LoginValidationMiddleware implements NestMiddleware {
    async use(req: Request, res: Response, next: NextFunction) {
      const { email, password } = req.body;
      const dto = plainToClass(DtoClass, { email, password });

      const errors = await validate(dto, {
        whitelist: true,
        forbidNonWhitelisted: true,
      });

      if (errors.length > 0) {
        const errorMessages = errors.flatMap((error) => {
          return Object.values(error.constraints).join(', ');
        });

        throw new BadRequestException(errorMessages);
      }

      next();
    }
  }

  return LoginValidationMiddleware;
};
