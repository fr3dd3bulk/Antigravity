import { Queue, Worker } from 'bullmq';
import { getRedisClient } from '../config/redis.js';
import workflowRunner from './runner.js';
import { Workflow, Execution } from '../models/index.js';

/**
 * BullMQ Worker for processing workflow executions
 */

let workflowQueue = null;

/**
 * Initialize the workflow queue
 */
export const initQueue = () => {
  const connection = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
  };

  workflowQueue = new Queue('workflow-executions', { connection });

  console.log('✅ Workflow queue initialized');
  return workflowQueue;
};

/**
 * Get the workflow queue instance
 */
export const getQueue = () => {
  if (!workflowQueue) {
    throw new Error('Workflow queue not initialized. Call initQueue() first.');
  }
  return workflowQueue;
};

/**
 * Add a workflow execution job to the queue
 * @param {string} workflowId - Workflow ID
 * @param {Object} triggerData - Trigger data
 * @returns {Promise<Object>} - Job info
 */
export const addWorkflowJob = async (workflowId, triggerData = {}) => {
  const queue = getQueue();
  
  const job = await queue.add('execute-workflow', {
    workflowId,
    triggerData,
  }, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  });

  console.log(`📋 Added workflow job: ${job.id} for workflow: ${workflowId}`);
  return job;
};

/**
 * Initialize the BullMQ worker
 */
export const initWorker = () => {
  const connection = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
  };

  const worker = new Worker('workflow-executions', async (job) => {
    const { workflowId, triggerData } = job.data;

    console.log(`⚙️  Processing job ${job.id} for workflow ${workflowId}`);

    let execution = null;

    try {
      // Fetch the workflow
      const workflow = await Workflow.findById(workflowId);
      
      if (!workflow) {
        throw new Error(`Workflow not found: ${workflowId}`);
      }

      // Create execution record
      execution = new Execution({
        workflowId: workflow._id,
        orgId: workflow.orgId,
        status: 'running',
        triggerData,
        stepResults: [],
        startedAt: new Date(),
      });
      await execution.save();

      // Execute the workflow
      const results = {};
      const stepResults = [];

      for (const node of workflow.nodes) {
        const stepStart = Date.now();
        
        // Update step status to running
        stepResults.push({
          nodeId: node.id,
          nodeName: node.data.actionName || 'Unknown',
          status: 'running',
          startedAt: new Date(),
        });

        // Execute the node
        const result = await workflowRunner.executeNode(node, results);
        results[node.id] = result;

        // Update step result
        const stepIndex = stepResults.findIndex(s => s.nodeId === node.id);
        stepResults[stepIndex] = {
          ...stepResults[stepIndex],
          status: result.success ? 'success' : 'failed',
          completedAt: new Date(),
          input: node.data.inputs,
          output: result.data,
          error: result.error,
          duration: Date.now() - stepStart,
        };

        // Stop if step failed
        if (!result.success) {
          execution.status = 'failed';
          execution.error = {
            message: result.error,
            nodeId: node.id,
            stack: result.stack,
          };
          break;
        }
      }

      // Update execution record
      if (execution.status !== 'failed') {
        execution.status = 'success';
      }
      
      execution.stepResults = stepResults;
      execution.completedAt = new Date();
      execution.duration = execution.completedAt - execution.startedAt;
      await execution.save();

      // Update workflow stats
      workflow.executionCount += 1;
      workflow.lastExecutedAt = new Date();
      await workflow.save();

      console.log(`✅ Workflow ${workflowId} executed successfully`);

      return {
        executionId: execution._id,
        status: execution.status,
        duration: execution.duration,
      };

    } catch (error) {
      console.error(`❌ Error executing workflow ${workflowId}:`, error.message);

      // Update execution record with error
      if (execution) {
        execution.status = 'failed';
        execution.error = {
          message: error.message,
          stack: error.stack,
        };
        execution.completedAt = new Date();
        execution.duration = execution.completedAt - execution.startedAt;
        await execution.save();
      }

      throw error;
    }
  }, {
    connection,
    concurrency: 5, // Process 5 jobs concurrently
  });

  worker.on('completed', (job) => {
    console.log(`✅ Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`❌ Job ${job.id} failed:`, err.message);
  });

  console.log('✅ Workflow worker initialized');
  return worker;
};

export default { initQueue, getQueue, addWorkflowJob, initWorker };
