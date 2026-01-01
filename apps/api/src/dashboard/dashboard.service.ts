import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InvoiceStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
    constructor(private prisma: PrismaService) { }

    private async getCompanyIdForUser(supabaseId: string, email: string) {
        // 1. Try to find existing user
        const user = await this.prisma.user.findUnique({
            where: { supabaseId },
        });

        if (user) {
            return user.companyId;
        }

        // 2. If not found, create User and Company (JIT Provisioning)
        // Note: Ideally this logic should be centralized
        const newCompany = await this.prisma.company.create({
            data: {
                name: 'My Company',
                users: {
                    create: {
                        email: email,
                        supabaseId: supabaseId,
                        role: 'OWNER',
                    },
                },
            },
            include: {
                users: true,
            },
        });

        return newCompany.id;
    }

    async getStats(user: any) {
        const companyId = await this.getCompanyIdForUser(user.id, user.email);
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();

        // 1. Revenue (Chiffre d'affaires) - Current Month vs Last Month
        const startOfCurrentMonth = new Date(currentYear, currentMonth, 1);
        const startOfNextMonth = new Date(currentYear, currentMonth + 1, 1);
        const startOfLastMonth = new Date(currentYear, currentMonth - 1, 1);

        const currentMonthRevenueAgg = await this.prisma.invoice.aggregate({
            _sum: {
                total: true,
            },
            where: {
                companyId,
                status: InvoiceStatus.PAID,
                date: {
                    gte: startOfCurrentMonth,
                    lt: startOfNextMonth,
                },
            },
        });

        const lastMonthRevenueAgg = await this.prisma.invoice.aggregate({
            _sum: {
                total: true,
            },
            where: {
                companyId,
                status: InvoiceStatus.PAID,
                date: {
                    gte: startOfLastMonth,
                    lt: startOfCurrentMonth,
                },
            },
        });

        const currentMonthRevenue = currentMonthRevenueAgg._sum.total || 0;
        const lastMonthRevenue = lastMonthRevenueAgg._sum.total || 0;

        let revenuePercentageChange = 0;
        if (lastMonthRevenue > 0) {
            revenuePercentageChange = ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
        } else if (currentMonthRevenue > 0) {
            revenuePercentageChange = 100;
        }

        // 2. Pending Invoices (Factures en attente)
        // Status: SENT, FINALIZED, OVERDUE
        const pendingInvoicesCount = await this.prisma.invoice.count({
            where: {
                companyId,
                status: {
                    in: [InvoiceStatus.SENT, InvoiceStatus.FINALIZED, InvoiceStatus.OVERDUE],
                },
            },
        });

        // 3. Active Clients (Clients actifs)
        // For now, total clients
        const activeClientsCount = await this.prisma.client.count({
            where: {
                companyId,
            },
        });

        return {
            revenue: {
                amount: currentMonthRevenue, // In cents
                percentageChange: Math.round(revenuePercentageChange),
            },
            pendingInvoices: {
                count: pendingInvoicesCount,
            },
            activeClients: {
                count: activeClientsCount,
            },
        };
    }
    async getRevenueData(user: any, startDate?: string, endDate?: string, interval: 'day' | 'month' | 'year' = 'month') {
        const companyId = await this.getCompanyIdForUser(user.id, user.email);

        const now = new Date();
        const start = startDate ? new Date(startDate) : new Date(now.getFullYear(), 0, 1);
        const end = endDate ? new Date(endDate) : new Date(now.getFullYear() + 1, 0, 1);

        // Get all paid invoices for the period
        const invoices = await this.prisma.invoice.findMany({
            where: {
                companyId,
                status: InvoiceStatus.PAID,
                date: {
                    gte: start,
                    lt: end,
                },
            },
            select: {
                date: true,
                total: true,
            },
            orderBy: {
                date: 'asc',
            },
        });

        // Group data based on interval
        const dataMap = new Map<string, number>();

        // Helper to generate keys
        const getKey = (date: Date) => {
            if (interval === 'day') {
                return date.toLocaleDateString('fr-FR'); // DD/MM/YYYY
            } else if (interval === 'month') {
                return date.toLocaleString('fr-FR', { month: 'short', year: 'numeric' }); // janv. 2024
            } else {
                return date.getFullYear().toString(); // 2024
            }
        };

        // Initialize map with 0s if needed (optional, but good for charts)
        // For simplicity, we'll just group existing data first. 
        // To fill gaps, we'd need to iterate from start to end.
        // Let's implement gap filling for better charts.

        let current = new Date(start);
        while (current < end) {
            const key = getKey(current);
            if (!dataMap.has(key)) {
                dataMap.set(key, 0);
            }

            // Increment current date based on interval
            if (interval === 'day') {
                current.setDate(current.getDate() + 1);
            } else if (interval === 'month') {
                current.setMonth(current.getMonth() + 1);
            } else {
                current.setFullYear(current.getFullYear() + 1);
            }
        }

        invoices.forEach(invoice => {
            const key = getKey(invoice.date);
            // We might need to handle cases where invoice date is slightly off due to timezones, 
            // but for now relying on the same getKey function is safe.
            // However, if the map was initialized with "start of day/month", we need to match that.
            // The getKey function handles formatting, so it should match.

            if (dataMap.has(key)) {
                dataMap.set(key, (dataMap.get(key) || 0) + invoice.total);
            } else {
                // In case invoice falls outside the initialized range (shouldn't happen with correct query)
                dataMap.set(key, invoice.total);
            }
        });

        const chartData = Array.from(dataMap.entries()).map(([label, amount]) => ({
            label,
            amount,
        }));

        const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0);

        return {
            total: totalRevenue,
            data: chartData,
            interval,
        };
    }
}
