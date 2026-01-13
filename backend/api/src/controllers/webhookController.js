import { Workflow, WorkflowExecution } from '@n8n-clone/shared';
import { Queue } from 'bullmq';
import Redis from 'ioredis';

const connection = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null
});

const executionQueue = new Queue('workflow-execution', { connection });

export async function handleWebhook(req, res) {
  try {
    const { webhookPath } = req.params;

    const workflows = await Workflow.find({
      isActive: true,
      deletedAt: null,
      'nodes.type': 'webhook-trigger'
    });

    const matchingWorkflow = workflows.find(w => {
      return w.nodes.some(n => 
        n.type === 'webhook-trigger' && 
        n.data?.path === webhookPath
      );
    });

    if (!matchingWorkflow) {
      return res.status(404).json({ error: 'Webhook not found' });
    }

    const execution = await WorkflowExecution.create({
      workflowId: matchingWorkflow._id,
      organizationId: matchingWorkflow.organizationId,
      mode: 'webhook',
      status: 'running',
      triggerData: {
        method: req.method,
        headers: req.headers,
        query: req.query,
        params: req.params,
        body: req.body
      }
    });

    await executionQueue.add('execute', {
      executionId: execution._id.toString(),
      workflowId: matchingWorkflow._id.toString(),
      organizationId: matchingWorkflow.organizationId.toString(),
      workflow: {
        nodes: matchingWorkflow.nodes,
        edges: matchingWorkflow.edges,
        settings: matchingWorkflow.settings
      },
      triggerData: {
        method: req.method,
        headers: req.headers,
        query: req.query,
        params: req.params,
        body: req.body
      }
    });

    res.status(202).json({
      executionId: execution._id,
      status: 'accepted'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
