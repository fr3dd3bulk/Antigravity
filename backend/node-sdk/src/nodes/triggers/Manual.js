import { TriggerNode } from '../../TriggerNode.js';

export class ManualTrigger extends TriggerNode {
  constructor() {
    super({
      id: 'manual-trigger',
      name: 'Manual Trigger',
      type: 'manual-trigger',
      description: 'Manually trigger workflow execution',
      color: '#95E1D3',
      shape: 'circle',
      icon: 'play',
      properties: []
    });
  }

  async trigger(context) {
    return {
      triggeredAt: new Date().toISOString(),
      triggeredBy: context.userId
    };
  }
}
