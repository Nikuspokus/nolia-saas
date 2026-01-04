import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare class SupabaseGuard implements CanActivate {
    private supabase;
    constructor();
    canActivate(context: ExecutionContext): Promise<boolean>;
    private extractTokenFromHeader;
}
