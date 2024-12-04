import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { tryCatch } from '../../../utils/decorators/tryCatch';

class SES {
    private sesClient: SESClient;
    private defaultSender: string;

    constructor() {
        this.sesClient = new SESClient();
        this.defaultSender = process.env.AWS_SES_DEFAULT_SENDER_EMAIL || '';
    }

    @tryCatch('Failed to send email')
    public async sendEmail(subject: string, body: string, from: string = this.defaultSender, to: string[] = [], isHtml: boolean = false): Promise<void> {
        const params = {
            Destination: {
                ToAddresses: to,
            },
            Message: {
                Body: {
                    [isHtml ? 'Html' : 'Text']: {
                        Charset: "UTF-8",
                        Data: body,
                    },
                },
                Subject: {
                    Charset: "UTF-8",
                    Data: subject,
                },
            },
            Source: from,
        };

        const command = new SendEmailCommand(params);
        await this.sesClient.send(command);
    }
}

export default SES;
