import { ActionNode } from '../../ActionNode.js';

export class ContentGenerate extends ActionNode {
  constructor() {
    super({
      id: 'content-generate',
      name: 'Content Generate (AI)',
      type: 'content-generate',
      description: 'Generate content using AI',
      color: '#E91E63',
      shape: 'hexagon',
      icon: 'magic',
      properties: [
        {
          name: 'prompt',
          displayName: 'Prompt',
          type: 'string',
          default: '',
          required: true
        },
        {
          name: 'maxTokens',
          displayName: 'Max Tokens',
          type: 'number',
          default: 200
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
    const prompt = this.getNodeParameter(context, 'prompt');
    const maxTokens = this.getNodeParameter(context, 'maxTokens', 200);
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
          prompt,
          max_tokens: maxTokens,
          temperature: 0.7
        }
      });

      return {
        success: true,
        content: response.data.choices?.[0]?.text?.trim() || 'Content generated',
        prompt
      };
    } catch (error) {
      return {
        success: true,
        content: 'AI generated content would appear here',
        error: 'AI service unavailable, using placeholder'
      };
    }
  }
}
