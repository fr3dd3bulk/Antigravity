import { WorkflowAction, Workflow, AuditLog } from '@n8n-clone/shared';

/**
 * Get all workflow actions
 */
export const getAllWorkflowActions = async (req, res, next) => {
  try {
    const { category, enabled } = req.query;
    
    const query = {};
    if (category) query.category = category;
    if (enabled !== undefined) query.enabled = enabled === 'true';
    
    const actions = await WorkflowAction.find(query)
      .sort({ category: 1, name: 1 })
      .populate('modifiedBy', 'name email');
    
    res.json({
      success: true,
      data: actions
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single workflow action
 */
export const getWorkflowAction = async (req, res, next) => {
  try {
    const { actionId } = req.params;
    
    const action = await WorkflowAction.findOne({ actionId })
      .populate('modifiedBy', 'name email');
    
    if (!action) {
      return res.status(404).json({
        success: false,
        message: 'Workflow action not found'
      });
    }
    
    // Get count of workflows using this action
    const workflowCount = await Workflow.countDocuments({
      'definition.nodes.type': actionId
    });
    
    res.json({
      success: true,
      data: {
        ...action.toObject(),
        workflowCount
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create or update a workflow action
 */
export const upsertWorkflowAction = async (req, res, next) => {
  try {
    const { actionId, name, category, description, enabled, isCore, metadata } = req.body;
    
    const action = await WorkflowAction.findOneAndUpdate(
      { actionId },
      {
        actionId,
        name,
        category,
        description,
        enabled: enabled !== undefined ? enabled : true,
        isCore: isCore !== undefined ? isCore : false,
        metadata: metadata || {},
        modifiedBy: req.user._id
      },
      { upsert: true, new: true, runValidators: true }
    );
    
    // Log the action
    await AuditLog.create({
      user: req.user._id,
      organization: req.user.currentOrganization,
      action: 'workflow_action.upsert',
      resourceType: 'WorkflowAction',
      resourceId: action._id,
      details: {
        actionId,
        enabled: action.enabled
      }
    });
    
    res.json({
      success: true,
      data: action,
      message: 'Workflow action updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Disable a workflow action
 */
export const disableWorkflowAction = async (req, res, next) => {
  try {
    const { actionId } = req.params;
    const { reason } = req.body;
    
    const action = await WorkflowAction.findOne({ actionId });
    
    if (!action) {
      return res.status(404).json({
        success: false,
        message: 'Workflow action not found'
      });
    }
    
    if (!action.canDisable()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot disable core workflow action'
      });
    }
    
    // Disable the action
    await action.disable(reason, req.user._id);
    
    // Find and deactivate all workflows using this action
    const affectedWorkflows = await Workflow.find({
      'definition.nodes.type': actionId,
      active: true
    });
    
    const deactivatedWorkflowIds = [];
    for (const workflow of affectedWorkflows) {
      workflow.active = false;
      workflow.deactivatedReason = `Action "${action.name}" has been disabled by super admin`;
      await workflow.save();
      deactivatedWorkflowIds.push(workflow._id);
    }
    
    // Log the action
    await AuditLog.create({
      user: req.user._id,
      organization: req.user.currentOrganization,
      action: 'workflow_action.disable',
      resourceType: 'WorkflowAction',
      resourceId: action._id,
      details: {
        actionId,
        reason,
        affectedWorkflows: deactivatedWorkflowIds.length
      }
    });
    
    res.json({
      success: true,
      data: action,
      message: `Workflow action disabled. ${deactivatedWorkflowIds.length} workflows deactivated.`,
      affectedWorkflows: deactivatedWorkflowIds.length
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Enable a workflow action
 */
export const enableWorkflowAction = async (req, res, next) => {
  try {
    const { actionId } = req.params;
    
    const action = await WorkflowAction.findOne({ actionId });
    
    if (!action) {
      return res.status(404).json({
        success: false,
        message: 'Workflow action not found'
      });
    }
    
    // Enable the action
    await action.enable(req.user._id);
    
    // Log the action
    await AuditLog.create({
      user: req.user._id,
      organization: req.user.currentOrganization,
      action: 'workflow_action.enable',
      resourceType: 'WorkflowAction',
      resourceId: action._id,
      details: {
        actionId
      }
    });
    
    res.json({
      success: true,
      data: action,
      message: 'Workflow action enabled successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get statistics for workflow actions
 */
export const getWorkflowActionStats = async (req, res, next) => {
  try {
    const totalActions = await WorkflowAction.countDocuments();
    const enabledActions = await WorkflowAction.countDocuments({ enabled: true });
    const disabledActions = await WorkflowAction.countDocuments({ enabled: false });
    
    const actionsByCategory = await WorkflowAction.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          enabled: {
            $sum: { $cond: ['$enabled', 1, 0] }
          },
          disabled: {
            $sum: { $cond: ['$enabled', 0, 1] }
          }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    const mostUsedActions = await WorkflowAction.find()
      .sort({ usageCount: -1 })
      .limit(10)
      .select('actionId name category usageCount lastUsedAt');
    
    res.json({
      success: true,
      data: {
        total: totalActions,
        enabled: enabledActions,
        disabled: disabledActions,
        byCategory: actionsByCategory,
        mostUsed: mostUsedActions
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Sync workflow actions from node definitions
 */
export const syncWorkflowActions = async (req, res, next) => {
  try {
    const { NodeDefinition } = await import('@n8n-clone/shared');
    
    // Get all node definitions
    const nodeDefinitions = await NodeDefinition.find();
    
    let created = 0;
    let updated = 0;
    
    for (const nodeDef of nodeDefinitions) {
      const existingAction = await WorkflowAction.findOne({ actionId: nodeDef.nodeType });
      
      if (!existingAction) {
        await WorkflowAction.create({
          actionId: nodeDef.nodeType,
          name: nodeDef.name,
          category: nodeDef.category,
          description: nodeDef.description || '',
          enabled: true,
          isCore: ['manual-trigger', 'webhook-trigger'].includes(nodeDef.nodeType),
          modifiedBy: req.user._id
        });
        created++;
      } else {
        existingAction.name = nodeDef.name;
        existingAction.description = nodeDef.description || '';
        await existingAction.save();
        updated++;
      }
    }
    
    // Log the action
    await AuditLog.create({
      user: req.user._id,
      organization: req.user.currentOrganization,
      action: 'workflow_action.sync',
      resourceType: 'WorkflowAction',
      details: {
        created,
        updated
      }
    });
    
    res.json({
      success: true,
      message: `Synced workflow actions: ${created} created, ${updated} updated`,
      data: {
        created,
        updated
      }
    });
  } catch (error) {
    next(error);
  }
};
