import { ActionNode } from '../../ActionNode.js';

export class TextSummarize extends ActionNode {
  constructor() {
    super({
      id: 'text-summarize',
      name: 'Text Summarize (AI)',
      type: 'text-summarize',
      description: 'Summarize text using AI',
      color: '#8E44AD',
      shape: 'hexagon',
      icon: 'brain',
      properties: [
        {
          name: 'text',
          displayName: 'Text',
          type: 'string',
          default: '',
          required: true
        },
        {
          name: 'maxLength',
          displayName: 'Max Length',
          type: 'number',
          default: 100
        }
      ],
      credentials: [
        {
          name: 'ai-api',
          required: true
        }
      ]
    });
  }

  async execute(context) {
    const text = this.getNodeParameter(context, 'text');
    const maxLength = this.getNodeParameter(context, 'maxLength', 100);
    const credentials = this.getCredentials(context, 'ai-api');

    const helpers = await this.helpers(context);

    try {
      const response = await helpers.httpRequest({
        method: 'POST',
        url: credentials.endpoint || 'https://api.openai.com/v1/completions',
        headers: {
          'Authorization': `Bearer ${credentials.apiKey}`,
          'Content-Type': 'application/json'
        },
        data: {
          prompt: `Summarize the following text in ${maxLength} words or less:\n\n${text}`,
          max_tokens: maxLength,
          temperature: 0.5
        }
      });

      return {
        success: true,
        summary: response.data.choices?.[0]?.text?.trim() || text.substring(0, maxLength),
        originalLength: text.length
      };
    } catch (error) {
      return {
        success: true,
        summary: text.substring(0, maxLength) + '...',
        error: 'AI service unavailable, using fallback'
      };
    }
  }
}
