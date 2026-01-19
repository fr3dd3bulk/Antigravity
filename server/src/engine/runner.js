import axios from 'axios';
import ActionDefinition from '../models/ActionDefinition.js';

/**
 * Dynamic Step Executor - The Heart of the Meta Engine
 * Takes a workflow node, finds its ActionDefinition, and executes it
 */

class WorkflowRunner {
  /**
   * Execute a single workflow node
   * @param {Object} node - The workflow node to execute
   * @param {Object} previousResults - Results from previous steps for variable substitution
   * @returns {Promise<Object>} - Execution result
   */
  async executeNode(node, previousResults = {}) {
    try {
      console.log(`🔄 Executing node: ${node.id} (${node.data.actionName})`);

      // Find the ActionDefinition
      const actionDef = await ActionDefinition.findById(node.data.actionId);
      
      if (!actionDef) {
        throw new Error(`ActionDefinition not found: ${node.data.actionId}`);
      }

      // Handle internal actions (code, wait, etc.)
      if (actionDef.apiConfig.url.startsWith('internal://')) {
        return this.executeInternalAction(actionDef, node.data.inputs, previousResults);
      }

      // Build the HTTP request from the ActionDefinition
      const request = this.buildRequest(actionDef, node.data.inputs, previousResults);

      // Execute the HTTP request
      const startTime = Date.now();
      const response = await axios(request);
      const duration = Date.now() - startTime;

      return {
        success: true,
        data: response.data,
        status: response.status,
        duration,
        nodeId: node.id,
      };

    } catch (error) {
      console.error(`❌ Error executing node ${node.id}:`, error.message);
      
      return {
        success: false,
        error: error.message,
        nodeId: node.id,
        stack: error.stack,
      };
    }
  }

  /**
   * Build HTTP request from ActionDefinition and user inputs
   * @param {Object} actionDef - The ActionDefinition
   * @param {Object} userInputs - User-provided input values
   * @param {Object} previousResults - Previous step results
   * @returns {Object} - Axios request config
   */
  buildRequest(actionDef, userInputs, previousResults) {
    const { apiConfig } = actionDef;

    // Substitute variables in URL
    const url = this.substituteVariables(apiConfig.url, userInputs, previousResults);

    // Substitute variables in headers
    const headers = {};
    if (apiConfig.headers) {
      for (const [key, value] of Object.entries(apiConfig.headers)) {
        headers[key] = this.substituteVariables(value, userInputs, previousResults);
      }
    }

    // Build request body
    let data = null;
    if (apiConfig.method !== 'GET' && apiConfig.method !== 'DELETE') {
      // Start with bodyTemplate or user inputs
      const bodyTemplate = apiConfig.bodyTemplate || {};
      data = this.buildRequestBody(bodyTemplate, userInputs, previousResults);
    }

    return {
      method: apiConfig.method,
      url,
      headers,
      data,
      timeout: 30000, // 30 seconds
    };
  }

  /**
   * Build request body by substituting variables
   * @param {Object} template - Body template from ActionDefinition
   * @param {Object} userInputs - User inputs
   * @param {Object} previousResults - Previous results
   * @returns {Object} - Request body
   */
  buildRequestBody(template, userInputs, previousResults) {
    const body = {};

    // If template is empty, use userInputs directly
    if (Object.keys(template).length === 0) {
      return userInputs;
    }

    // Process each field in template
    for (const [key, value] of Object.entries(template)) {
      if (typeof value === 'string') {
        body[key] = this.substituteVariables(value, userInputs, previousResults);
      } else if (typeof value === 'object' && value !== null) {
        body[key] = this.buildRequestBody(value, userInputs, previousResults);
      } else {
        body[key] = value;
      }
    }

    return body;
  }

  /**
   * Variable Substitution Engine
   * Replaces {{input.fieldName}} and {{$json.previousStep.data.field}} with actual values
   * @param {string} template - Template string with variables
   * @param {Object} userInputs - User input values
   * @param {Object} previousResults - Previous step results
   * @returns {string} - String with substituted values
   */
  substituteVariables(template, userInputs, previousResults) {
    if (typeof template !== 'string') {
      return template;
    }

    let result = template;

    // Replace {{input.fieldName}} with user inputs
    result = result.replace(/\{\{input\.(\w+)\}\}/g, (match, fieldName) => {
      return userInputs[fieldName] !== undefined ? userInputs[fieldName] : match;
    });

    // Replace {{credentials.fieldName}} - simplified, would need credential store in production
    result = result.replace(/\{\{credentials\.(\w+)\}\}/g, (match, fieldName) => {
      // In production, this would fetch from a secure credential store
      return match; // Keep as-is for now
    });

    // Replace {{$json.stepName.path}} with previous results
    result = result.replace(/\{\{\$json\.([a-zA-Z0-9_]+)\.(.+?)\}\}/g, (match, stepName, path) => {
      const stepResult = previousResults[stepName];
      if (!stepResult) return match;

      // Navigate the path (e.g., "data.field.subfield")
      const value = this.getNestedValue(stepResult, path);
      return value !== undefined ? value : match;
    });

    return result;
  }

  /**
   * Get nested value from object using dot notation path
   * @param {Object} obj - Source object
   * @param {string} path - Dot notation path (e.g., "data.user.name")
   * @returns {*} - Value at path or undefined
   */
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  /**
   * Execute internal actions (code, wait, etc.)
   * @param {Object} actionDef - ActionDefinition
   * @param {Object} inputs - User inputs
   * @param {Object} previousResults - Previous results
   * @returns {Promise<Object>} - Execution result
   */
  async executeInternalAction(actionDef, inputs, previousResults) {
    const actionType = actionDef.apiConfig.url.replace('internal://', '');

    switch (actionType) {
      case 'wait':
        const duration = parseInt(inputs.duration) || 5;
        await new Promise(resolve => setTimeout(resolve, duration * 1000));
        return {
          success: true,
          data: { waited: duration, unit: 'seconds' },
          duration: duration * 1000,
        };

      case 'code':
        try {
          // SECURITY WARNING: eval is dangerous in production
          // This is a simplified implementation for demonstration
          // In production, use a sandboxed execution environment like vm2 or isolated-vm
          const code = inputs.code;
          const context = { input: inputs, previous: previousResults };
          
          // Create a safe function
          const func = new Function('context', `
            const { input, previous } = context;
            ${code}
          `);
          
          const result = func(context);
          
          return {
            success: true,
            data: result,
            duration: 0,
          };
        } catch (error) {
          return {
            success: false,
            error: `Code execution error: ${error.message}`,
          };
        }

      case 'split':
        const branches = parseInt(inputs.branches) || 2;
        return {
          success: true,
          data: { branches, type: 'split' },
          duration: 0,
        };

      case 'merge':
        return {
          success: true,
          data: { merged: true, inputs: previousResults },
          duration: 0,
        };

      default:
        // For other utilities, return the input
        return {
          success: true,
          data: inputs,
          duration: 0,
        };
    }
  }

  /**
   * Execute an entire workflow
   * @param {Object} workflow - Workflow object with nodes and edges
   * @param {Object} triggerData - Initial trigger data
   * @returns {Promise<Object>} - Workflow execution result
   */
  async executeWorkflow(workflow, triggerData = {}) {
    const results = {};
    const { nodes, edges } = workflow;

    // Build execution order from edges
    const executionOrder = this.buildExecutionOrder(nodes, edges);

    console.log(`🚀 Starting workflow execution: ${workflow.name}`);

    for (const node of executionOrder) {
      const result = await this.executeNode(node, results);
      results[node.id] = result;

      // Stop execution if a step fails
      if (!result.success) {
        console.error(`❌ Workflow failed at node: ${node.id}`);
        break;
      }
    }

    return {
      workflowId: workflow._id,
      results,
      completedNodes: Object.keys(results).length,
      totalNodes: nodes.length,
    };
  }

  /**
   * Build execution order from nodes and edges (topological sort)
   * @param {Array} nodes - Workflow nodes
   * @param {Array} edges - Workflow edges
   * @returns {Array} - Nodes in execution order
   */
  buildExecutionOrder(nodes, edges) {
    // Simple implementation: execute nodes in the order they appear
    // In production, implement proper topological sort based on edges
    
    // Find nodes with no incoming edges (starting nodes)
    const nodeIds = nodes.map(n => n.id);
    const hasIncoming = new Set(edges.map(e => e.target));
    const startNodes = nodes.filter(n => !hasIncoming.has(n.id));

    // For now, return all nodes (assumes linear flow)
    // TODO: Implement proper topological sort for complex workflows
    return nodes;
  }
}

export default new WorkflowRunner();
