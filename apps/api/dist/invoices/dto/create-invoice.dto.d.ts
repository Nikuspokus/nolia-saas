import { CreateInvoiceItemDto } from './create-invoice-item.dto';
export declare class CreateInvoiceDto {
    clientId: string;
    dueDate?: string;
    items: CreateInvoiceItemDto[];
}
