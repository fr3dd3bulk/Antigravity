import { ActionNode } from '../../ActionNode.js';

export class SetData extends ActionNode {
  constructor() {
    super({
      id: 'set-data',
      name: 'Set',
      type: 'set-data',
      description: 'Set or transform data',
      color: '#7E57C2',
      shape: 'rectangle',
      icon: 'edit',
      properties: [
        {
          name: 'values',
          displayName: 'Values',
          type: 'json',
          default: '{}',
          description: 'Key-value pairs to set',
          required: true
        },
        {
          name: 'keepOnlySet',
          displayName: 'Keep Only Set',
          type: 'boolean',
          default: false,
          description: 'Remove all other data except the set values'
        }
      ]
    });
  }

  async execute(context) {
    const values = this.getNodeParameter(context, 'values', '{}');
    const keepOnlySet = this.getNodeParameter(context, 'keepOnlySet', false);
    const inputData = this.getInputData(context);

    const newValues = typeof values === 'string' ? JSON.parse(values) : values;

    const result = keepOnlySet ? newValues : { ...inputData, ...newValues };

    return {
      success: true,
      data: result
    };
  }
}
