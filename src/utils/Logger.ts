import { ENV } from "../constants/constants";
import Cloudwatch from "../integrations/aws/cloudwatch/Cloudwatch";

class Logger {
    private cloudwatch: Cloudwatch;
    private reqId: string | null;
    private env: string;

    constructor(logGroupName: string, logStreamName: string, reqId?: string) {
        this.cloudwatch = new Cloudwatch(logGroupName, logStreamName);
        this.env = process.env.ENV || 'dev';
        this.reqId = reqId || null;
    }

    private stringifyData(data: any): string {
        try {
            if (Array.isArray(data)) {
                return `${JSON.stringify(data, null, 2)}`;
            }
            if (typeof data === 'object' && data !== null) {
                return `${JSON.stringify(data, null, 2)}`;
            }
            return JSON.stringify(data); // For primitive types
        } catch (error) {
            // Fallback for circular references or unstringifiable objects
            return String(data);
        }
    }

    public async info(message: string): Promise<void> {
        const logMessage = this.reqId ? `[INFO] [Request ID: ${this.reqId}]: ${message}` : `[INFO]: ${message}`;
        this.env === ENV.PROD ? await this.cloudwatch.sendLog(logMessage) : console.log(logMessage);
    }

    public async error(message: string): Promise<void> {
        const logMessage = this.reqId ? `[ERROR] [Request ID: ${this.reqId}]: ${message}` : `[ERROR]: ${message}`;
        this.env === ENV.PROD ? await this.cloudwatch.sendLog(logMessage) : console.error(logMessage);
    }

    public async debug(message: string, data?: any): Promise<void> {
        const logMessage = this.reqId ? `[DEBUG] [Request ID: ${this.reqId}]: ${message}` : `[DEBUG]: ${message}`;
        const dataString = data ? ` ${this.stringifyData(data)}` : '';
        this.env === ENV.PROD ? await this.cloudwatch.sendLog(logMessage + dataString) : console.debug(logMessage + dataString);
    }

    public async warn(message: string): Promise<void> {
        const logMessage = this.reqId ? `[WARN] [Request ID: ${this.reqId}]: ${message}` : `[WARN]: ${message}`;
        this.env === ENV.PROD ? await this.cloudwatch.sendLog(logMessage) : console.warn(logMessage);
    }
}

export default Logger;
