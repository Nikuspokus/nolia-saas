import { PrismaService } from './prisma/prisma.service';
export declare class AppService {
    private prisma;
    constructor(prisma: PrismaService);
    getHello(): string;
    checkHealth(): Promise<{
        status: string;
        userCount: number;
        message?: undefined;
    } | {
        status: string;
        message: any;
        userCount?: undefined;
    }>;
}
