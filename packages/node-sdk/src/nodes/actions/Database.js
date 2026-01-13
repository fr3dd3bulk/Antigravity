import { ActionNode } from '../../ActionNode.js';

export class DatabaseQuery extends ActionNode {
  constructor() {
    super({
      id: 'database-query',
      name: 'Database Query',
      type: 'database-query',
      description: 'Execute database queries',
      color: '#13AA52',
      shape: 'rectangle',
      icon: 'database',
      properties: [
        {
          name: 'operation',
          displayName: 'Operation',
          type: 'options',
          options: [
            { value: 'find', label: 'Find' },
            { value: 'findOne', label: 'Find One' },
            { value: 'insert', label: 'Insert' },
            { value: 'update', label: 'Update' },
            { value: 'delete', label: 'Delete' }
          ],
          default: 'find',
          required: true
        },
        {
          name: 'collection',
          displayName: 'Collection',
          type: 'string',
          default: '',
          required: true
        },
        {
          name: 'query',
          displayName: 'Query',
          type: 'json',
          default: '{}',
          description: 'Query filter as JSON'
        },
        {
          name: 'data',
          displayName: 'Data',
          type: 'json',
          default: '{}',
          description: 'Data for insert/update operations'
        }
      ]
    });
  }

  async execute(context) {
    const operation = this.getNodeParameter(context, 'operation');
    const collection = this.getNodeParameter(context, 'collection');
    const query = this.getNodeParameter(context, 'query', '{}');
    const data = this.getNodeParameter(context, 'data', '{}');

    return {
      success: true,
      operation,
      collection,
      query,
      data
    };
  }
}
