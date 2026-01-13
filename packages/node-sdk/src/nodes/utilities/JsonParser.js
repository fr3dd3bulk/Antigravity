import { ActionNode } from '../../ActionNode.js';

export class JsonParser extends ActionNode {
  constructor() {
    super({
      id: 'json-parser',
      name: 'JSON Parser',
      type: 'json-parser',
      description: 'Parse and manipulate JSON data',
      color: '#26A69A',
      shape: 'rectangle',
      icon: 'brackets',
      properties: [
        {
          name: 'operation',
          displayName: 'Operation',
          type: 'options',
          options: [
            { value: 'parse', label: 'Parse String to JSON' },
            { value: 'stringify', label: 'Stringify JSON' },
            { value: 'extract', label: 'Extract Field' }
          ],
          default: 'parse',
          required: true
        },
        {
          name: 'input',
          displayName: 'Input',
          type: 'string',
          default: '',
          required: true
        }
      ]
    });
  }

  async execute(context) {
    const operation = this.getNodeParameter(context, 'operation');
    const input = this.getNodeParameter(context, 'input');

    try {
      let result;

      switch (operation) {
        case 'parse':
          result = JSON.parse(input);
          break;
        case 'stringify':
          result = JSON.stringify(input);
          break;
        case 'extract':
          const inputData = this.getInputData(context);
          result = inputData[input];
          break;
        default:
          result = input;
      }

      return {
        success: true,
        data: result
      };
    } catch (error) {
      return await this.onError(error, context);
    }
  }
}
