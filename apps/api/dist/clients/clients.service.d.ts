import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
export declare class ClientsService {
    private prisma;
    constructor(prisma: PrismaService);
    private getCompanyIdForUser;
    create(createClientDto: CreateClientDto, user: any): Promise<{
        id: string;
        email: string | null;
        companyId: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        address: string | null;
        city: string | null;
        zipCode: string | null;
        country: string;
        tvaNumber: string | null;
    }>;
    findAll(user: any): Promise<{
        id: string;
        email: string | null;
        companyId: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        address: string | null;
        city: string | null;
        zipCode: string | null;
        country: string;
        tvaNumber: string | null;
    }[]>;
    findOne(id: string, user: any): Promise<{
        id: string;
        email: string | null;
        companyId: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        address: string | null;
        city: string | null;
        zipCode: string | null;
        country: string;
        tvaNumber: string | null;
    } | null>;
    update(id: string, updateClientDto: any, user: any): Promise<{
        id: string;
        email: string | null;
        companyId: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        address: string | null;
        city: string | null;
        zipCode: string | null;
        country: string;
        tvaNumber: string | null;
    }>;
    remove(id: string, user: any): Promise<{
        id: string;
        email: string | null;
        companyId: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        address: string | null;
        city: string | null;
        zipCode: string | null;
        country: string;
        tvaNumber: string | null;
    }>;
}
