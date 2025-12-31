import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';

@Injectable()
export class InvoicesService {
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

    async create(createInvoiceDto: CreateInvoiceDto, user: any) {
        const companyId = await this.getCompanyIdForUser(user.id, user.email);
        const { clientId, items, dueDate } = createInvoiceDto;

        // Calculate totals
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

        // Generate Invoice Number
        const company = await this.prisma.company.findUnique({ where: { id: companyId } });
        if (!company) throw new NotFoundException('Company not found');

        const nextNumber = company.nextInvoiceNumber;
        const invoiceNumber = `${company.invoicePrefix}${new Date().getFullYear()}-${nextNumber.toString().padStart(3, '0')}`;

        // Update company counter
        await this.prisma.company.update({
            where: { id: companyId },
            data: { nextInvoiceNumber: nextNumber + 1 }
        });

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

    async findAll(user: any) {
        const companyId = await this.getCompanyIdForUser(user.id, user.email);

        return this.prisma.invoice.findMany({
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

    async findOne(id: string, user: any) {
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

    async update(id: string, updateInvoiceDto: UpdateInvoiceDto, user: any) {
        const companyId = await this.getCompanyIdForUser(user.id, user.email);

        // Verify existence and ownership
        const existingInvoice = await this.prisma.invoice.findFirst({
            where: { id, companyId },
        });

        if (!existingInvoice) {
            throw new NotFoundException('Invoice not found');
        }

        const { clientId, items, dueDate } = updateInvoiceDto;

        // Calculate totals
        let subtotal = 0;
        let tvaAmount = 0;
        let total = 0;
        let invoiceItemsData: any[] = [];

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

        // Prepare update data
        const data: any = {
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
}
