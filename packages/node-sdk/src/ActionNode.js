import { BaseNode } from './BaseNode.js';

export class ActionNode extends BaseNode {
  constructor(config) {
    super({
      ...config,
      category: 'action'
    });
  }

  async execute(context) {
    throw new Error('Execute method must be implemented by subclass');
  }
}
