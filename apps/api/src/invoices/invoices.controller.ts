import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { SupabaseGuard } from '../auth/supabase.guard';
import { User } from '../auth/user.decorator';

@Controller('invoices')
@UseGuards(SupabaseGuard)
export class InvoicesController {
    constructor(private readonly invoicesService: InvoicesService) { }

    @Post()
    create(@Body() createInvoiceDto: CreateInvoiceDto, @User() user: any) {
        return this.invoicesService.create(createInvoiceDto, user);
    }

    @Get()
    findAll(@User() user: any) {
        return this.invoicesService.findAll(user);
    }

    @Get(':id')
    findOne(@Param('id') id: string, @User() user: any) {
        return this.invoicesService.findOne(id, user);
    }

    @Post(':id')
    update(@Param('id') id: string, @Body() updateInvoiceDto: UpdateInvoiceDto, @User() user: any) {
        return this.invoicesService.update(id, updateInvoiceDto, user);
    }
}
