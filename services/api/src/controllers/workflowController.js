import { Workflow, WorkflowVersion } from '@n8n-clone/shared';

export async function createWorkflow(req, res) {
  try {
    const { name, description, nodes, edges, settings, tags } = req.body;
    const { organizationId } = req.params;

    const workflow = await Workflow.create({
      name,
      description,
      organizationId,
      createdBy: req.userId,
      nodes: nodes || [],
      edges: edges || [],
      settings: settings || {},
      tags: tags || []
    });

    const version = await WorkflowVersion.create({
      workflowId: workflow._id,
      versionNumber: 1,
      nodes: nodes || [],
      edges: edges || [],
      settings: settings || {},
      createdBy: req.userId
    });

    workflow.currentVersionId = version._id;
    await workflow.save();

    res.status(201).json(workflow);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getWorkflows(req, res) {
  try {
    const { organizationId } = req.params;
    const { page = 1, limit = 20, search, tags, isActive } = req.query;

    const filter = {
      organizationId,
      deletedAt: null
    };

    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ];
    }

    if (tags) {
      filter.tags = { $in: tags.split(',') };
    }

    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    const workflows = await Workflow.find(filter)
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('createdBy', 'email firstName lastName');

    const total = await Workflow.countDocuments(filter);

    res.json({
      workflows,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getWorkflow(req, res) {
  try {
    const { workflowId } = req.params;

    const workflow = await Workflow.findOne({
      _id: workflowId,
      deletedAt: null
    }).populate('createdBy', 'email firstName lastName');

    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    res.json(workflow);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function updateWorkflow(req, res) {
  try {
    const { workflowId } = req.params;
    const { name, description, nodes, edges, settings, tags, isActive } = req.body;

    const workflow = await Workflow.findOne({
      _id: workflowId,
      deletedAt: null
    });

    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    if (name !== undefined) workflow.name = name;
    if (description !== undefined) workflow.description = description;
    if (nodes !== undefined) workflow.nodes = nodes;
    if (edges !== undefined) workflow.edges = edges;
    if (settings !== undefined) workflow.settings = settings;
    if (tags !== undefined) workflow.tags = tags;
    if (isActive !== undefined) workflow.isActive = isActive;

    if (nodes !== undefined || edges !== undefined) {
      workflow.versionNumber += 1;
      
      const version = await WorkflowVersion.create({
        workflowId: workflow._id,
        versionNumber: workflow.versionNumber,
        nodes: workflow.nodes,
        edges: workflow.edges,
        settings: workflow.settings,
        createdBy: req.userId
      });

      workflow.currentVersionId = version._id;
    }

    await workflow.save();

    res.json(workflow);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function deleteWorkflow(req, res) {
  try {
    const { workflowId } = req.params;

    const workflow = await Workflow.findOne({
      _id: workflowId,
      deletedAt: null
    });

    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    workflow.deletedAt = new Date();
    workflow.isActive = false;
    await workflow.save();

    res.json({ message: 'Workflow deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function activateWorkflow(req, res) {
  try {
    const { workflowId } = req.params;

    const workflow = await Workflow.findById(workflowId);
    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    workflow.isActive = true;
    await workflow.save();

    res.json(workflow);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function deactivateWorkflow(req, res) {
  try {
    const { workflowId } = req.params;

    const workflow = await Workflow.findById(workflowId);
    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    workflow.isActive = false;
    await workflow.save();

    res.json(workflow);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
