import cron from 'node-cron';
import { Workflow, WorkflowExecution, logger } from '@n8n-clone/shared';
import { Queue } from 'bullmq';
import Redis from 'ioredis';

const connection = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null
});

const executionQueue = new Queue('workflow-execution', { connection });

export class CronManager {
  constructor() {
    this.jobs = new Map();
  }

  async loadCronWorkflows() {
    try {
      const workflows = await Workflow.find({
        isActive: true,
        deletedAt: null,
        $or: [
          { 'nodes.type': 'cron-trigger' },
          { 'nodes.type': 'schedule-trigger' }
        ]
      });

      logger.info(`Found ${workflows.length} scheduled workflows`);

      for (const workflow of workflows) {
        this.scheduleWorkflow(workflow);
      }
    } catch (error) {
      logger.error('Failed to load cron workflows', { error: error.message });
    }
  }

  scheduleWorkflow(workflow) {
    const cronNodes = workflow.nodes.filter(n => 
      n.type === 'cron-trigger' || n.type === 'schedule-trigger'
    );

    for (const node of cronNodes) {
      let cronExpression;

      if (node.type === 'cron-trigger') {
        cronExpression = node.data?.cronExpression || '0 * * * *';
      } else if (node.type === 'schedule-trigger') {
        cronExpression = this.convertScheduleToCron(node.data);
      }

      if (cronExpression && cron.validate(cronExpression)) {
        const jobKey = `${workflow._id}-${node.id}`;

        if (this.jobs.has(jobKey)) {
          this.jobs.get(jobKey).stop();
        }

        const job = cron.schedule(cronExpression, async () => {
          await this.executeScheduledWorkflow(workflow);
        });

        this.jobs.set(jobKey, job);
        logger.info('Scheduled workflow', { 
          workflowId: workflow._id,
          cronExpression
        });
      }
    }
  }

  convertScheduleToCron(scheduleData) {
    const { interval, intervalValue } = scheduleData || {};
    
    switch (interval) {
      case 'minutes':
        return `*/${intervalValue} * * * *`;
      case 'hours':
        return `0 */${intervalValue} * * *`;
      case 'days':
        return `0 0 */${intervalValue} * *`;
      default:
        return '0 * * * *';
    }
  }

  async executeScheduledWorkflow(workflow) {
    try {
      logger.info('Executing scheduled workflow', { workflowId: workflow._id });

      const execution = await WorkflowExecution.create({
        workflowId: workflow._id,
        organizationId: workflow.organizationId,
        mode: 'scheduled',
        status: 'running',
        triggerData: {
          triggeredAt: new Date().toISOString(),
          type: 'schedule'
        }
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
        triggerData: {
          triggeredAt: new Date().toISOString(),
          type: 'schedule'
        }
      });

      logger.info('Scheduled workflow queued', { 
        workflowId: workflow._id,
        executionId: execution._id
      });
    } catch (error) {
      logger.error('Failed to execute scheduled workflow', {
        workflowId: workflow._id,
        error: error.message
      });
    }
  }

  async refresh() {
    this.jobs.forEach(job => job.stop());
    this.jobs.clear();
    await this.loadCronWorkflows();
  }

  stop() {
    this.jobs.forEach(job => job.stop());
    this.jobs.clear();
  }
}
