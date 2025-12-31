export class UpdateSettingsDto {
    user?: {
        firstName?: string;
        lastName?: string;
    };
    company?: {
        name?: string;
        email?: string;
        address?: string;
        city?: string;
        zipCode?: string;
        country?: string;
        siret?: string;
        tvaNumber?: string;
        logoUrl?: string;
        invoicePrefix?: string;
        nextInvoiceNumber?: number;
    };
}
