import { WorkflowExecution, ExecutionLog, Credential, logger } from '@n8n-clone/shared';
import { ExecutionEngine } from '@n8n-clone/engine';
import { decrypt } from '@n8n-clone/shared';

export async function processExecution(job) {
  const { executionId, workflowId, organizationId, workflow, triggerData } = job.data;

  logger.info('Processing execution', { executionId, workflowId });

  try {
    const execution = await WorkflowExecution.findById(executionId);
    if (!execution) {
      throw new Error('Execution not found');
    }

    await ExecutionLog.create({
      executionId,
      level: 'info',
      message: 'Execution started',
      timestamp: new Date()
    });

    const credentials = await loadCredentials(organizationId, workflow);

    const engine = new ExecutionEngine();
    const result = await engine.execute(
      workflow,
      { executionId, userId: execution.createdBy },
      credentials,
      triggerData
    );

    execution.status = result.success ? 'success' : 'error';
    execution.stoppedAt = new Date();
    execution.duration = execution.stoppedAt - execution.startedAt;
    execution.executionData = { nodes: result.results };

    if (!result.success && result.errors.length > 0) {
      execution.error = {
        message: result.errors[0].message,
        stack: result.errors[0].stack,
        node: result.errors[0].nodeId
      };
    }

    await execution.save();

    await ExecutionLog.create({
      executionId,
      level: result.success ? 'info' : 'error',
      message: result.success ? 'Execution completed successfully' : 'Execution failed',
      data: result.errors.length > 0 ? { errors: result.errors } : null,
      timestamp: new Date()
    });

    logger.info('Execution completed', { 
      executionId, 
      status: execution.status,
      duration: execution.duration 
    });

    return { success: true, executionId, status: execution.status };
  } catch (error) {
    logger.error('Execution failed', { 
      executionId, 
      error: error.message,
      stack: error.stack
    });

    const execution = await WorkflowExecution.findById(executionId);
    if (execution) {
      execution.status = 'error';
      execution.stoppedAt = new Date();
      execution.duration = execution.stoppedAt - execution.startedAt;
      execution.error = {
        message: error.message,
        stack: error.stack
      };
      await execution.save();
    }

    await ExecutionLog.create({
      executionId,
      level: 'error',
      message: 'Execution error: ' + error.message,
      data: { stack: error.stack },
      timestamp: new Date()
    });

    throw error;
  }
}

async function loadCredentials(organizationId, workflow) {
  const credentialMap = {};

  const nodeTypes = new Set(workflow.nodes.map(n => n.type));
  
  const credentials = await Credential.find({
    organizationId,
    deletedAt: null
  });

  for (const credential of credentials) {
    try {
      const decryptedData = JSON.parse(decrypt(credential.data));
      credentialMap[credential.type] = decryptedData;
    } catch (error) {
      logger.error('Failed to decrypt credential', { 
        credentialId: credential._id,
        error: error.message 
      });
    }
  }

  return credentialMap;
}
