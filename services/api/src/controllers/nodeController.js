import { NodeDefinition } from '@n8n-clone/shared';
import { ALL_NODES } from '@n8n-clone/node-sdk';

export async function getNodeDefinitions(req, res) {
  try {
    const nodes = await NodeDefinition.find({
      isEnabled: true,
      deletedAt: null
    });

    res.json(nodes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getNodeDefinition(req, res) {
  try {
    const { nodeType } = req.params;

    const node = await NodeDefinition.findOne({
      nodeType,
      deletedAt: null
    });

    if (!node) {
      return res.status(404).json({ error: 'Node not found' });
    }

    res.json(node);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function createNodeDefinition(req, res) {
  try {
    const node = await NodeDefinition.create({
      ...req.body,
      createdBy: req.userId,
      isCustom: true
    });

    res.status(201).json(node);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function updateNodeDefinition(req, res) {
  try {
    const { nodeType } = req.params;

    const node = await NodeDefinition.findOne({ nodeType });
    if (!node) {
      return res.status(404).json({ error: 'Node not found' });
    }

    Object.assign(node, req.body);
    await node.save();

    res.json(node);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
