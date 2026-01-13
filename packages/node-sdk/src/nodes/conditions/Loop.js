import { ActionNode } from '../../ActionNode.js';

export class LoopNode extends ActionNode {
  constructor() {
    super({
      id: 'loop',
      name: 'Loop',
      type: 'loop',
      description: 'Iterate over items',
      color: '#1ABC9C',
      shape: 'diamond',
      icon: 'rotate',
      properties: [
        {
          name: 'items',
          displayName: 'Items Field',
          type: 'string',
          default: 'items',
          description: 'Field containing array to iterate over',
          required: true
        }
      ]
    });
  }

  async execute(context) {
    const itemsField = this.getNodeParameter(context, 'items');
    const inputData = this.getInputData(context);
    
    const items = inputData[itemsField] || [];

    return {
      success: true,
      items: Array.isArray(items) ? items : [items],
      data: inputData
    };
  }
}
