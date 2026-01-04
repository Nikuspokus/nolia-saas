import { PrismaService } from '../prisma/prisma.service';
export declare class DashboardService {
    private prisma;
    constructor(prisma: PrismaService);
    private getCompanyIdForUser;
    getStats(user: any): Promise<{
        revenue: {
            amount: number;
            percentageChange: number;
        };
        pendingInvoices: {
            count: number;
        };
        activeClients: {
            count: number;
        };
    }>;
    getRevenueData(user: any, startDate?: string, endDate?: string, interval?: 'day' | 'month' | 'year'): Promise<{
        total: number;
        data: {
            label: string;
            amount: number;
        }[];
        interval: "day" | "month" | "year";
    }>;
}
