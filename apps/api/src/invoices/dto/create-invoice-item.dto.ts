export class CreateInvoiceItemDto {
    description: string;
    quantity: number;
    unitPrice: number; // In cents
    tvaRate: number;
}
