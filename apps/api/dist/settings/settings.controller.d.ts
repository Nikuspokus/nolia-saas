import { SettingsService } from '../settings/settings.service';
import { UpdateSettingsDto } from '../settings/dto/update-settings.dto';
export declare class SettingsController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
    getSettings(req: any): Promise<{
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
    updateSettings(req: any, updateSettingsDto: UpdateSettingsDto): Promise<{
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
