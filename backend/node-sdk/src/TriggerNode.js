import { BaseNode } from './BaseNode.js';

export class TriggerNode extends BaseNode {
  constructor(config) {
    super({
      ...config,
      category: 'trigger'
    });
  }

  async trigger(context) {
    throw new Error('Trigger method must be implemented by subclass');
  }

  async poll(context) {
    return [];
  }

  async webhook(context) {
    return {
      webhookData: context.webhookData
    };
  }
}
