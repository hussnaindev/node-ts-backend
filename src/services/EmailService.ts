import { tryCatch } from "../utils/decorators/tryCatch";
const sgMail = require('@sendgrid/mail');

export class EmailService {
    constructor() {
        sgMail.setApiKey(process.env.SENDGRID_EMAIL_API_KEY || '');
    }

    @tryCatch('Failed to send email')
    async sendEmail(to: string, subject: string, htmlContent: string) {
        const msg = {
            to,
            from: process.env.SENDER_EMAIL,
            subject,
            html: htmlContent,
        };

        await sgMail.send(msg);
    }
}