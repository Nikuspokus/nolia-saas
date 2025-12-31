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
}
