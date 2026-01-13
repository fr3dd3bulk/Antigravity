import { TriggerNode } from '../../TriggerNode.js';

export class EventTrigger extends TriggerNode {
  constructor() {
    super({
      id: 'event-trigger',
      name: 'Event',
      type: 'event-trigger',
      description: 'Triggers workflow on external events',
      color: '#AA96DA',
      shape: 'circle',
      icon: 'bolt',
      properties: [
        {
          name: 'eventType',
          displayName: 'Event Type',
          type: 'string',
          default: '',
          required: true
        }
      ]
    });
  }

  async trigger(context) {
    const eventType = this.getNodeParameter(context, 'eventType');
    
    return {
      eventType,
      eventData: context.eventData,
      triggeredAt: new Date().toISOString()
    };
  }
}
