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
exports.ClientsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ClientsService = class ClientsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getCompanyIdForUser(supabaseId, email) {
        console.log('getCompanyIdForUser (Clients)', { supabaseId, email });
        if (!email) {
            throw new Error('Email is required to create a company.');
        }
        try {
            let user = await this.prisma.user.findUnique({
                where: { supabaseId },
            });
            if (user) {
                return user.companyId;
            }
            user = await this.prisma.user.findUnique({
                where: { email },
            });
            if (user) {
                await this.prisma.user.update({
                    where: { id: user.id },
                    data: { supabaseId },
                });
                return user.companyId;
            }
            const newCompany = await this.prisma.company.create({
                data: {
                    name: 'My Company',
                    users: {
                        create: {
                            email: email,
                            supabaseId: supabaseId,
                            role: 'OWNER',
                        }
                    }
                },
                include: {
                    users: true
                }
            });
            return newCompany.id;
        }
        catch (error) {
            console.error('Error in getCompanyIdForUser (Clients):', error);
            throw error;
        }
    }
    async create(createClientDto, user) {
        const companyId = await this.getCompanyIdForUser(user.id, user.email);
        return this.prisma.client.create({
            data: {
                ...createClientDto,
                companyId: companyId,
            },
        });
    }
    async findAll(user) {
        const companyId = await this.getCompanyIdForUser(user.id, user.email);
        return this.prisma.client.findMany({
            where: {
                companyId: companyId,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async findOne(id, user) {
        const companyId = await this.getCompanyIdForUser(user.id, user.email);
        return this.prisma.client.findFirst({
            where: {
                id,
                companyId
            },
        });
    }
    async update(id, updateClientDto, user) {
        const companyId = await this.getCompanyIdForUser(user.id, user.email);
        const client = await this.prisma.client.findFirst({
            where: { id, companyId }
        });
        if (!client) {
            throw new Error('Client not found or access denied');
        }
        return this.prisma.client.update({
            where: { id },
            data: updateClientDto,
        });
    }
    async remove(id, user) {
        const companyId = await this.getCompanyIdForUser(user.id, user.email);
        const client = await this.prisma.client.findFirst({
            where: { id, companyId }
        });
        if (!client) {
            throw new Error('Client not found or access denied');
        }
        return this.prisma.client.delete({
            where: { id },
        });
    }
};
exports.ClientsService = ClientsService;
exports.ClientsService = ClientsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ClientsService);
//# sourceMappingURL=clients.service.js.map