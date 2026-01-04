import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';

@Injectable()
export class InvoicesService {
    constructor(private prisma: PrismaService) { }

    private async getCompanyIdForUser(supabaseId: string, email: string) {
        console.log('getCompanyIdForUser', { supabaseId, email });

        if (!email) {
            console.error('Email is missing for user:', supabaseId);
            throw new Error('Email is required to create a company.');
        }

        try {
            // 1. Try to find existing user by Supabase ID
            let user = await this.prisma.user.findUnique({
                where: { supabaseId },
            });
            console.log('Found user by ID:', user?.id);

            if (user) {
                return user.companyId;
            }

            // 2. Try to find by Email (to prevent unique constraint error)
            user = await this.prisma.user.findUnique({
                where: { email },
            });
            console.log('Found user by Email:', user?.id);

            if (user) {
                // Link the new Supabase ID to the existing user
                await this.prisma.user.update({
                    where: { id: user.id },
                    data: { supabaseId },
                });
                return user.companyId;
            }

            // 3. If not found, create User and Company (JIT Provisioning)
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
        } catch (error) {
            console.error('Error in getCompanyIdForUser:', error);
            throw error;
        }
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
        // Generate Invoice Number with Atomic Increment to prevent Race Conditions
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

    async findAll(user: any) {
        console.log('findAll user:', user);

        if (!user || !user.id) {
            console.error('User is missing or invalid in findAll');
            throw new BadRequestException('User authentication failed');
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
        } catch (error) {
            console.error('Error in findAll:', error);
            throw error;
        }
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
