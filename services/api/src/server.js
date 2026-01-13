import { connectDatabase, logger, User, Plan, Role, NodeDefinition } from '@n8n-clone/shared';
import * as NodeSDK from '@n8n-clone/node-sdk';

export async function initializeDatabase() {
  await connectDatabase();
  logger.info('Database connected');

  await initializePlans();
  await initializeRoles();
  await initializeNodeDefinitions();
  await initializeSuperAdmin();
}

async function initializePlans() {
  const plans = [
    {
      name: 'Free',
      slug: 'free',
      description: 'Perfect for getting started',
      price: 0,
      billingInterval: 'monthly',
      limits: {
        maxWorkflows: 5,
        maxActiveWorkflows: 2,
        maxExecutionsPerMonth: 100,
        maxConcurrentExecutions: 1,
        maxNodesPerWorkflow: 10,
        maxTriggersPerWorkflow: 1,
        executionTimeout: 60000
      },
      features: {},
      isPublished: true,
      trialDays: 0,
      sortOrder: 0
    },
    {
      name: 'Starter',
      slug: 'starter',
      description: 'For small teams',
      price: 29,
      billingInterval: 'monthly',
      limits: {
        maxWorkflows: 20,
        maxActiveWorkflows: 10,
        maxExecutionsPerMonth: 1000,
        maxConcurrentExecutions: 3,
        maxNodesPerWorkflow: 50,
        maxTriggersPerWorkflow: 5,
        executionTimeout: 180000
      },
      features: {},
      isPublished: true,
      trialDays: 14,
      sortOrder: 1
    },
    {
      name: 'Pro',
      slug: 'pro',
      description: 'For growing businesses',
      price: 99,
      billingInterval: 'monthly',
      limits: {
        maxWorkflows: -1,
        maxActiveWorkflows: 50,
        maxExecutionsPerMonth: 10000,
        maxConcurrentExecutions: 10,
        maxNodesPerWorkflow: -1,
        maxTriggersPerWorkflow: -1,
        executionTimeout: 300000
      },
      features: {},
      isPublished: true,
      trialDays: 14,
      sortOrder: 2
    },
    {
      name: 'Enterprise',
      slug: 'enterprise',
      description: 'For large organizations',
      price: 499,
      billingInterval: 'monthly',
      limits: {
        maxWorkflows: -1,
        maxActiveWorkflows: -1,
        maxExecutionsPerMonth: -1,
        maxConcurrentExecutions: 50,
        maxNodesPerWorkflow: -1,
        maxTriggersPerWorkflow: -1,
        executionTimeout: 600000
      },
      features: {},
      isPublished: true,
      trialDays: 30,
      sortOrder: 3
    }
  ];

  for (const planData of plans) {
    const existing = await Plan.findOne({ slug: planData.slug });
    if (!existing) {
      await Plan.create(planData);
      logger.info(`Created plan: ${planData.name}`);
    }
  }
}

async function initializeRoles() {
  const systemRoles = [
    {
      name: 'Admin',
      slug: 'admin',
      permissions: [
        { resource: 'workflow', actions: ['create', 'read', 'update', 'delete', 'execute', 'manage'] },
        { resource: 'execution', actions: ['read', 'delete'] },
        { resource: 'credential', actions: ['create', 'read', 'update', 'delete'] },
        { resource: 'member', actions: ['create', 'read', 'update', 'delete'] }
      ],
      isSystem: true
    },
    {
      name: 'Editor',
      slug: 'editor',
      permissions: [
        { resource: 'workflow', actions: ['create', 'read', 'update', 'execute'] },
        { resource: 'execution', actions: ['read'] },
        { resource: 'credential', actions: ['create', 'read', 'update'] }
      ],
      isSystem: true
    },
    {
      name: 'Viewer',
      slug: 'viewer',
      permissions: [
        { resource: 'workflow', actions: ['read'] },
        { resource: 'execution', actions: ['read'] }
      ],
      isSystem: true
    }
  ];

  for (const roleData of systemRoles) {
    const existing = await Role.findOne({ slug: roleData.slug, organizationId: null });
    if (!existing) {
      await Role.create(roleData);
      logger.info(`Created system role: ${roleData.name}`);
    }
  }
}

async function initializeNodeDefinitions() {
  const nodeDefinitions = [
    {
      nodeType: 'webhook-trigger',
      name: 'Webhook',
      version: 1,
      category: 'trigger',
      description: 'Triggers workflow when webhook receives a request',
      color: '#FF6B6B',
      shape: 'circle',
      isEnabled: true
    },
    {
      nodeType: 'cron-trigger',
      name: 'Cron',
      version: 1,
      category: 'trigger',
      description: 'Triggers workflow on a cron schedule',
      color: '#4ECDC4',
      shape: 'circle',
      isEnabled: true
    },
    {
      nodeType: 'manual-trigger',
      name: 'Manual Trigger',
      version: 1,
      category: 'trigger',
      description: 'Manually trigger workflow execution',
      color: '#95E1D3',
      shape: 'circle',
      isEnabled: true
    },
    {
      nodeType: 'http-request',
      name: 'HTTP Request',
      version: 1,
      category: 'action',
      description: 'Make HTTP requests to any API',
      color: '#0080FF',
      shape: 'rectangle',
      isEnabled: true
    },
    {
      nodeType: 'send-email',
      name: 'Send Email',
      version: 1,
      category: 'action',
      description: 'Send emails via SMTP',
      color: '#EA4335',
      shape: 'rectangle',
      isEnabled: true
    },
    {
      nodeType: 'if-condition',
      name: 'IF',
      version: 1,
      category: 'condition',
      description: 'Route execution based on conditions',
      color: '#F39C12',
      shape: 'diamond',
      isEnabled: true
    },
    {
      nodeType: 'javascript',
      name: 'JavaScript',
      version: 1,
      category: 'utility',
      description: 'Execute JavaScript code in sandbox',
      color: '#F7DF1E',
      shape: 'rectangle',
      isEnabled: true
    }
  ];

  for (const nodeDef of nodeDefinitions) {
    const existing = await NodeDefinition.findOne({ nodeType: nodeDef.nodeType });
    if (!existing) {
      await NodeDefinition.create(nodeDef);
      logger.info(`Created node definition: ${nodeDef.name}`);
    }
  }
}

async function initializeSuperAdmin() {
  const email = process.env.SUPER_ADMIN_EMAIL || 'admin@example.com';
  const password = process.env.SUPER_ADMIN_PASSWORD || 'admin123';

  const existing = await User.findOne({ email });
  if (!existing) {
    await User.create({
      email,
      password,
      firstName: 'Super',
      lastName: 'Admin',
      isSuperAdmin: true,
      isActive: true,
      emailVerified: true
    });
    logger.info(`Created super admin: ${email}`);
  }
}
