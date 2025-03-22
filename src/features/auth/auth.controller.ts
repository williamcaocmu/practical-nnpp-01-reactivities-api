import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
  Body,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { PublicRoute } from './decorators/public.decorator';
import { User } from './decorators/user.decorator';
import { RegisterDto } from './dto';
import { RequestUser } from './types/request-user.type';

const COOKIE_NAME = 'reactivity-token';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('local'))
  @PublicRoute()
  @Post('login')
  async login(@User() user: RequestUser, @Res() res: Response) {
    const token = await this.authService.login(user);
    res.cookie(COOKIE_NAME, token, {
      httpOnly: false, // Makes cookie inaccessible to JavaScript
      secure: true, // Only sends cookie over HTTPS
      sameSite: 'lax', // Controls how cookie is sent with cross-site requests
      path: '/', // Cookie path
      maxAge: 7 * 24 * 60 * 60 * 1000, // Cookie expiration time
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
    res.clearCookie(COOKIE_NAME);
    res.sendStatus(HttpStatus.OK);
  }

  @HttpCode(HttpStatus.CREATED)
  @PublicRoute()
  @Post('register')
  register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }
}
