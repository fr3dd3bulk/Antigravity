import { ActionNode } from '../../ActionNode.js';

export class SwitchNode extends ActionNode {
  constructor() {
    super({
      id: 'switch',
      name: 'Switch',
      type: 'switch',
      description: 'Route to different paths based on value',
      color: '#E74C3C',
      shape: 'diamond',
      icon: 'random',
      properties: [
        {
          name: 'field',
          displayName: 'Field',
          type: 'string',
          default: '',
          required: true
        },
        {
          name: 'cases',
          displayName: 'Cases',
          type: 'json',
          default: '[]',
          description: 'Array of case values',
          required: true
        }
      ]
    });
  }

  async execute(context) {
    const field = this.getNodeParameter(context, 'field');
    const cases = this.getNodeParameter(context, 'cases', '[]');
    const inputData = this.getInputData(context);

    const casesArray = typeof cases === 'string' ? JSON.parse(cases) : cases;
    const value = inputData[field];

    let matchedCase = 'default';
    if (casesArray.includes(value)) {
      matchedCase = value;
    }

    return {
      success: true,
      path: matchedCase,
      data: inputData
    };
  }
}
