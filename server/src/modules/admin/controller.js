import Plan from '../../models/Plan.js';
import NodeDefinition from '../../models/NodeDefinition.js';
import User from '../../models/User.js';
import Organization from '../../models/Organization.js';
import Workflow from '../../models/Workflow.js';
import Execution from '../../models/Execution.js';
import Subscription from '../../models/Subscription.js';
import AuditLog from '../../models/AuditLog.js';

/**
 * @swagger
 * /api/admin/plans:
 *   get:
 *     summary: Get all plans (super admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all plans
 */
export const getPlans = async (req, res) => {
  try {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const plans = await Plan.find().sort({ sortOrder: 1 });
    res.json({ plans });
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({ error: 'Failed to get plans' });
  }
};

/**
 * @swagger
 * /api/admin/plans:
 *   post:
 *     summary: Create new plan (super admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - key
 *             properties:
 *               name:
 *                 type: string
 *               key:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: object
 *               limits:
 *                 type: object
 *               features:
 *                 type: array
 *     responses:
 *       201:
 *         description: Plan created successfully
 */
export const createPlan = async (req, res) => {
  try {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const planData = req.body;

    if (!planData.name || !planData.key) {
      return res.status(400).json({ error: 'Name and key are required' });
    }

    const existingPlan = await Plan.findOne({ key: planData.key });
    if (existingPlan) {
      return res.status(400).json({ error: 'Plan key already exists' });
    }

    const plan = new Plan(planData);
    await plan.save();

    await AuditLog.create({
      orgId: req.user.orgId._id,
      userId: req.user._id,
      action: 'create',
      resource: 'plan',
      resourceId: plan._id,
      details: { name: plan.name, key: plan.key },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(201).json({
      message: 'Plan created successfully',
      plan,
    });
  } catch (error) {
    console.error('Create plan error:', error);
    res.status(500).json({ error: 'Failed to create plan' });
  }
};

/**
 * @swagger
 * /api/admin/plans/{id}:
 *   put:
 *     summary: Update plan (super admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Plan updated successfully
 */
export const updatePlan = async (req, res) => {
  try {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const { id } = req.params;
    const updateData = req.body;

    const plan = await Plan.findById(id);
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    Object.assign(plan, updateData);
    await plan.save();

    await AuditLog.create({
      orgId: req.user.orgId._id,
      userId: req.user._id,
      action: 'update',
      resource: 'plan',
      resourceId: plan._id,
      details: { updates: Object.keys(updateData) },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({
      message: 'Plan updated successfully',
      plan,
    });
  } catch (error) {
    console.error('Update plan error:', error);
    res.status(500).json({ error: 'Failed to update plan' });
  }
};

/**
 * @swagger
 * /api/admin/plans/{id}:
 *   delete:
 *     summary: Delete plan (super admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Plan deleted successfully
 */
export const deletePlan = async (req, res) => {
  try {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const { id } = req.params;

    const plan = await Plan.findById(id);
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    const subscriptionCount = await Subscription.countDocuments({ 
      planId: id,
      status: { $in: ['active', 'trial'] },
    });

    if (subscriptionCount > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete plan with active subscriptions',
        subscriptionCount,
      });
    }

    plan.isActive = false;
    await plan.save();

    await AuditLog.create({
      orgId: req.user.orgId._id,
      userId: req.user._id,
      action: 'delete',
      resource: 'plan',
      resourceId: plan._id,
      details: { name: plan.name },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({ message: 'Plan deleted successfully' });
  } catch (error) {
    console.error('Delete plan error:', error);
    res.status(500).json({ error: 'Failed to delete plan' });
  }
};

/**
 * @swagger
 * /api/admin/nodes:
 *   get:
 *     summary: Get all node definitions (super admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all node definitions
 */
export const getNodeDefinitions = async (req, res) => {
  try {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const { category, type } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (type) filter.type = type;

    const nodes = await NodeDefinition.find(filter)
      .populate('createdBy', 'name email')
      .sort({ category: 1, name: 1 });

    res.json({ nodes });
  } catch (error) {
    console.error('Get node definitions error:', error);
    res.status(500).json({ error: 'Failed to get node definitions' });
  }
};

/**
 * @swagger
 * /api/admin/nodes:
 *   post:
 *     summary: Create new node definition (super admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Node definition created successfully
 */
export const createNodeDefinition = async (req, res) => {
  try {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const nodeData = req.body;

    if (!nodeData.name || !nodeData.category || !nodeData.type) {
      return res.status(400).json({ error: 'Name, category, and type are required' });
    }

    const node = new NodeDefinition({
      ...nodeData,
      createdBy: req.user._id,
    });

    await node.save();

    await AuditLog.create({
      orgId: req.user.orgId._id,
      userId: req.user._id,
      action: 'create',
      resource: 'node',
      resourceId: node._id,
      details: { name: node.name, category: node.category },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(201).json({
      message: 'Node definition created successfully',
      node,
    });
  } catch (error) {
    console.error('Create node definition error:', error);
    res.status(500).json({ error: 'Failed to create node definition' });
  }
};

/**
 * @swagger
 * /api/admin/nodes/{id}:
 *   put:
 *     summary: Update node definition (super admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Node definition updated successfully
 */
export const updateNodeDefinition = async (req, res) => {
  try {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const { id } = req.params;
    const updateData = req.body;

    const node = await NodeDefinition.findById(id);
    if (!node) {
      return res.status(404).json({ error: 'Node definition not found' });
    }

    if (node.isSystem && updateData.isSystem === false) {
      return res.status(400).json({ error: 'Cannot modify system node' });
    }

    Object.assign(node, updateData);
    await node.save();

    await AuditLog.create({
      orgId: req.user.orgId._id,
      userId: req.user._id,
      action: 'update',
      resource: 'node',
      resourceId: node._id,
      details: { updates: Object.keys(updateData) },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({
      message: 'Node definition updated successfully',
      node,
    });
  } catch (error) {
    console.error('Update node definition error:', error);
    res.status(500).json({ error: 'Failed to update node definition' });
  }
};

/**
 * @swagger
 * /api/admin/nodes/{id}:
 *   delete:
 *     summary: Delete node definition (super admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Node definition deleted successfully
 */
export const deleteNodeDefinition = async (req, res) => {
  try {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const { id } = req.params;

    const node = await NodeDefinition.findById(id);
    if (!node) {
      return res.status(404).json({ error: 'Node definition not found' });
    }

    if (node.isSystem) {
      return res.status(400).json({ error: 'Cannot delete system node' });
    }

    node.isActive = false;
    await node.save();

    await AuditLog.create({
      orgId: req.user.orgId._id,
      userId: req.user._id,
      action: 'delete',
      resource: 'node',
      resourceId: node._id,
      details: { name: node.name },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({ message: 'Node definition deleted successfully' });
  } catch (error) {
    console.error('Delete node definition error:', error);
    res.status(500).json({ error: 'Failed to delete node definition' });
  }
};

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Get system statistics (super admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System statistics
 */
export const getSystemStats = async (req, res) => {
  try {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const [
      totalOrgs,
      activeOrgs,
      totalUsers,
      activeUsers,
      totalWorkflows,
      activeWorkflows,
      totalExecutions,
      todayExecutions,
      subscriptions,
    ] = await Promise.all([
      Organization.countDocuments(),
      Organization.countDocuments({ isActive: true }),
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      Workflow.countDocuments(),
      Workflow.countDocuments({ status: 'active' }),
      Execution.countDocuments(),
      Execution.countDocuments({
        createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      }),
      Subscription.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const subscriptionsByStatus = subscriptions.reduce((acc, { _id, count }) => {
      acc[_id] = count;
      return acc;
    }, {});

    res.json({
      organizations: {
        total: totalOrgs,
        active: activeOrgs,
      },
      users: {
        total: totalUsers,
        active: activeUsers,
      },
      workflows: {
        total: totalWorkflows,
        active: activeWorkflows,
      },
      executions: {
        total: totalExecutions,
        today: todayExecutions,
      },
      subscriptions: subscriptionsByStatus,
    });
  } catch (error) {
    console.error('Get system stats error:', error);
    res.status(500).json({ error: 'Failed to get system stats' });
  }
};

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users (super admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of users
 */
export const getUsers = async (req, res) => {
  try {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const { page = 1, limit = 50, search } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
      User.find(filter)
        .populate('orgId', 'name slug')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(skip),
      User.countDocuments(filter),
    ]);

    res.json({
      users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
};

/**
 * @swagger
 * /api/admin/users/{id}:
 *   put:
 *     summary: Update user (super admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 */
export const updateUser = async (req, res) => {
  try {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const { id } = req.params;
    const updateData = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (updateData.passwordHash) {
      delete updateData.passwordHash;
    }

    Object.assign(user, updateData);
    await user.save();

    await AuditLog.create({
      orgId: req.user.orgId._id,
      userId: req.user._id,
      action: 'update',
      resource: 'user',
      resourceId: user._id,
      details: { updates: Object.keys(updateData) },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({
      message: 'User updated successfully',
      user,
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

/**
 * @swagger
 * /api/admin/organizations:
 *   get:
 *     summary: Get all organizations (super admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of organizations
 */
export const getOrganizations = async (req, res) => {
  try {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const { page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [organizations, total] = await Promise.all([
      Organization.find()
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(skip),
      Organization.countDocuments(),
    ]);

    res.json({
      organizations,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get organizations error:', error);
    res.status(500).json({ error: 'Failed to get organizations' });
  }
};
