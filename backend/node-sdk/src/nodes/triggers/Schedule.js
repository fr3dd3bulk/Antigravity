import { TriggerNode } from '../../TriggerNode.js';

export class ScheduleTrigger extends TriggerNode {
  constructor() {
    super({
      id: 'schedule-trigger',
      name: 'Schedule',
      type: 'schedule-trigger',
      description: 'Triggers workflow at scheduled intervals',
      color: '#F38181',
      shape: 'circle',
      icon: 'calendar',
      properties: [
        {
          name: 'interval',
          displayName: 'Interval',
          type: 'options',
          options: [
            { value: 'minutes', label: 'Minutes' },
            { value: 'hours', label: 'Hours' },
            { value: 'days', label: 'Days' }
          ],
          default: 'hours',
          required: true
        },
        {
          name: 'intervalValue',
          displayName: 'Every',
          type: 'number',
          default: 1,
          required: true
        }
      ]
    });
  }

  async trigger(context) {
    const interval = this.getNodeParameter(context, 'interval');
    const intervalValue = this.getNodeParameter(context, 'intervalValue');
    
    return {
      interval,
      intervalValue,
      triggeredAt: new Date().toISOString()
    };
  }
}
