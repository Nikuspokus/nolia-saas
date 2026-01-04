import { IsNumber, IsPositive, IsString, Min } from 'class-validator';

export class CreateInvoiceItemDto {
    @IsString()
    description: string;

    @IsNumber()
    @IsPositive()
    quantity: number;

    @IsNumber()
    @Min(0)
    unitPrice: number; // In cents

    @IsNumber()
    @Min(0)
    tvaRate: number;
}
