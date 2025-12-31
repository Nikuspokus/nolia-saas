import { Controller, Get, Patch, Body, UseGuards, Request } from '@nestjs/common';
// Force refresh
import { SettingsService } from '../settings/settings.service';
import { SupabaseGuard } from '../auth/supabase.guard';
import { UpdateSettingsDto } from '../settings/dto/update-settings.dto';

@Controller('settings')
@UseGuards(SupabaseGuard)
export class SettingsController {
    constructor(private readonly settingsService: SettingsService) { }

    @Get()
    getSettings(@Request() req) {
        return this.settingsService.getSettings(req.user);
    }

    @Patch()
    updateSettings(@Request() req, @Body() updateSettingsDto: UpdateSettingsDto) {
        return this.settingsService.updateSettings(req.user, updateSettingsDto);
    }
}
