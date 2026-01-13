import { ActionNode } from '../../ActionNode.js';

export class SendSMS extends ActionNode {
  constructor() {
    super({
      id: 'send-sms',
      name: 'Send SMS',
      type: 'send-sms',
      description: 'Send SMS messages',
      color: '#25D366',
      shape: 'rectangle',
      icon: 'message',
      properties: [
        {
          name: 'to',
          displayName: 'To',
          type: 'string',
          default: '',
          placeholder: '+1234567890',
          required: true
        },
        {
          name: 'message',
          displayName: 'Message',
          type: 'string',
          default: '',
          required: true
        }
      ],
      credentials: [
        {
          name: 'sms',
          required: true
        }
      ]
    });
  }

  async execute(context) {
    const to = this.getNodeParameter(context, 'to');
    const message = this.getNodeParameter(context, 'message');

    return {
      success: true,
      to,
      message,
      sentAt: new Date().toISOString()
    };
  }
}
