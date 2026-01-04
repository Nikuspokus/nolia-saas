"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SettingsService = class SettingsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getCompanyIdForUser(supabaseId) {
        const user = await this.prisma.user.findUnique({
            where: { supabaseId },
            include: { company: true },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async getSettings(user) {
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
    async updateSettings(user, updateSettingsDto) {
        const userData = await this.getCompanyIdForUser(user.id);
        if (updateSettingsDto.user) {
            await this.prisma.user.update({
                where: { id: userData.id },
                data: {
                    firstName: updateSettingsDto.user.firstName,
                    lastName: updateSettingsDto.user.lastName,
                },
            });
        }
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
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SettingsService);
//# sourceMappingURL=settings.service.js.map