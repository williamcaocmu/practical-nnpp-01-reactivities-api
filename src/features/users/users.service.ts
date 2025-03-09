import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { HashingService } from '../auth/hashing/hashing.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(
    private readonly db: PrismaService,
    private readonly hashingService: HashingService,
  ) {}

  private selectUser(): Prisma.UserSelect {
    return {
      id: true,
      email: true,
      displayName: true,
      username: true,
      imageUrl: true,
    };
  }

  async create(createUserDto: CreateUserDto) {
    const { password, ...user } = createUserDto;
    const hashedPassword = await this.hashingService.hash(password);

    return this.db.user.create({
      data: {
        ...user,
        password: hashedPassword,
      },
      select: this.selectUser(),
    });
  }

  findAll() {
    return `This action returns all users`;
  }

  async findOne(id: string) {
    return this.db.user.findUnique({
      where: { id },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const { password, ...user } = updateUserDto;

    const foundUser = await this.findOne(id);

    if (!foundUser) {
      throw new NotFoundException('User not found');
    }

    const hashedPassword =
      password && (await this.hashingService.hash(password));

    return this.db.user.update({
      where: { id },
      data: { ...user, password: hashedPassword },
      select: this.selectUser(),
    });
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
