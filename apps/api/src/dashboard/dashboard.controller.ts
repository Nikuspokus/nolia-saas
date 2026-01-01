import { Controller, Get, UseGuards, Request, Query } from '@nestjs/common';
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

    @Get('revenue')
    @Get('revenue')
    getRevenueData(
        @Request() req,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('interval') interval?: 'day' | 'month' | 'year',
    ) {
        return this.dashboardService.getRevenueData(req.user, startDate, endDate, interval);
    }
}
