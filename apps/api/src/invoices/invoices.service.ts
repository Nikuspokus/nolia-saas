import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';

@Injectable()
export class InvoicesService {
    constructor(private prisma: PrismaService) { }

    private readonly HARDCODED_COMPANY_ID = 'default-company-id';

    async create(createInvoiceDto: CreateInvoiceDto) {
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

        // Generate Invoice Number (Simple increment for now)
        // In a real app, use a transaction to safely increment the counter on Company model
        const company = await this.prisma.company.findUnique({ where: { id: this.HARDCODED_COMPANY_ID } });
        if (!company) throw new NotFoundException('Company not found');

        const nextNumber = company.nextInvoiceNumber;
        const invoiceNumber = `${company.invoicePrefix}${new Date().getFullYear()}-${nextNumber.toString().padStart(3, '0')}`;

        // Update company counter
        await this.prisma.company.update({
            where: { id: this.HARDCODED_COMPANY_ID },
            data: { nextInvoiceNumber: nextNumber + 1 }
        });

        return this.prisma.invoice.create({
            data: {
                companyId: this.HARDCODED_COMPANY_ID,
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

    async findAll() {
        return this.prisma.invoice.findMany({
            where: {
                companyId: this.HARDCODED_COMPANY_ID,
            },
            include: {
                client: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async findOne(id: string) {
        return this.prisma.invoice.findUnique({
            where: { id },
            include: {
                items: true,
                client: true,
            },
        });
    }
}
