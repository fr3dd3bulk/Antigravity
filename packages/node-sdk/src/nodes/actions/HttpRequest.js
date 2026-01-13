import { ActionNode } from '../../ActionNode.js';

export class HttpRequest extends ActionNode {
  constructor() {
    super({
      id: 'http-request',
      name: 'HTTP Request',
      type: 'http-request',
      description: 'Make HTTP requests to any API',
      color: '#0080FF',
      shape: 'rectangle',
      icon: 'globe',
      properties: [
        {
          name: 'method',
          displayName: 'Method',
          type: 'options',
          options: [
            { value: 'GET', label: 'GET' },
            { value: 'POST', label: 'POST' },
            { value: 'PUT', label: 'PUT' },
            { value: 'DELETE', label: 'DELETE' },
            { value: 'PATCH', label: 'PATCH' }
          ],
          default: 'GET',
          required: true
        },
        {
          name: 'url',
          displayName: 'URL',
          type: 'string',
          default: '',
          placeholder: 'https://api.example.com/endpoint',
          required: true
        },
        {
          name: 'headers',
          displayName: 'Headers',
          type: 'json',
          default: '{}',
          description: 'Request headers as JSON object'
        },
        {
          name: 'body',
          displayName: 'Body',
          type: 'json',
          default: '{}',
          description: 'Request body for POST/PUT/PATCH requests'
        }
      ]
    });
  }

  async execute(context) {
    const method = this.getNodeParameter(context, 'method');
    const url = this.getNodeParameter(context, 'url');
    const headers = this.getNodeParameter(context, 'headers', '{}');
    const body = this.getNodeParameter(context, 'body', '{}');

    const helpers = await this.helpers(context);
    
    try {
      const options = {
        method,
        url,
        headers: typeof headers === 'string' ? JSON.parse(headers) : headers,
      };

      if (['POST', 'PUT', 'PATCH'].includes(method)) {
        options.data = typeof body === 'string' ? JSON.parse(body) : body;
      }

      const response = await helpers.httpRequest(options);

      return {
        success: true,
        data: response.data,
        status: response.status,
        headers: response.headers
      };
    } catch (error) {
      return await this.onError(error, context);
    }
  }
}
