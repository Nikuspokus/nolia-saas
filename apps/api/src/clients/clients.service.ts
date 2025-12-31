import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';

@Injectable()
export class ClientsService {
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
        // In a real app, you might want to separate this or use webhooks
        const newCompany = await this.prisma.company.create({
            data: {
                name: 'My Company', // Default name, user can change later
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

    async create(createClientDto: CreateClientDto, user: any) {
        const companyId = await this.getCompanyIdForUser(user.id, user.email);

        return this.prisma.client.create({
            data: {
                ...createClientDto,
                companyId: companyId,
            },
        });
    }

    async findAll(user: any) {
        const companyId = await this.getCompanyIdForUser(user.id, user.email);

        return this.prisma.client.findMany({
            where: {
                companyId: companyId,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async findOne(id: string, user: any) {
        const companyId = await this.getCompanyIdForUser(user.id, user.email);

        return this.prisma.client.findFirst({
            where: {
                id,
                companyId // Ensure tenant isolation
            },
        });
    }

    async update(id: string, updateClientDto: any, user: any) {
        const companyId = await this.getCompanyIdForUser(user.id, user.email);

        // Verify ownership implicitly via where clause if we used updateMany, 
        // but for update unique we need to check existence first or use a composite ID approach if supported.
        // Simplest here: findFirst then update.
        const client = await this.prisma.client.findFirst({
            where: { id, companyId }
        });

        if (!client) {
            throw new Error('Client not found or access denied');
        }

        return this.prisma.client.update({
            where: { id },
            data: updateClientDto,
        });
    }

    async remove(id: string, user: any) {
        const companyId = await this.getCompanyIdForUser(user.id, user.email);

        const client = await this.prisma.client.findFirst({
            where: { id, companyId }
        });

        if (!client) {
            throw new Error('Client not found or access denied');
        }

        return this.prisma.client.delete({
            where: { id },
        });
    }
}
