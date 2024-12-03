import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { tryCatch } from '../../../utils/decorators/tryCatch';

class SES {
    private sesClient: SESClient;

    constructor() {
        this.sesClient = new SESClient();
    }

    @tryCatch('Failed to send email')
    public async sendEmail(from: string, to: string[], subject: string, body: string, isHtml: boolean = false): Promise<void> {
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
