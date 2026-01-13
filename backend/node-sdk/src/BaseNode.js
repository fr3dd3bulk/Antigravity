export class BaseNode {
  constructor(config) {
    this.id = config.id;
    this.name = config.name;
    this.type = config.type;
    this.category = config.category;
    this.description = config.description;
    this.color = config.color || '#4CAF50';
    this.shape = config.shape || 'rectangle';
    this.icon = config.icon;
    this.version = config.version || 1;
    this.properties = config.properties || [];
    this.credentials = config.credentials || [];
  }

  async execute(context) {
    throw new Error('Execute method must be implemented by subclass');
  }

  async onError(error, context) {
    return {
      success: false,
      error: {
        message: error.message,
        stack: error.stack
      }
    };
  }

  getInputData(context) {
    return context.inputData || {};
  }

  getNodeParameter(context, parameterName, defaultValue = null) {
    return context.node?.data?.[parameterName] ?? defaultValue;
  }

  getCredentials(context, credentialType) {
    return context.credentials?.[credentialType];
  }

  async helpers(context) {
    return {
      httpRequest: async (options) => {
        const axios = (await import('axios')).default;
        return await axios(options);
      },
      returnJsonArray: (data) => {
        return Array.isArray(data) ? data : [data];
      }
    };
  }
}
