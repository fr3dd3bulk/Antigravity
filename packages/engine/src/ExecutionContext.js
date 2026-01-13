export class ExecutionContext {
  constructor(workflow, execution, credentials = {}) {
    this.workflow = workflow;
    this.execution = execution;
    this.credentials = credentials;
    this.nodeResults = new Map();
    this.errors = [];
  }

  setNodeResult(nodeId, result) {
    this.nodeResults.set(nodeId, result);
  }

  getNodeResult(nodeId) {
    return this.nodeResults.get(nodeId);
  }

  getAllResults() {
    return Object.fromEntries(this.nodeResults);
  }

  addError(nodeId, error) {
    this.errors.push({
      nodeId,
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }

  getErrors() {
    return this.errors;
  }

  hasErrors() {
    return this.errors.length > 0;
  }

  getNodeContext(node, inputData = {}) {
    return {
      node,
      workflow: this.workflow,
      execution: this.execution,
      inputData,
      credentials: this.credentials,
      nodeResults: this.nodeResults,
      userId: this.execution.userId
    };
  }
}
