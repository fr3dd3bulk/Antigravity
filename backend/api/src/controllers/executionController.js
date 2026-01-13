import { WorkflowExecution, ExecutionLog, Workflow } from '@n8n-clone/shared';
import { Queue } from 'bullmq';
import Redis from 'ioredis';

const connection = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null
});

const executionQueue = new Queue('workflow-execution', { connection });

export async function executeWorkflow(req, res) {
  try {
    const { workflowId } = req.params;
    const { triggerData = {} } = req.body;

    const workflow = await Workflow.findOne({
      _id: workflowId,
      deletedAt: null
    });

    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    const execution = await WorkflowExecution.create({
      workflowId: workflow._id,
      organizationId: workflow.organizationId,
      mode: 'manual',
      status: 'running',
      triggerData
    });

    await executionQueue.add('execute', {
      executionId: execution._id.toString(),
      workflowId: workflow._id.toString(),
      organizationId: workflow.organizationId.toString(),
      workflow: {
        nodes: workflow.nodes,
        edges: workflow.edges,
        settings: workflow.settings
      },
      triggerData
    });

    res.status(202).json({
      executionId: execution._id,
      status: 'queued'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getExecutions(req, res) {
  try {
    const { organizationId } = req.params;
    const { page = 1, limit = 20, workflowId, status } = req.query;

    const filter = {
      organizationId,
      deletedAt: null
    };

    if (workflowId) filter.workflowId = workflowId;
    if (status) filter.status = status;

    const executions = await WorkflowExecution.find(filter)
      .sort({ startedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('workflowId', 'name');

    const total = await WorkflowExecution.countDocuments(filter);

    res.json({
      executions,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getExecution(req, res) {
  try {
    const { executionId } = req.params;

    const execution = await WorkflowExecution.findById(executionId)
      .populate('workflowId', 'name');

    if (!execution) {
      return res.status(404).json({ error: 'Execution not found' });
    }

    const logs = await ExecutionLog.find({ executionId })
      .sort({ timestamp: 1 });

    res.json({
      execution,
      logs
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function cancelExecution(req, res) {
  try {
    const { executionId } = req.params;

    const execution = await WorkflowExecution.findById(executionId);
    if (!execution) {
      return res.status(404).json({ error: 'Execution not found' });
    }

    if (execution.status !== 'running') {
      return res.status(400).json({ error: 'Execution is not running' });
    }

    execution.status = 'canceled';
    execution.stoppedAt = new Date();
    execution.duration = execution.stoppedAt - execution.startedAt;
    await execution.save();

    res.json(execution);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function deleteExecution(req, res) {
  try {
    const { executionId } = req.params;

    const execution = await WorkflowExecution.findById(executionId);
    if (!execution) {
      return res.status(404).json({ error: 'Execution not found' });
    }

    execution.deletedAt = new Date();
    await execution.save();

    res.json({ message: 'Execution deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
