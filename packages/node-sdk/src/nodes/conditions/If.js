import { ActionNode } from '../../ActionNode.js';

export class IfCondition extends ActionNode {
  constructor() {
    super({
      id: 'if-condition',
      name: 'IF',
      type: 'if-condition',
      description: 'Route execution based on conditions',
      color: '#F39C12',
      shape: 'diamond',
      icon: 'code-branch',
      properties: [
        {
          name: 'conditions',
          displayName: 'Conditions',
          type: 'json',
          default: '{"field": "", "operator": "equals", "value": ""}',
          required: true
        }
      ]
    });
  }

  async execute(context) {
    const conditions = this.getNodeParameter(context, 'conditions');
    const inputData = this.getInputData(context);
    
    const conditionObj = typeof conditions === 'string' ? JSON.parse(conditions) : conditions;
    
    let result = false;
    const field = conditionObj.field;
    const operator = conditionObj.operator;
    const value = conditionObj.value;
    const actualValue = inputData[field];

    switch (operator) {
      case 'equals':
        result = actualValue == value;
        break;
      case 'notEquals':
        result = actualValue != value;
        break;
      case 'contains':
        result = String(actualValue).includes(value);
        break;
      case 'greaterThan':
        result = Number(actualValue) > Number(value);
        break;
      case 'lessThan':
        result = Number(actualValue) < Number(value);
        break;
      default:
        result = false;
    }

    return {
      success: true,
      condition: result,
      path: result ? 'true' : 'false',
      data: inputData
    };
  }
}
