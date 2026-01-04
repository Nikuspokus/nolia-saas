import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';

@Injectable()
export class ClientsService {
    constructor(private prisma: PrismaService) { }

    private async getCompanyIdForUser(supabaseId: string, email: string) {
        console.log('getCompanyIdForUser (Clients)', { supabaseId, email });

        if (!email) {
            throw new Error('Email is required to create a company.');
        }

        try {
            // 1. Try to find existing user by Supabase ID
            let user = await this.prisma.user.findUnique({
                where: { supabaseId },
            });

            if (user) {
                return user.companyId;
            }

            // 2. Try to find by Email (to prevent unique constraint error)
            user = await this.prisma.user.findUnique({
                where: { email },
            });

            if (user) {
                // Link the new Supabase ID to the existing user
                await this.prisma.user.update({
                    where: { id: user.id },
                    data: { supabaseId },
                });
                return user.companyId;
            }

            // 3. If not found, create User and Company (JIT Provisioning)
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
            console.error('Error in getCompanyIdForUser (Clients):', error);
            throw error;
        }
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
