import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getStats(req: any): Promise<{
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
    getRevenueData(req: any, startDate?: string, endDate?: string, interval?: 'day' | 'month' | 'year'): Promise<{
        total: number;
        data: {
            label: string;
            amount: number;
        }[];
        interval: "day" | "month" | "year";
    }>;
}
