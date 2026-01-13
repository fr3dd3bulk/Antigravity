import { TriggerNode } from '../../TriggerNode.js';

export class CronTrigger extends TriggerNode {
  constructor() {
    super({
      id: 'cron-trigger',
      name: 'Cron',
      type: 'cron-trigger',
      description: 'Triggers workflow on a cron schedule',
      color: '#4ECDC4',
      shape: 'circle',
      icon: 'clock',
      properties: [
        {
          name: 'cronExpression',
          displayName: 'Cron Expression',
          type: 'string',
          default: '0 * * * *',
          placeholder: '0 * * * *',
          description: 'Cron expression for scheduling',
          required: true
        }
      ]
    });
  }

  async trigger(context) {
    const cronExpression = this.getNodeParameter(context, 'cronExpression');
    
    return {
      cronExpression,
      triggeredAt: new Date().toISOString()
    };
  }
}
