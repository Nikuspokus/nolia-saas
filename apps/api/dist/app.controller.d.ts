import { AppService } from './app.service';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getHello(): string;
    checkHealth(): Promise<{
        status: string;
        userCount: number;
        message?: undefined;
    } | {
        status: string;
        message: any;
        userCount?: undefined;
    }>;
}
