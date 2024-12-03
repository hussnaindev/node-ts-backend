import { CloudWatchLogsClient, CreateLogGroupCommand, CreateLogStreamCommand, DescribeLogStreamsCommand, PutLogEventsCommand } from '@aws-sdk/client-cloudwatch-logs';
import { tryCatch } from '../../../utils/decorators/tryCatch';

class Cloudwatch {
    private cloudwatchLogs: CloudWatchLogsClient;
    private logGroupName: string;
    private logStreamName: string;

    constructor(logGroupName: string, logStreamName: string) {
        this.cloudwatchLogs = new CloudWatchLogsClient();
        this.logGroupName = logGroupName;
        this.logStreamName = logStreamName;
    }

    @tryCatch('')
    private async createLogGroup(): Promise<void> {
        const command = new CreateLogGroupCommand({ logGroupName: this.logGroupName });
        await this.cloudwatchLogs.send(command);
    }

    @tryCatch('')
    private async createLogStream(): Promise<void> {
        const command = new CreateLogStreamCommand({
            logGroupName: this.logGroupName,
            logStreamName: this.logStreamName,
        });
        await this.cloudwatchLogs.send(command);
    }

    @tryCatch('Failed to send log')
    public async sendLog(message: string): Promise<void> {

        const logEvents = [
            {
                message,
                timestamp: Date.now(),
            },
        ];

        const sequenceToken = await this.getSequenceToken();
        const command = new PutLogEventsCommand({
            logGroupName: this.logGroupName,
            logStreamName: this.logStreamName,
            logEvents,
            sequenceToken,
        });

        await this.cloudwatchLogs.send(command);
    }

    @tryCatch('')
    private async getSequenceToken(): Promise<string | undefined> {
        const command = new DescribeLogStreamsCommand({
            logGroupName: this.logGroupName,
            logStreamNamePrefix: this.logStreamName,
        });

        const result = await this.cloudwatchLogs.send(command);
        const logStream = result.logStreams?.find((stream) => stream.logStreamName === this.logStreamName);

        return logStream?.uploadSequenceToken;
    }
}

export default Cloudwatch;
