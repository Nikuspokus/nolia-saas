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
exports.InvoicesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let InvoicesService = class InvoicesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getCompanyIdForUser(supabaseId, email) {
        console.log('getCompanyIdForUser', { supabaseId, email });
        if (!email) {
            console.error('Email is missing for user:', supabaseId);
            throw new Error('Email is required to create a company.');
        }
        try {
            let user = await this.prisma.user.findUnique({
                where: { supabaseId },
            });
            console.log('Found user by ID:', user?.id);
            if (user) {
                return user.companyId;
            }
            user = await this.prisma.user.findUnique({
                where: { email },
            });
            console.log('Found user by Email:', user?.id);
            if (user) {
                await this.prisma.user.update({
                    where: { id: user.id },
                    data: { supabaseId },
                });
                return user.companyId;
            }
            console.log('Creating new company and user');
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
            console.error('Error in getCompanyIdForUser:', error);
            throw error;
        }
    }
    async create(createInvoiceDto, user) {
        const companyId = await this.getCompanyIdForUser(user.id, user.email);
        const { clientId, items, dueDate } = createInvoiceDto;
        let subtotal = 0;
        let tvaAmount = 0;
        let total = 0;
        const invoiceItemsData = items.map((item) => {
            const itemTotal = item.unitPrice * item.quantity;
            const itemTva = itemTotal * (item.tvaRate / 100);
            subtotal += itemTotal;
            tvaAmount += itemTva;
            return {
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                tvaRate: item.tvaRate,
                total: itemTotal,
            };
        });
        total = subtotal + tvaAmount;
        const updatedCompany = await this.prisma.company.update({
            where: { id: companyId },
            data: { nextInvoiceNumber: { increment: 1 } }
        });
        const invoiceSequence = updatedCompany.nextInvoiceNumber - 1;
        const invoiceNumber = `${updatedCompany.invoicePrefix}${new Date().getFullYear()}-${invoiceSequence.toString().padStart(3, '0')}`;
        return this.prisma.invoice.create({
            data: {
                companyId: companyId,
                clientId,
                number: invoiceNumber,
                date: new Date(),
                dueDate: dueDate ? new Date(dueDate) : null,
                subtotal: Math.round(subtotal),
                tvaAmount: Math.round(tvaAmount),
                total: Math.round(total),
                items: {
                    create: invoiceItemsData,
                },
            },
            include: {
                items: true,
                client: true,
            },
        });
    }
    async findAll(user) {
        console.log('findAll user:', user);
        if (!user || !user.id) {
            console.error('User is missing or invalid in findAll');
            throw new common_1.BadRequestException('User authentication failed');
        }
        try {
            const companyId = await this.getCompanyIdForUser(user.id, user.email);
            return await this.prisma.invoice.findMany({
                where: {
                    companyId: companyId,
                },
                include: {
                    client: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });
        }
        catch (error) {
            console.error('Error in findAll:', error);
            throw error;
        }
    }
    async findOne(id, user) {
        const companyId = await this.getCompanyIdForUser(user.id, user.email);
        return this.prisma.invoice.findFirst({
            where: {
                id,
                companyId: companyId,
            },
            include: {
                items: true,
                client: true,
            },
        });
    }
    async update(id, updateInvoiceDto, user) {
        const companyId = await this.getCompanyIdForUser(user.id, user.email);
        const existingInvoice = await this.prisma.invoice.findFirst({
            where: { id, companyId },
        });
        if (!existingInvoice) {
            throw new common_1.NotFoundException('Invoice not found');
        }
        const { clientId, items, dueDate } = updateInvoiceDto;
        let subtotal = 0;
        let tvaAmount = 0;
        let total = 0;
        let invoiceItemsData = [];
        if (items) {
            invoiceItemsData = items.map((item) => {
                const itemTotal = item.unitPrice * item.quantity;
                const itemTva = itemTotal * (item.tvaRate / 100);
                subtotal += itemTotal;
                tvaAmount += itemTva;
                return {
                    description: item.description,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    tvaRate: item.tvaRate,
                    total: itemTotal,
                };
            });
            total = subtotal + tvaAmount;
        }
        const data = {
            clientId,
            dueDate: dueDate ? new Date(dueDate) : undefined,
        };
        if (items) {
            data.subtotal = Math.round(subtotal);
            data.tvaAmount = Math.round(tvaAmount);
            data.total = Math.round(total);
            data.items = {
                deleteMany: {},
                create: invoiceItemsData,
            };
        }
        return this.prisma.invoice.update({
            where: { id },
            data,
            include: {
                items: true,
                client: true,
            },
        });
    }
};
exports.InvoicesService = InvoicesService;
exports.InvoicesService = InvoicesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InvoicesService);
//# sourceMappingURL=invoices.service.js.map