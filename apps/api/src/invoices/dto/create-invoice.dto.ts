import { CreateInvoiceItemDto } from './create-invoice-item.dto';
import { IsArray, IsDateString, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateInvoiceDto {
    @IsString()
    clientId: string;

    @IsOptional()
    @IsDateString()
    dueDate?: string; // ISO Date string

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateInvoiceItemDto)
    items: CreateInvoiceItemDto[];
}
