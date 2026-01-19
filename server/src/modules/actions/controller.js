import ActionDefinition from '../../models/ActionDefinition.js';

/**
 * @swagger
 * /api/actions:
 *   get:
 *     summary: Get all published action definitions
 *     tags: [Actions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name
 *     responses:
 *       200:
 *         description: List of action definitions
 */
export const listActions = async (req, res) => {
  try {
    const { category, search } = req.query;
    
    const query = { isPublished: true };
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.$text = { $search: search };
    }

    const actions = await ActionDefinition.find(query)
      .select('-createdBy')
      .sort({ category: 1, name: 1 });

    res.json({
      actions,
      count: actions.length,
    });
  } catch (error) {
    console.error('List actions error:', error);
    res.status(500).json({ error: 'Failed to fetch actions' });
  }
};

/**
 * @swagger
 * /api/actions/{id}:
 *   get:
 *     summary: Get action definition by ID
 *     tags: [Actions]
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
 *         description: Action definition details
 */
export const getAction = async (req, res) => {
  try {
    const action = await ActionDefinition.findById(req.params.id);
    
    if (!action) {
      return res.status(404).json({ error: 'Action not found' });
    }

    res.json({ action });
  } catch (error) {
    console.error('Get action error:', error);
    res.status(500).json({ error: 'Failed to fetch action' });
  }
};

/**
 * @swagger
 * /api/actions:
 *   post:
 *     summary: Create new action definition (Super Admin only)
 *     tags: [Actions]
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
 *               - category
 *               - apiConfig
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               logo:
 *                 type: string
 *               description:
 *                 type: string
 *               apiConfig:
 *                 type: object
 *               inputSchema:
 *                 type: array
 *     responses:
 *       201:
 *         description: Action created successfully
 */
export const createAction = async (req, res) => {
  try {
    const { name, category, logo, description, apiConfig, inputSchema, outputSchema } = req.body;

    // Validate required fields
    if (!name || !category || !apiConfig) {
      return res.status(400).json({ error: 'Name, category, and apiConfig are required' });
    }

    // Create action
    const action = new ActionDefinition({
      name,
      category,
      logo,
      description,
      apiConfig,
      inputSchema: inputSchema || [],
      outputSchema: outputSchema || [],
      isPublished: true,
      createdBy: req.user._id,
    });

    await action.save();

    res.status(201).json({
      message: 'Action created successfully',
      action,
    });
  } catch (error) {
    console.error('Create action error:', error);
    res.status(500).json({ error: 'Failed to create action' });
  }
};

/**
 * @swagger
 * /api/actions/{id}:
 *   put:
 *     summary: Update action definition (Super Admin only)
 *     tags: [Actions]
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
 *         description: Action updated successfully
 */
export const updateAction = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const action = await ActionDefinition.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!action) {
      return res.status(404).json({ error: 'Action not found' });
    }

    res.json({
      message: 'Action updated successfully',
      action,
    });
  } catch (error) {
    console.error('Update action error:', error);
    res.status(500).json({ error: 'Failed to update action' });
  }
};

/**
 * @swagger
 * /api/actions/{id}:
 *   delete:
 *     summary: Delete action definition (Super Admin only)
 *     tags: [Actions]
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
 *         description: Action deleted successfully
 */
export const deleteAction = async (req, res) => {
  try {
    const { id } = req.params;

    const action = await ActionDefinition.findByIdAndDelete(id);

    if (!action) {
      return res.status(404).json({ error: 'Action not found' });
    }

    res.json({ message: 'Action deleted successfully' });
  } catch (error) {
    console.error('Delete action error:', error);
    res.status(500).json({ error: 'Failed to delete action' });
  }
};

/**
 * @swagger
 * /api/actions/categories:
 *   get:
 *     summary: Get all action categories
 *     tags: [Actions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of categories
 */
export const getCategories = async (req, res) => {
  try {
    const categories = await ActionDefinition.distinct('category');
    
    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};
