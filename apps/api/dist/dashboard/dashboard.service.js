"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let DashboardService = class DashboardService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getCompanyIdForUser(supabaseId, email) {
        console.log('getCompanyIdForUser (Dashboard)', { supabaseId, email });
        if (!email) {
            throw new Error('Email is required to create a company.');
        }
        try {
            let user = await this.prisma.user.findUnique({
                where: { supabaseId },
            });
            if (user) {
                return user.companyId;
            }
            user = await this.prisma.user.findUnique({
                where: { email },
            });
            if (user) {
                await this.prisma.user.update({
                    where: { id: user.id },
                    data: { supabaseId },
                });
                return user.companyId;
            }
            const newCompany = await this.prisma.company.create({
                data: {
                    name: 'My Company',
                    users: {
                        create: {
                            email: email,
                            supabaseId: supabaseId,
                            role: 'OWNER',
                        }
                    }
                },
                include: {
                    users: true
                }
            });
            return newCompany.id;
        }
        catch (error) {
            console.error('Error in getCompanyIdForUser (Dashboard):', error);
            throw error;
        }
    }
    async getStats(user) {
        const companyId = await this.getCompanyIdForUser(user.id, user.email);
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        const startOfCurrentMonth = new Date(currentYear, currentMonth, 1);
        const startOfNextMonth = new Date(currentYear, currentMonth + 1, 1);
        const startOfLastMonth = new Date(currentYear, currentMonth - 1, 1);
        const currentMonthRevenueAgg = await this.prisma.invoice.aggregate({
            _sum: {
                total: true,
            },
            where: {
                companyId,
                status: client_1.InvoiceStatus.PAID,
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
                status: client_1.InvoiceStatus.PAID,
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
        }
        else if (currentMonthRevenue > 0) {
            revenuePercentageChange = 100;
        }
        const pendingInvoicesCount = await this.prisma.invoice.count({
            where: {
                companyId,
                status: {
                    in: [client_1.InvoiceStatus.SENT, client_1.InvoiceStatus.FINALIZED, client_1.InvoiceStatus.OVERDUE],
                },
            },
        });
        const activeClientsCount = await this.prisma.client.count({
            where: {
                companyId,
            },
        });
        return {
            revenue: {
                amount: currentMonthRevenue,
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
    async getRevenueData(user, startDate, endDate, interval = 'month') {
        const companyId = await this.getCompanyIdForUser(user.id, user.email);
        const now = new Date();
        const start = startDate ? new Date(startDate) : new Date(now.getFullYear(), 0, 1);
        const end = endDate ? new Date(endDate) : new Date(now.getFullYear() + 1, 0, 1);
        const invoices = await this.prisma.invoice.findMany({
            where: {
                companyId,
                status: client_1.InvoiceStatus.PAID,
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
        const dataMap = new Map();
        const getKey = (date) => {
            if (interval === 'day') {
                return date.toLocaleDateString('fr-FR');
            }
            else if (interval === 'month') {
                return date.toLocaleString('fr-FR', { month: 'short', year: 'numeric' });
            }
            else {
                return date.getFullYear().toString();
            }
        };
        let current = new Date(start);
        while (current < end) {
            const key = getKey(current);
            if (!dataMap.has(key)) {
                dataMap.set(key, 0);
            }
            if (interval === 'day') {
                current.setDate(current.getDate() + 1);
            }
            else if (interval === 'month') {
                current.setMonth(current.getMonth() + 1);
            }
            else {
                current.setFullYear(current.getFullYear() + 1);
            }
        }
        invoices.forEach(invoice => {
            const key = getKey(invoice.date);
            if (dataMap.has(key)) {
                dataMap.set(key, (dataMap.get(key) || 0) + invoice.total);
            }
            else {
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
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map