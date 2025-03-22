import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'nestjs-prisma';
import { HashingService } from './hashing/hashing.service';
import { RequestUser } from './types/request-user.type';
import { JwtPayload } from './types/jwt-payload.type';
import { RegisterDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly db: PrismaService,
    private readonly hashingService: HashingService,
    private readonly jwtService: JwtService,
  ) {}

  async validateLocal(email: string, password: string) {
    const user = await this.db.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isMatch = await this.hashingService.compare(password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid password');
    }

    return { id: user.id } as RequestUser;
  }

  async login(user: RequestUser) {
    const payload: JwtPayload = { sub: user.id };
    return this.jwtService.sign(payload);
  }

  async validateJwt(payload: JwtPayload) {
    const user = await this.db.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return { id: user.id } as RequestUser;
  }

  async getProfile(userId: string) {
    const user = await this.db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        displayName: true,
        imageUrl: true,
      },
    });

    return user;
  }

  async register(body: RegisterDto) {
    const { email, password, displayName } = body;
    const existingUser = await this.db.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new BadRequestException('User already exists');
    }
    const hashedPassword = await this.hashingService.hash(password);

    const username = displayName?.toLowerCase().replace(/\s+/g, '-');

    await this.db.user.create({
      data: { email, password: hashedPassword, displayName, username },
      select: {
        id: true,
        email: true,
        displayName: true,
        username: true,
      },
    });
  }
}
