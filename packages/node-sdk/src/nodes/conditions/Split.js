import { ActionNode } from '../../ActionNode.js';

export class SplitNode extends ActionNode {
  constructor() {
    super({
      id: 'split',
      name: 'Split',
      type: 'split',
      description: 'Split data into multiple parallel paths',
      color: '#3498DB',
      shape: 'diamond',
      icon: 'split',
      properties: [
        {
          name: 'paths',
          displayName: 'Number of Paths',
          type: 'number',
          default: 2,
          required: true
        }
      ]
    });
  }

  async execute(context) {
    const paths = this.getNodeParameter(context, 'paths', 2);
    const inputData = this.getInputData(context);

    const results = [];
    for (let i = 0; i < paths; i++) {
      results.push({
        path: `path_${i}`,
        data: inputData
      });
    }

    return {
      success: true,
      paths: results
    };
  }
}
