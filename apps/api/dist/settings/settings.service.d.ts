import { PrismaService } from '../prisma/prisma.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
export declare class SettingsService {
    private prisma;
    constructor(prisma: PrismaService);
    private getCompanyIdForUser;
    getSettings(user: any): Promise<{
        user: {
            firstName: string | null;
            lastName: string | null;
            email: string;
        };
        company: {
            id: string;
            email: string | null;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            address: string | null;
            city: string | null;
            zipCode: string | null;
            country: string;
            siret: string | null;
            tvaNumber: string | null;
            logoUrl: string | null;
            stripeAccountId: string | null;
            invoicePrefix: string;
            nextInvoiceNumber: number;
        };
    }>;
    updateSettings(user: any, updateSettingsDto: UpdateSettingsDto): Promise<{
        user: {
            firstName: string | null;
            lastName: string | null;
            email: string;
        };
        company: {
            id: string;
            email: string | null;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            address: string | null;
            city: string | null;
            zipCode: string | null;
            country: string;
            siret: string | null;
            tvaNumber: string | null;
            logoUrl: string | null;
            stripeAccountId: string | null;
            invoicePrefix: string;
            nextInvoiceNumber: number;
        };
    }>;
}
