import Workflow from '../../models/Workflow.js';
import Execution from '../../models/Execution.js';
import { addWorkflowJob } from '../../engine/worker.js';

/**
 * @swagger
 * /api/workflows:
 *   get:
 *     summary: List workflows for organization
 *     tags: [Workflows]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of workflows
 */
export const listWorkflows = async (req, res) => {
  try {
    const workflows = await Workflow.find({ orgId: req.user.orgId })
      .populate('createdBy', 'name email')
      .sort({ updatedAt: -1 });

    res.json({
      workflows,
      count: workflows.length,
    });
  } catch (error) {
    console.error('List workflows error:', error);
    res.status(500).json({ error: 'Failed to fetch workflows' });
  }
};

/**
 * @swagger
 * /api/workflows/{id}:
 *   get:
 *     summary: Get workflow by ID
 *     tags: [Workflows]
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
 *         description: Workflow details
 */
export const getWorkflow = async (req, res) => {
  try {
    const workflow = await Workflow.findOne({
      _id: req.params.id,
      orgId: req.user.orgId,
    }).populate('createdBy', 'name email');

    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    res.json({ workflow });
  } catch (error) {
    console.error('Get workflow error:', error);
    res.status(500).json({ error: 'Failed to fetch workflow' });
  }
};

/**
 * @swagger
 * /api/workflows:
 *   post:
 *     summary: Create new workflow
 *     tags: [Workflows]
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
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               nodes:
 *                 type: array
 *               edges:
 *                 type: array
 *     responses:
 *       201:
 *         description: Workflow created successfully
 */
export const createWorkflow = async (req, res) => {
  try {
    const { name, description, nodes, edges, trigger } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const workflow = new Workflow({
      name,
      description,
      nodes: nodes || [],
      edges: edges || [],
      trigger: trigger || { type: 'manual' },
      orgId: req.user.orgId,
      createdBy: req.user._id,
    });

    await workflow.save();

    res.status(201).json({
      message: 'Workflow created successfully',
      workflow,
    });
  } catch (error) {
    console.error('Create workflow error:', error);
    res.status(500).json({ error: 'Failed to create workflow' });
  }
};

/**
 * @swagger
 * /api/workflows/{id}:
 *   put:
 *     summary: Update workflow
 *     tags: [Workflows]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Workflow updated successfully
 */
export const updateWorkflow = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const workflow = await Workflow.findOneAndUpdate(
      { _id: id, orgId: req.user.orgId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    res.json({
      message: 'Workflow updated successfully',
      workflow,
    });
  } catch (error) {
    console.error('Update workflow error:', error);
    res.status(500).json({ error: 'Failed to update workflow' });
  }
};

/**
 * @swagger
 * /api/workflows/{id}:
 *   delete:
 *     summary: Delete workflow
 *     tags: [Workflows]
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
 *         description: Workflow deleted successfully
 */
export const deleteWorkflow = async (req, res) => {
  try {
    const { id } = req.params;

    const workflow = await Workflow.findOneAndDelete({
      _id: id,
      orgId: req.user.orgId,
    });

    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    res.json({ message: 'Workflow deleted successfully' });
  } catch (error) {
    console.error('Delete workflow error:', error);
    res.status(500).json({ error: 'Failed to delete workflow' });
  }
};

/**
 * @swagger
 * /api/workflows/{id}/execute:
 *   post:
 *     summary: Execute workflow
 *     tags: [Workflows]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               triggerData:
 *                 type: object
 *     responses:
 *       200:
 *         description: Workflow execution started
 */
export const executeWorkflow = async (req, res) => {
  try {
    const { id } = req.params;
    const { triggerData } = req.body;

    const workflow = await Workflow.findOne({
      _id: id,
      orgId: req.user.orgId,
    });

    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    // Add to queue
    const job = await addWorkflowJob(workflow._id.toString(), triggerData || {});

    res.json({
      message: 'Workflow execution started',
      jobId: job.id,
      workflowId: workflow._id,
    });
  } catch (error) {
    console.error('Execute workflow error:', error);
    res.status(500).json({ error: 'Failed to execute workflow' });
  }
};

/**
 * @swagger
 * /api/workflows/{id}/executions:
 *   get:
 *     summary: Get workflow executions
 *     tags: [Workflows]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: List of executions
 */
export const getWorkflowExecutions = async (req, res) => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit) || 50;

    const executions = await Execution.find({
      workflowId: id,
      orgId: req.user.orgId,
    })
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json({
      executions,
      count: executions.length,
    });
  } catch (error) {
    console.error('Get workflow executions error:', error);
    res.status(500).json({ error: 'Failed to fetch executions' });
  }
};
