import { ActionNode } from '../../ActionNode.js';

export class Formatter extends ActionNode {
  constructor() {
    super({
      id: 'formatter',
      name: 'Formatter',
      type: 'formatter',
      description: 'Format and transform data',
      color: '#FF7043',
      shape: 'rectangle',
      icon: 'magic',
      properties: [
        {
          name: 'operation',
          displayName: 'Operation',
          type: 'options',
          options: [
            { value: 'uppercase', label: 'Uppercase' },
            { value: 'lowercase', label: 'Lowercase' },
            { value: 'trim', label: 'Trim' },
            { value: 'replace', label: 'Replace' }
          ],
          default: 'trim',
          required: true
        },
        {
          name: 'field',
          displayName: 'Field',
          type: 'string',
          default: '',
          required: true
        },
        {
          name: 'find',
          displayName: 'Find',
          type: 'string',
          default: ''
        },
        {
          name: 'replace',
          displayName: 'Replace With',
          type: 'string',
          default: ''
        }
      ]
    });
  }

  async execute(context) {
    const operation = this.getNodeParameter(context, 'operation');
    const field = this.getNodeParameter(context, 'field');
    const inputData = this.getInputData(context);

    let value = inputData[field];

    switch (operation) {
      case 'uppercase':
        value = String(value).toUpperCase();
        break;
      case 'lowercase':
        value = String(value).toLowerCase();
        break;
      case 'trim':
        value = String(value).trim();
        break;
      case 'replace':
        const find = this.getNodeParameter(context, 'find');
        const replace = this.getNodeParameter(context, 'replace');
        value = String(value).replace(new RegExp(find, 'g'), replace);
        break;
    }

    return {
      success: true,
      data: {
        ...inputData,
        [field]: value
      }
    };
  }
}
