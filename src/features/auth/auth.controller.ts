import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { User } from './decorators/user.decorator';
import { RequestUser } from './types/request-user.type';
import { JwtGuard } from './guards/jwt-guard/jwt-guard.guard';
import { PublicRoute } from './decorators/public.decorator';
import { ProfileResponseMapperDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('local'))
  @PublicRoute()
  @Post('login')
  async login(@User() user: RequestUser, @Res() res: Response) {
    const token = await this.authService.login(user);
    res.cookie('token', token, {
      secure: true,
      httpOnly: true,
      sameSite: true,
    });
    res.sendStatus(HttpStatus.OK);
  }

  @Get('profile')
  async getProfile(@User() user: RequestUser) {
    const profile = await this.authService.getProfile(user.id);
    return profile;
  }

  @PublicRoute()
  @Get('logout')
  logout(@Res() res: Response) {
    res.clearCookie('token');
    res.sendStatus(HttpStatus.OK);
  }
}
