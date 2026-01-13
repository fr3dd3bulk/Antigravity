import { ActionNode } from '../../ActionNode.js';
import nodemailer from 'nodemailer';

export class SendEmail extends ActionNode {
  constructor() {
    super({
      id: 'send-email',
      name: 'Send Email',
      type: 'send-email',
      description: 'Send emails via SMTP',
      color: '#EA4335',
      shape: 'rectangle',
      icon: 'envelope',
      properties: [
        {
          name: 'to',
          displayName: 'To',
          type: 'string',
          default: '',
          placeholder: 'recipient@example.com',
          required: true
        },
        {
          name: 'subject',
          displayName: 'Subject',
          type: 'string',
          default: '',
          required: true
        },
        {
          name: 'body',
          displayName: 'Body',
          type: 'string',
          default: '',
          required: true
        },
        {
          name: 'html',
          displayName: 'Is HTML',
          type: 'boolean',
          default: false
        }
      ],
      credentials: [
        {
          name: 'smtp',
          required: true
        }
      ]
    });
  }

  async execute(context) {
    const to = this.getNodeParameter(context, 'to');
    const subject = this.getNodeParameter(context, 'subject');
    const body = this.getNodeParameter(context, 'body');
    const isHtml = this.getNodeParameter(context, 'html', false);

    const credentials = this.getCredentials(context, 'smtp');

    try {
      const transporter = nodemailer.createTransporter({
        host: credentials.host || process.env.SMTP_HOST,
        port: credentials.port || process.env.SMTP_PORT,
        secure: credentials.secure || false,
        auth: {
          user: credentials.user || process.env.SMTP_USER,
          pass: credentials.pass || process.env.SMTP_PASS
        }
      });

      const mailOptions = {
        from: credentials.from || process.env.SMTP_USER,
        to,
        subject,
        [isHtml ? 'html' : 'text']: body
      };

      const result = await transporter.sendMail(mailOptions);

      return {
        success: true,
        messageId: result.messageId,
        to,
        subject
      };
    } catch (error) {
      return await this.onError(error, context);
    }
  }
}
