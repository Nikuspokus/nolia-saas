import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class SettingsService {
    constructor(private prisma: PrismaService) { }

    private async getCompanyIdForUser(supabaseId: string) {
        const user = await this.prisma.user.findUnique({
            where: { supabaseId },
            include: { company: true },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }

    async getSettings(user: any) {
        const userData = await this.getCompanyIdForUser(user.id);

        return {
            user: {
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
            },
            company: userData.company,
        };
    }

    async updateSettings(user: any, updateSettingsDto: UpdateSettingsDto) {
        const userData = await this.getCompanyIdForUser(user.id);

        // Update User
        if (updateSettingsDto.user) {
            await this.prisma.user.update({
                where: { id: userData.id },
                data: {
                    firstName: updateSettingsDto.user.firstName,
                    lastName: updateSettingsDto.user.lastName,
                },
            });
        }

        // Update Company
        if (updateSettingsDto.company) {
            await this.prisma.company.update({
                where: { id: userData.companyId },
                data: {
                    name: updateSettingsDto.company.name,
                    email: updateSettingsDto.company.email,
                    address: updateSettingsDto.company.address,
                    city: updateSettingsDto.company.city,
                    zipCode: updateSettingsDto.company.zipCode,
                    country: updateSettingsDto.company.country,
                    siret: updateSettingsDto.company.siret,
                    tvaNumber: updateSettingsDto.company.tvaNumber,
                    logoUrl: updateSettingsDto.company.logoUrl,
                    invoicePrefix: updateSettingsDto.company.invoicePrefix,
                    nextInvoiceNumber: updateSettingsDto.company.nextInvoiceNumber,
                },
            });
        }

        return this.getSettings(user);
    }
}
