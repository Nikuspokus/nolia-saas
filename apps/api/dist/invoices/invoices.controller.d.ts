import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
export declare class InvoicesController {
    private readonly invoicesService;
    constructor(invoicesService: InvoicesService);
    create(createInvoiceDto: CreateInvoiceDto, user: any): Promise<{
        client: {
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
        };
        items: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string;
            quantity: import("@prisma/client/runtime/library").Decimal;
            unitPrice: number;
            tvaRate: import("@prisma/client/runtime/library").Decimal;
            total: number;
            invoiceId: string;
        }[];
    } & {
        number: string;
        id: string;
        companyId: string;
        createdAt: Date;
        updatedAt: Date;
        clientId: string;
        dueDate: Date | null;
        status: import("@prisma/client").$Enums.InvoiceStatus;
        date: Date;
        subtotal: number;
        tvaAmount: number;
        total: number;
        pdfUrl: string | null;
        stripePaymentLink: string | null;
    }>;
    findAll(user: any): Promise<({
        client: {
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
        };
    } & {
        number: string;
        id: string;
        companyId: string;
        createdAt: Date;
        updatedAt: Date;
        clientId: string;
        dueDate: Date | null;
        status: import("@prisma/client").$Enums.InvoiceStatus;
        date: Date;
        subtotal: number;
        tvaAmount: number;
        total: number;
        pdfUrl: string | null;
        stripePaymentLink: string | null;
    })[]>;
    findOne(id: string, user: any): Promise<({
        client: {
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
        };
        items: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string;
            quantity: import("@prisma/client/runtime/library").Decimal;
            unitPrice: number;
            tvaRate: import("@prisma/client/runtime/library").Decimal;
            total: number;
            invoiceId: string;
        }[];
    } & {
        number: string;
        id: string;
        companyId: string;
        createdAt: Date;
        updatedAt: Date;
        clientId: string;
        dueDate: Date | null;
        status: import("@prisma/client").$Enums.InvoiceStatus;
        date: Date;
        subtotal: number;
        tvaAmount: number;
        total: number;
        pdfUrl: string | null;
        stripePaymentLink: string | null;
    }) | null>;
    update(id: string, updateInvoiceDto: UpdateInvoiceDto, user: any): Promise<{
        client: {
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
        };
        items: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string;
            quantity: import("@prisma/client/runtime/library").Decimal;
            unitPrice: number;
            tvaRate: import("@prisma/client/runtime/library").Decimal;
            total: number;
            invoiceId: string;
        }[];
    } & {
        number: string;
        id: string;
        companyId: string;
        createdAt: Date;
        updatedAt: Date;
        clientId: string;
        dueDate: Date | null;
        status: import("@prisma/client").$Enums.InvoiceStatus;
        date: Date;
        subtotal: number;
        tvaAmount: number;
        total: number;
        pdfUrl: string | null;
        stripePaymentLink: string | null;
    }>;
}
