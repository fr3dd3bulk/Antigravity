import { ActionNode } from '../../ActionNode.js';

export class MergeNode extends ActionNode {
  constructor() {
    super({
      id: 'merge',
      name: 'Merge',
      type: 'merge',
      description: 'Merge data from multiple paths',
      color: '#9B59B6',
      shape: 'diamond',
      icon: 'compress',
      properties: [
        {
          name: 'mode',
          displayName: 'Mode',
          type: 'options',
          options: [
            { value: 'append', label: 'Append' },
            { value: 'merge', label: 'Merge Objects' },
            { value: 'wait', label: 'Wait for All' }
          ],
          default: 'append',
          required: true
        }
      ]
    });
  }

  async execute(context) {
    const mode = this.getNodeParameter(context, 'mode');
    const inputData = this.getInputData(context);

    return {
      success: true,
      mode,
      data: inputData
    };
  }
}
