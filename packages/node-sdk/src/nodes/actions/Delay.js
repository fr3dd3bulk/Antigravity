import { ActionNode } from '../../ActionNode.js';

export class Delay extends ActionNode {
  constructor() {
    super({
      id: 'delay',
      name: 'Delay',
      type: 'delay',
      description: 'Wait for a specified amount of time',
      color: '#FFA726',
      shape: 'rectangle',
      icon: 'hourglass',
      properties: [
        {
          name: 'unit',
          displayName: 'Time Unit',
          type: 'options',
          options: [
            { value: 'seconds', label: 'Seconds' },
            { value: 'minutes', label: 'Minutes' },
            { value: 'hours', label: 'Hours' }
          ],
          default: 'seconds',
          required: true
        },
        {
          name: 'value',
          displayName: 'Value',
          type: 'number',
          default: 1,
          required: true
        }
      ]
    });
  }

  async execute(context) {
    const unit = this.getNodeParameter(context, 'unit');
    const value = this.getNodeParameter(context, 'value');

    const multipliers = {
      seconds: 1000,
      minutes: 60000,
      hours: 3600000
    };

    const delayMs = value * multipliers[unit];
    
    await new Promise(resolve => setTimeout(resolve, delayMs));

    return {
      success: true,
      delayed: `${value} ${unit}`,
      delayedUntil: new Date().toISOString()
    };
  }
}
