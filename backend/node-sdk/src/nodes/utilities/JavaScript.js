import { ActionNode } from '../../ActionNode.js';
import { VM } from 'vm2';

export class JavaScriptNode extends ActionNode {
  constructor() {
    super({
      id: 'javascript',
      name: 'JavaScript',
      type: 'javascript',
      description: 'Execute JavaScript code in sandbox',
      color: '#F7DF1E',
      shape: 'rectangle',
      icon: 'code',
      properties: [
        {
          name: 'code',
          displayName: 'JavaScript Code',
          type: 'string',
          default: 'return items;',
          required: true
        }
      ]
    });
  }

  async execute(context) {
    const code = this.getNodeParameter(context, 'code');
    const inputData = this.getInputData(context);

    try {
      const vm = new VM({
        timeout: 30000,
        sandbox: {
          items: inputData,
          console: {
            log: (...args) => console.log('[JS Node]', ...args)
          }
        }
      });

      const result = vm.run(code);

      return {
        success: true,
        data: result
      };
    } catch (error) {
      return await this.onError(error, context);
    }
  }
}
