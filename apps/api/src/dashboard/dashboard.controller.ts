import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { SupabaseGuard } from '../auth/supabase.guard';

@Controller('dashboard')
@UseGuards(SupabaseGuard)
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) { }

    @Get('stats')
    getStats(@Request() req) {
        return this.dashboardService.getStats(req.user);
    }
}
