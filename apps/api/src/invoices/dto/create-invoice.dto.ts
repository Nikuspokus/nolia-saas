import { CreateInvoiceItemDto } from './create-invoice-item.dto';

export class CreateInvoiceDto {
    clientId: string;
    dueDate?: string; // ISO Date string
    items: CreateInvoiceItemDto[];
}
