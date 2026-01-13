import { TriggerNode } from '../../TriggerNode.js';

export class WebhookTrigger extends TriggerNode {
  constructor() {
    super({
      id: 'webhook-trigger',
      name: 'Webhook',
      type: 'webhook-trigger',
      description: 'Triggers workflow when webhook receives a request',
      color: '#FF6B6B',
      shape: 'circle',
      icon: 'webhook',
      properties: [
        {
          name: 'httpMethod',
          displayName: 'HTTP Method',
          type: 'options',
          options: [
            { value: 'GET', label: 'GET' },
            { value: 'POST', label: 'POST' },
            { value: 'PUT', label: 'PUT' },
            { value: 'DELETE', label: 'DELETE' },
            { value: 'PATCH', label: 'PATCH' }
          ],
          default: 'POST',
          required: true
        },
        {
          name: 'path',
          displayName: 'Path',
          type: 'string',
          default: '',
          placeholder: 'webhook-path',
          required: true
        }
      ]
    });
  }

  async webhook(context) {
    const method = this.getNodeParameter(context, 'httpMethod');
    const webhookData = context.webhookData;

    return {
      webhookData: {
        method: webhookData.method,
        headers: webhookData.headers,
        params: webhookData.params,
        query: webhookData.query,
        body: webhookData.body
      }
    };
  }
}
