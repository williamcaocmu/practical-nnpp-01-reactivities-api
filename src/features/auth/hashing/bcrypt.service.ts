import { Injectable } from '@nestjs/common';
import { hash, compare, genSalt } from 'bcrypt';
import { HashingService } from './hashing.service';

@Injectable()
export class BcryptService implements HashingService {
  async hash(data: string | Buffer): Promise<string> {
    const salt = await genSalt(10);
    return hash(data, salt);
  }

  async compare(data: string | Buffer, hash: string): Promise<boolean> {
    return compare(data, hash);
  }
}
