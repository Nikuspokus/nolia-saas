import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { SupabaseGuard } from '../auth/supabase.guard';
import { User } from '../auth/user.decorator';

@Controller('clients')
@UseGuards(SupabaseGuard)
export class ClientsController {
    constructor(private readonly clientsService: ClientsService) { }

    @Post()
    create(@Body() createClientDto: CreateClientDto, @User() user: any) {
        return this.clientsService.create(createClientDto, user);
    }

    @Get()
    findAll(@User() user: any) {
        return this.clientsService.findAll(user);
    }

    @Get(':id')
    findOne(@Param('id') id: string, @User() user: any) {
        return this.clientsService.findOne(id, user);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateClientDto: UpdateClientDto, @User() user: any) {
        return this.clientsService.update(id, updateClientDto, user);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @User() user: any) {
        return this.clientsService.remove(id, user);
    }
}
