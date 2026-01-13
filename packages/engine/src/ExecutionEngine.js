import { GraphValidator } from './GraphValidator.js';
import { TopologicalSort } from './TopologicalSort.js';
import { ExecutionContext } from './ExecutionContext.js';
import * as NodeSDK from '@n8n-clone/node-sdk';

export class ExecutionEngine {
  constructor() {
    this.nodeInstances = new Map();
    this.initializeNodes();
  }

  initializeNodes() {
    const nodeClasses = {
      'webhook-trigger': NodeSDK.WebhookTrigger,
      'cron-trigger': NodeSDK.CronTrigger,
      'manual-trigger': NodeSDK.ManualTrigger,
      'schedule-trigger': NodeSDK.ScheduleTrigger,
      'event-trigger': NodeSDK.EventTrigger,
      'http-request': NodeSDK.HttpRequest,
      'send-email': NodeSDK.SendEmail,
      'send-sms': NodeSDK.SendSMS,
      'database-query': NodeSDK.DatabaseQuery,
      'delay': NodeSDK.Delay,
      'set-data': NodeSDK.SetData,
      'if-condition': NodeSDK.IfCondition,
      'switch': NodeSDK.SwitchNode,
      'split': NodeSDK.SplitNode,
      'merge': NodeSDK.MergeNode,
      'loop': NodeSDK.LoopNode,
      'javascript': NodeSDK.JavaScriptNode,
      'json-parser': NodeSDK.JsonParser,
      'formatter': NodeSDK.Formatter,
      'text-summarize': NodeSDK.TextSummarize,
      'content-generate': NodeSDK.ContentGenerate
    };

    for (const [type, NodeClass] of Object.entries(nodeClasses)) {
      this.nodeInstances.set(type, new NodeClass());
    }
  }

  async execute(workflow, execution, credentials = {}, triggerData = {}) {
    const validator = new GraphValidator(workflow);
    const validation = validator.validate();

    if (!validation.isValid) {
      throw new Error(`Workflow validation failed: ${validation.errors.join(', ')}`);
    }

    const context = new ExecutionContext(workflow, execution, credentials);
    const sorter = new TopologicalSort(workflow);

    let executionOrder;
    try {
      executionOrder = sorter.sort();
    } catch (error) {
      throw new Error('Failed to determine execution order: ' + error.message);
    }

    const nodeMap = new Map();
    workflow.nodes.forEach(node => {
      nodeMap.set(node.id, node);
    });

    const edgeMap = new Map();
    workflow.edges.forEach(edge => {
      if (!edgeMap.has(edge.source)) {
        edgeMap.set(edge.source, []);
      }
      edgeMap.get(edge.source).push(edge);
    });

    for (const nodeId of executionOrder) {
      const node = nodeMap.get(nodeId);
      if (!node) continue;

      let inputData = {};

      const incomingEdges = workflow.edges.filter(e => e.target === nodeId);
      if (incomingEdges.length > 0) {
        const sourceNodeId = incomingEdges[0].source;
        const sourceResult = context.getNodeResult(sourceNodeId);
        if (sourceResult && sourceResult.data) {
          inputData = sourceResult.data;
        }
      } else if (node.type && node.type.includes('trigger')) {
        inputData = triggerData;
      }

      try {
        const result = await this.executeNode(node, context, inputData);
        context.setNodeResult(nodeId, result);

        if (!result.success) {
          throw new Error(`Node ${node.type} failed: ${result.error?.message || 'Unknown error'}`);
        }
      } catch (error) {
        context.addError(nodeId, error);
        throw error;
      }
    }

    return {
      success: !context.hasErrors(),
      results: context.getAllResults(),
      errors: context.getErrors()
    };
  }

  async executeNode(node, context, inputData) {
    const nodeInstance = this.nodeInstances.get(node.type);

    if (!nodeInstance) {
      throw new Error(`Unknown node type: ${node.type}`);
    }

    const nodeContext = context.getNodeContext(node, inputData);

    try {
      let result;

      if (nodeInstance instanceof NodeSDK.TriggerNode) {
        if (nodeInstance.webhook) {
          result = await nodeInstance.webhook(nodeContext);
        } else if (nodeInstance.trigger) {
          result = await nodeInstance.trigger(nodeContext);
        }
      } else {
        result = await nodeInstance.execute(nodeContext);
      }

      return result || { success: true, data: {} };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error.message,
          stack: error.stack
        }
      };
    }
  }
}
