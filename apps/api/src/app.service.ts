import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) { }

  getHello(): string {
    return 'Hello World!';
  }

  async checkHealth() {
    try {
      const userCount = await this.prisma.user.count();
      return { status: 'ok', userCount };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }
}
