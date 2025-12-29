import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';

@Injectable()
export class ClientsService {
    constructor(private prisma: PrismaService) { }

    // TODO: Replace with actual company ID from auth context
    private readonly HARDCODED_COMPANY_ID = 'default-company-id';

    async create(createClientDto: CreateClientDto) {
        // Ensure a default company exists for now
        let companyId = this.HARDCODED_COMPANY_ID;

        // Check if company exists, if not create a dummy one (for development)
        const company = await this.prisma.company.findUnique({ where: { id: companyId } });
        if (!company) {
            const newCompany = await this.prisma.company.create({
                data: {
                    id: companyId,
                    name: 'My Default Company',
                }
            });
            companyId = newCompany.id;
        }

        return this.prisma.client.create({
            data: {
                ...createClientDto,
                companyId: companyId,
            },
        });
    }

    async findAll() {
        return this.prisma.client.findMany({
            where: {
                companyId: this.HARDCODED_COMPANY_ID,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async findOne(id: string) {
        return this.prisma.client.findUnique({
            where: { id },
        });
    }
}
